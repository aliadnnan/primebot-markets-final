# PrimeBot Markets — Bucket ID correction

## What was wrong

The code used `videos-content` and `video-thumbnails`. Your actual buckets are:

| Purpose | Actual bucket ID |
|---|---|
| Video files | `video-content` |
| Thumbnails | `video-thumbnils` |

Two differences, both easy to miss: `videos-` vs `video-`, and `-thumbnails`
vs `-thumbnils`.

One correction to the diagnosis, because it affects where to look for problems
like this in future: **nothing stale was left over from the previous fix.** Every
reference in the project was consistently `videos-content` from the start — that
is the name in your own `DATABASE_SETUP.md`, Section 4, which is where the code
originally took it from. It never matched the buckets you created. Last
release's diagnostics did exactly what it was built to do: it read the live
project, found the mismatch, and reported the real bucket list.

`video-thumbnils` is a spelling slip in the original bucket name. Supabase
bucket IDs cannot be renamed in place, and renaming would orphan every existing
object, so the code now matches the bucket rather than the other way round.

## Every active reference found and fixed

I searched all `.ts`/`.tsx` files, excluding `node_modules`, `.next` and the
`.old` backups. There were **six active code paths** with hardcoded bucket IDs:

| # | File | Operation | Was | Now |
|---|---|---|---|---|
| 1 | `app/api/admin/upload-video/route.ts` | Bucket preflight, signed upload URL, proxy fallback | `videos-content` | `VIDEO_BUCKET` |
| 2 | `app/api/admin/upload-thumbnail/route.ts` | Bucket preflight, signed upload URL, proxy fallback | `video-thumbnails` | `THUMBNAIL_BUCKET` |
| 3 | `app/api/admin/videos/route.ts` | Signed playback URLs for the admin list | both | both constants |
| 4 | `app/api/admin/videos/[id]/route.ts` | **Delete video** — removes storage objects | both | both constants |
| 5 | `app/api/videos/route.ts` | **Public playback** signed URLs | both | both constants |
| 6 | `lib/supabase-diagnostics.ts` | `REQUIRED_BUCKETS` used by Run Diagnostics | both | re-exported |

`lib/admin-upload.ts` (client-side upload + error messages) already derived its
names from `REQUIRED_BUCKETS`, so it follows automatically.

Paths 4 and 5 matter beyond upload: with the wrong bucket, **deleting a video
would have silently failed to remove the file** (leaving orphaned objects), and
**public playback of uploaded videos would have produced broken signed URLs**.
Fixing only the upload route would have left both of those broken.

### Not touched, deliberately

- `payment-proofs` bucket — 4 references, unrelated, untouched.
- `.old` backup files — inactive and unrouted by Next.js. Left byte-identical.
- Your original `.md` documentation, including `DATABASE_SETUP.md` — left as
  written. Note that Section 4 of that file still describes the buckets as
  `videos-content` / `video-thumbnails`, so it does not match your live project.
  You may want to correct it, but I did not edit your docs.

## The structural fix: this cannot happen again

New file `lib/storage-buckets.ts` is now the only place a bucket ID is written:

```ts
export const VIDEO_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET ||
  process.env.SUPABASE_VIDEO_BUCKET ||
  'video-content'

export const THUMBNAIL_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_THUMBNAIL_BUCKET ||
  process.env.SUPABASE_THUMBNAIL_BUCKET ||
  'video-thumbnils'
```

All six paths import from it. The bucket IDs can also be overridden with those
environment variables if the buckets are ever renamed — no code change or
redeploy of source needed. Leave them unset to use the values above.

## Error handling — each operation is now named separately

You asked for the failing operation to be distinguishable. It now is:

| Failure | Message you see |
|---|---|
| Video bucket missing | `Video upload failed. Storage bucket "video-content" does not exist in Supabase project "…". Buckets that DO exist: …` |
| Thumbnail bucket missing | `Thumbnail upload failed. Storage bucket "video-thumbnils" does not exist in …` — reported as a warning; the video is still saved |
| Signed URL generation failed | `Signed upload URL could not be generated for bucket "video-content" in …: <raw error>` |
| Direct storage upload failed | `Video upload failed. Upload to bucket "…" failed. Raw error from Supabase Storage: <code>: <message>` |
| Storage policy denied | `Access to bucket "…" was denied by storage policies in project "…"` |
| File over bucket limit | `The file is larger than the size limit configured on bucket "…"` |
| Database insert failed | `Database insert failed: <raw error>` — plus, if the file already uploaded: `The file DID upload successfully to storage (stored at <path>), only the database record failed.` |
| **Category reference failed** | `Category reference failed: the selected category does not exist in public.video_categories (foreign key on videos.category_id)…` (Postgres `23503`) |
| Videos table missing | `Database table missing: the videos table does not exist in the connected Supabase project…` (`42P01`) |
| Database permission denied | `Database permission denied inserting into videos - check the RLS policies…` (`42501`) |

Every branch appends the raw Supabase `code` and `message`, so nothing is
hidden behind a friendly summary. The two uploads are now labelled "Video upload
failed" / "Thumbnail upload failed" so it is never ambiguous which one broke.
The form is still never cleared on failure.

## Upload architecture — unchanged

Still the direct signed-upload flow, exactly as specified:

1. Admin opens the existing Admin Panel.
2. Admin selects a video.
3. Route verifies the bearer token and re-reads `users.is_admin` with the
   service role key.
4. Route confirms `video-content` exists, then issues a signed upload URL for it.
5. Browser PUTs the file **directly to Supabase Storage** — it does not pass
   through the Vercel serverless request body, so the ~4.5 MB cap does not apply.
6. A thumbnail, if selected, goes to `video-thumbnils` the same way.
7. The record is saved to the existing `videos` table with the selected
   `category_id`.
8. It appears in Video Management.
9. Public visibility still follows `published` + `is_public`.

No new bucket is created by any code path — buckets are only read and verified.

## Verification performed

**Source search** — zero active references to the old names:

```
grep -rn "videos-content\|video-thumbnails" --include=*.ts --include=*.tsx .
  (excluding node_modules, .next, *.old)   ->  NONE
```

**Compiled output** — the check that matters, since the deployed site runs the
build, not the source. Every server route bundle and the admin client chunk:

```
upload-video/route.js       old=(none)   new=video-content, video-thumbnils
upload-thumbnail/route.js   old=(none)   new=video-content, video-thumbnils
api/videos/route.js         old=(none)   new=video-content, video-thumbnils
api/admin/videos/route.js   old=(none)   new=video-content, video-thumbnils
client chunks               old=(none)
```

**Resolved values at runtime:**

```
VIDEO_BUCKET     = video-content
THUMBNAIL_BUCKET = video-thumbnils
```

**Build:** `tsc --noEmit` clean; `next build` exit 0, 36/36 static pages.

**Runtime** (`next start`): `POST /api/admin/upload-video` → 401 without a
token; `GET /api/admin/diagnostics` → 403 without admin; `/`, `/admin`,
`/video-tutorials`, `/bots`, `/faq`, `/pricing` → all 200.

`sql/03_verify_storage_buckets.sql` now queries the correct IDs.

## What to do

1. Deploy.
2. **Admin Panel → Video Tutorials → Run Diagnostics.** Both bucket lines should
   now read OK, and the project should show `fzepghuiqnmbfehnrgrc`.
3. Upload a video over 5 MB.

If Run Diagnostics shows the buckets OK but the upload still fails, the next
likely cause is storage policies on `storage.objects` for these two bucket IDs —
policies written against `videos-content` would not apply to `video-content`.
Query 3 in `sql/03_verify_storage_buckets.sql` lists them. The upload error will
say `Access to bucket "video-content" was denied by storage policies` if that is
what is happening.

### What I could not verify

I have no access to your Supabase project, so I could not perform a real upload.
What I did verify is that the correct bucket IDs are present in the compiled
build and that no active code path requests the old ones. Whether
`fzepghuiqnmbfehnrgrc` has storage policies covering these bucket IDs is
something only a real upload or Query 3 will show.
