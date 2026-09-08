# PrimeBot Markets — "The related resource does not exist" — traced

## The answer, up front

That message is emitted by **Supabase Storage**, not by your database, not by
PostgREST, and not by any code in this project. I traced it to its definition in
the `supabase/storage` source:

```ts
// supabase/storage — src/internal/errors/codes.ts, line 482
RelatedResourceNotFound: (e?: Error) =>
  new StorageBackendError({
    code: ErrorCode.InvalidRequest,
    httpStatusCode: 404,
    message: `The related resource does not exist`,
    originalError: e,
  }),
```

Storage raises it when an **object write has no related bucket row** — that is,
when you upload to a bucket that does not exist in the project being written to.

So the failing resource is the **`videos-content` storage bucket**. It is either

- not created in the Supabase project your deployed site is connected to, or
- created with a slightly different id (ids are case-sensitive: `videos_content`,
  `Videos-Content` and `videos` are all different buckets), or
- created in a **different Supabase project** than the one your Vercel
  environment variables point at — the possibility you raised, and the one this
  release can now prove or disprove for you in one click.

### Why it failed *after* the upload started rather than immediately

`createSignedUploadUrl()` does **not** verify that the bucket exists. It only
signs a token for `<bucket>/<path>`. So the old flow was:

1. Server issues a signed URL for `videos-content` — **succeeds even when the
   bucket is missing**, because nothing is checked.
2. Browser starts PUTting your 24.3 MB file.
3. Storage tries to create the object row, finds no matching bucket, and returns
   404 `RelatedResourceNotFound`.

That is exactly the behaviour you saw: the form filled in correctly, the upload
appeared to begin, then failed with a message that named no resource.

---

## What I ruled out, and how

| Candidate | Verdict | Evidence |
|---|---|---|
| `videos-content` bucket | **This is it** | Message is Storage's `RelatedResourceNotFound` (404), raised when an object has no parent bucket |
| `video-thumbnails` bucket | Not the trigger here | The video is uploaded first; a thumbnail failure is reported separately and no longer blocks the video |
| Storage object path | Ruled out | The path is server-generated and unique per upload; a bad path yields `InvalidKey`, not this message |
| Signed upload URL | Ruled out | A failure here never reaches the PUT — it returns from the route with a different error. Signing succeeded |
| `videos` table | Ruled out | A missing table gives Postgres `42P01` via PostgREST, and only after the file upload completes |
| `video_categories` table | Ruled out | Same as above |
| Foreign key `videos.category_id` | Ruled out | Gives Postgres `23503` "violates foreign key constraint … is not present in table", not this string |
| Any other Supabase resource | Ruled out | The string appears nowhere in `@supabase/*` client packages (grepped) and is not in the public Storage error-code table — it is only in the Storage server source |

I also confirmed the string is **not** in `@supabase/storage-js`,
`@supabase/postgrest-js` or `@supabase/auth-js` in `node_modules`, so it could
only have arrived over the wire from the Storage service.

---

## Fix 1 — the failure is now caught before the upload starts, and names the resource

Both upload routes now **verify the bucket exists before issuing a signed URL**.
If it is missing you get, immediately and before a single byte is sent:

> Storage bucket "videos-content" does not exist in Supabase project
> "abcdefgh". Buckets that DO exist in this project: avatars, payment-proofs.
> Create a bucket with the exact ID "videos-content" (IDs are case-sensitive) in
> that project, or point this deployment's environment variables at the Supabase
> project where it already exists.

Note that it **lists the buckets that do exist**. If your buckets are in a
different project, that list will look unfamiliar — which tells you immediately
that the env vars point somewhere else. If the list shows something like
`videos_content`, that is a naming mismatch.

The server also logs a structured line (`[upload] Missing bucket.`) with the
expected bucket, the project ref and the available buckets, so it appears in your
Vercel function logs.

## Fix 2 — every storage error now names the exact failing operation

`describeStorageError()` translates the raw Storage response into a specific
sentence instead of passing through Storage's terse wording:

| Storage response | What you now see |
|---|---|
| 404 `The related resource does not exist` | Storage bucket "X" does not exist in Supabase project "ref" … |
| 404 `NoSuchBucket` / Bucket not found | Storage bucket "X" was not found in project "ref". Check the id spelling (case-sensitive) … |
| 403 `AccessDenied` | Access to bucket "X" was denied by storage policies in project "ref" … |
| 403 signature error | The signed upload URL was rejected as invalid — the service role key may not belong to project "ref" … |
| 401 `InvalidJWT` | The signed upload URL was rejected as expired or malformed … |
| 413 `EntityTooLarge` | The file is larger than the size limit configured on bucket "X" … |
| 400 `InvalidMimeType` | Bucket "X" does not allow this file's MIME type … |
| 409 already exists | An object already exists at that path … |
| `TenantNotFound` | Project "ref" has no storage service provisioned … |
| anything else | Full raw `code` and `message` from Storage, verbatim |

Every branch also appends the raw Storage error, so nothing is hidden. The
browser console gets a structured `[upload] Storage rejected the upload.` entry
with bucket, project ref, HTTP status, code, message and the first 500 bytes of
the response body.

I verified this translation against the **exact** JSON body Storage returns:

```
INPUT   {"statusCode":"404","code":"InvalidRequest","message":"The related resource does not exist"}
OUTPUT  Storage bucket "videos-content" does not exist in Supabase project "…" …
```

## Fix 3 — "Run Diagnostics" answers the project-mismatch question directly

New admin-only button in **Admin Panel → Video Tutorials → Run Diagnostics**
(endpoint: `GET /api/admin/diagnostics`, returns 403 to non-admins — verified).

It reports, from inside the running deployment:

1. `NEXT_PUBLIC_SUPABASE_URL` and the **project ref** parsed from it.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` — present, format, `role` claim, and the
   **project ref decoded from the key itself**.
3. `SUPABASE_SERVICE_ROLE_KEY` — the same, and a hard failure if its `role`
   claim is not `service_role` (i.e. the wrong key was pasted in).
4. **Project match** — whether the URL, the anon key and the service key all
   belong to the same project. A mismatch is reported as a `FAIL` naming all
   three refs.
5. **Every bucket that exists** in the connected project.
6. Whether `videos-content` and `video-thumbnails` exist, with each one's
   `public` flag, `file_size_limit` and `allowed_mime_types`.
7. A live signed-upload-URL probe for each bucket.
8. Whether `public.videos`, `public.video_categories` and `public.users` exist
   and are readable, with row counts.
9. Whether any categories exist — because `videos.category_id` is `NOT NULL` and
   references `video_categories(id)`, so saving a video fails until one does.

The project refs are read by base64-decoding the **payload** of the Supabase
keys, which carry `{ iss, ref, role }`. No key material is ever returned to the
browser — only the ref (already public in the URL) and the role. Newer
`sb_publishable_…` / `sb_secret_…` keys are not JWTs; that is reported as such
rather than treated as an error.

Tested with deliberately mismatched credentials:

```
CASE A  url=projectaaa  anon=projectAAA  service=projectaaa   -> OK   (case difference is not a mismatch)
CASE B  url=projectaaa  anon=projectAAA  service=projectbbb   -> FAIL "MISMATCH. URL project: projectaaa; anon key project: projectAAA; service key project: projectbbb"
CASE C  service key carrying role "anon"                      -> FAIL "carries role \"anon\", not \"service_role\". The wrong key was pasted into this variable."
```

Case A exposed a real bug in my first version — the comparison was
case-sensitive and would have reported a false mismatch. Fixed and retested.

## Fix 4 — `sql/03_verify_storage_buckets.sql`

Read-only (SELECTs only). This is the other half of the mismatch test:

1. Run **Run Diagnostics** — it prints the project the *deployed site* uses.
2. Run this file in the SQL Editor of the project you *believe* is correct.

If the two differ, the site is connected to a different project than the one
holding your buckets. The file also lists every bucket in that project, the
storage policies, object counts, the public tables, the category count, and the
`videos.category_id` foreign key with its delete rule.

---

## What you need to do

1. Deploy this build.
2. **Admin Panel → Video Tutorials → Run Diagnostics.**
3. Read the `Bucket "videos-content"` line.

- **FAIL, and the bucket list looks unfamiliar** → your Vercel env vars point at
  the wrong Supabase project. Fix `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to the project
  that has your data, then redeploy (env var changes need a redeploy to apply).
- **FAIL, and the bucket list is your normal one** → the bucket genuinely is not
  there. Create it: Storage → New bucket → id `videos-content`, Public **off**,
  file size limit 500 MB. Then apply the storage policies from Section 4 of
  `DATABASE_SETUP.md`. Do the same for `video-thumbnails` (5 MB) if it also
  fails. Private is correct — the app serves videos through signed URLs.
- **Project match = FAIL** → fix that first; it makes every other result
  unreliable.
- **All OK but upload still fails** → retry the upload. The error message will
  now name the exact operation and resource, and the browser console will hold
  the structured `[upload]` entry.

---

## Change summary (measured against the ZIP you uploaded)

| | Count |
|---|---|
| Existing files modified | 18 |
| New files created | 15 (incl. the four FIXES documents and three SQL files) |
| Files deleted | 0 |
| Duplicate video systems / category systems / Admin Panels / buckets created | 0 |
| New Supabase buckets created by code | 0 — buckets are only read and verified, never created |

This round specifically: `lib/admin-upload.ts`, `lib/supabase/client.ts`,
`app/api/admin/upload-video/route.ts`,
`app/api/admin/upload-thumbnail/route.ts`, `app/admin/VideoManagement.tsx`
modified; `lib/supabase-diagnostics.ts`,
`app/api/admin/diagnostics/route.ts`, `sql/03_verify_storage_buckets.sql` and
this document added.

### One more build fragility fixed

`lib/supabase/client.ts` called `createClient(url, key)` at module scope with
empty strings when the variables were unset. `createClient('')` throws
`supabaseUrl is required`, and Next.js evaluates that module while prerendering,
so a missing variable failed `next build` with an error that never named the
variable. Now the build succeeds either way and the missing variable is reported
by Run Diagnostics instead. Verified:

```
build with NO env vars at all  -> exit 0, 37/37 pages
build with env vars            -> exit 0, 37/37 pages
```

## Verification performed

- `tsc --noEmit` — clean
- `next build` — exit 0, both with and without environment variables
- `GET /api/admin/diagnostics` — 403 with no token, 403 with a forged token
- `POST /api/admin/upload-video` — 401 with no token
- `/`, `/admin`, `/video-tutorials`, `/bots`, `/faq` — all 200
- Error translation unit-tested against the exact Storage JSON body
- Project-mismatch detection unit-tested across three cases

### What I still cannot verify

I have no access to your Supabase project or your Vercel environment variables,
so I cannot tell you *which* of the three causes above applies — only that the
missing resource is the `videos-content` bucket relative to the project your
deployment is connected to. **Run Diagnostics will tell you which**, and that is
the one output I need from you if this is still failing.
