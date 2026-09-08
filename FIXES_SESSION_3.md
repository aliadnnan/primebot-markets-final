# PrimeBot Markets — Upload & Admin Session Fixes (read this first)

**Change summary, measured against the ZIP you just uploaded**

| | Count |
|---|---|
| Existing files modified | 18 |
| New files created | 11 (incl. the three FIXES documents) |
| Files deleted | 0 |
| Duplicate Admin Panels / video systems / category systems / buckets created | 0 |
| New Supabase buckets created | 0 |

---

## 1. Important: which base this was built from

I used the ZIP you uploaded as the base, as instructed. You should know one
thing about it before reading further.

**The ZIP you uploaded is older than the project I delivered previously.** File
comparison shows it is the original project plus changes to exactly two files:

- `lib/auth-context.tsx`
- `app/admin/VideoManagement.tsx`

None of the earlier work was in it. Missing entirely: the Video Categories /
Manage Categories UI, the category CRUD API, the "More Information" contact
section, the two build-blocker fixes, and both SQL files.

So I did two things:

1. Used your uploaded ZIP as the base, keeping every file in it.
2. Re-applied the earlier fixes on top, so this delivery is not a regression.

That is why 18 files are modified rather than just the two or three needed for
the two reported problems. **If you would rather I had worked from a different
ZIP, say so and I will redo it against that one.**

### The two files that had already been changed

Someone had already attempted the same class of fix in those two files. The
intent was right; the implementation had problems, so I replaced both with the
tested versions. Nothing was lost — every behaviour those edits added is present
here, done differently. Two specific reasons:

**A client-writable authorization cache.** The previous edit cached the admin
flag in browser storage:

```js
sessionStorage.setItem(`primebot-admin-${userId}`, nextIsAdmin ? 'true' : 'false')
```

and on load trusted it:

```js
hasCachedAdmin = sessionStorage.getItem(`primebot-admin-${currentUser.id}`) === 'true'
if (hasCachedAdmin) setIsAdmin(true)
```

Any signed-in customer could open devtools, set that one key to `'true'`, reload
`/admin`, and be shown the Admin Panel interface. Your server-side checks would
still have refused to return any data, so nothing could actually be read or
changed — but presenting a working-looking admin panel to a non-admin is not
acceptable. The verified result now lives **only in memory** (a React ref), which
cannot be edited from devtools and disappears on reload. Any leftover
`primebot-admin-*` keys are deleted from your browser on next load.

**It also did not fully solve the problem.** `SIGNED_IN` still triggered a
re-verification, and that handler still called `setIsAdmin(false)` on a failed
check. Since (see below) `SIGNED_IN` fires on *every* return to the tab, one
flaky network moment would still have reset the panel mid-upload.

The draft feature was moved from `localStorage` to `sessionStorage`. Stored in
`localStorage` it never expired: the draft stayed readable on the machine
indefinitely, long after the admin finished, which matters on a shared computer.
`sessionStorage` survives refreshes and back-navigation but is discarded when the
tab closes. The old `primebot-video-upload-draft-v1` key is cleaned up
automatically.

---

## 2. Problem 1 — "Uploading..." never completes

### Root cause

`/api/admin/upload-video` received the entire file as a `FormData` request body
and then re-uploaded it to Supabase from the server. **A Vercel serverless
function request body is capped at roughly 4.5 MB.**

Your form advertises `Max size: 500MB`. Every realistic video was therefore
rejected by the Vercel platform *before it ever reached your route handler*. The
browser saw a failed request, the old code turned that into a generic toast, and
the form sat on "Uploading...". The video never disappeared or cancelled itself —
it was never able to leave the browser. Your 5 MB thumbnail limit was over the
cap too.

This is exactly the possibility you raised in your request, and it is what was
happening.

### Fix — the file now goes browser → Supabase directly

Both existing upload routes (`upload-video`, `upload-thumbnail`) now accept a
JSON request and return a **signed upload URL** created with
`createSignedUploadUrl()`. The bytes then travel straight from the browser to
your existing `videos-content` / `video-thumbnails` buckets, so the serverless
body cap does not apply at all.

Security is unchanged: the route still verifies the bearer token and re-reads
`users.is_admin` with the service role key **before** issuing the URL, the
object path is generated server-side (the browser never chooses where the file
lands), and file type and size are validated there. The URL is scoped to one
single object.

No new bucket was created and no bucket setting was changed. Both remain
private, and public viewing continues to work through the 1-hour signed URLs the
app already generates on read — which is the arrangement you described as
acceptable.

`lib/admin-upload.ts` implements the client side with three ordered strategies,
so a single failure mode cannot block you:

1. **`signed-direct`** — `XMLHttpRequest` PUT to the signed URL. Primary path.
   This is also what gives **real byte-level progress**, replacing the previous
   hardcoded 25 / 50 / 75 steps that reported nothing about the actual transfer.
2. **`signed-client`** — retry via `supabase.storage.uploadToSignedUrl()` with
   the same token if the direct PUT fails.
3. **`server-proxy`** — the original route, kept for small files and local
   development. A 413 here now names the file size explicitly.

### "Uploading..." can no longer hang forever

A dead connection mid-transfer fires no `load`, `error` or `timeout` event on an
XHR, so the form could sit on "Uploading..." indefinitely with no way out. Three
guards now guarantee the upload always ends in either success or a real message:

- **Stall detector** — if the transfer makes no progress for 90 seconds, it is
  aborted with: *"The upload stopped making progress for 90 seconds and was
  stopped. Your form has been kept."* The clock resets on every progress event,
  and keeps running while a slow server finishes processing, so a genuinely slow
  upload is never killed.
- **30-second timeout** on issuing the signed URL.
- **30-second timeout** on the database insert.
- Plus a **Cancel Upload** button, so stopping is something you do deliberately.

### Nothing is cleared on failure

The submit handler was restructured so **only the success path** resets the form.
On any failure your title, description, category, link and selected file stay
exactly as they were, and the real error appears in a red panel inside the form
with the note "Nothing was cleared."

Related fixes:

- **Partial success is reported honestly.** If the file uploads but the database
  insert fails, the error names the storage path where the file landed and says
  the upload itself worked, instead of implying everything failed.
- **A thumbnail failure no longer loses the video** — reported as a warning; the
  video is still saved.
- **Specific validation messages** ("Please select a category. If the list is
  empty, add one under Video Categories first.") instead of one generic message.
- Removed `required` from the video link input, which blocked submitting when
  the form was switched back to file-upload mode.
- `DELETE` no longer passes external YouTube/TikTok URLs to `storage.remove()`.
- `PUT` no longer risks overwriting a stored storage path with an expiring
  signed URL — `video_url` is written only when a replacement is explicitly
  supplied.

---

## 3. Problem 2 — "Verify Admin" reappearing during use

### Root cause

`supabase-js` registers a `visibilitychange` listener on the window. Confirmed
directly in the installed library
(`node_modules/@supabase/auth-js/dist/main/GoTrueClient.js`):

```js
window.addEventListener('visibilitychange', this.visibilityChangedCallback)
```

Every time the tab goes from hidden back to visible, that callback runs
`_recoverAndRefresh()`, which ends in:

```js
await this._notifyAllSubscribers('SIGNED_IN', currentSession)
```

It emits a **fresh `SIGNED_IN` event even though nothing about the session
changed**. The same happens on every `TOKEN_REFRESHED`, and both are mirrored
across tabs.

Any handler that re-runs verification on `SIGNED_IN` therefore re-runs it every
single time you switch to ChatGPT and come back. When that verification resets
the loading/admin state, `/admin` falls back to its "Verifying admin access..."
screen — and that screen **unmounts the whole panel**:

```
switch to ChatGPT and back
  → visibilitychange → supabase emits SIGNED_IN
  → verification state reset → "Verifying admin access..." renders
  → <VideoManagement /> unmounts
  → title, description, category and the selected File object all destroyed
  → an in-flight upload has no component left to report back to
```

### Fix — four layers, so no single mistake can reset the panel again

**1. The auth context no longer re-verifies a known administrator.**
The resolved result is cached in memory against the user id:

```ts
const verifiedRef = useRef<{ userId: string; isAdmin: boolean } | null>(null)
```

A repeat event for the same already-verified user returns immediately without
touching `user`, `isAdmin`, `adminChecked` or `loading`, so React never
re-renders into a loading state and nothing unmounts. A blocking check happens
only when the user id actually changes or on first resolution. An in-flight
guard stops `INITIAL_SESSION` and `SIGNED_IN` racing into duplicate checks on
first load.

Staleness is handled by a background re-check that runs at most every 10 minutes
and **never** touches `adminChecked`. A transient failure during it is ignored —
the trusted answer is kept rather than downgraded to "not an admin". Only a
definitive change updates state, so genuine revocation still works and gets its
own "Admin access removed" screen.

**2. The Admin Panel latches its verified state.** Once an administrator has
been confirmed, every gate screen is skipped and the panel renders
unconditionally. The latch drops only on a real sign-out.

**3. `/admin` never redirects to the public homepage on an authorization
result.** A non-admin gets an in-page Access Denied panel; a failed check gets a
"Could not verify access" panel with a retry button. Only a completely absent
session redirects, and that goes to `/auth/login?redirect=/admin`.

**4. Switching admin tabs no longer unmounts the form.** `<VideoManagement />`
was mounted conditionally on the active tab, so any tab change destroyed it —
including via the Manage Categories button. It is now rendered once and hidden
with CSS:

```tsx
<div className={activeTab === 'videos' ? '' : 'hidden'}>
```

`display: none` preserves React state and the `File` object; unmounting does not.

Session persistence is now stated explicitly in `lib/supabase/client.ts`
(`persistSession`, `autoRefreshToken`, `detectSessionInUrl`).

**No middleware was added.** This project's session lives in `localStorage`,
which Next.js edge middleware cannot read — a middleware guard on `/admin` would
find no session and lock everyone out, including you. The client-side gate plus
server-side enforcement on every admin API route is the correct design here.

---

## 4. Draft protection

Beyond preventing the resets above, `lib/video-draft.ts` persists the form to
`sessionStorage`: title, description, category, link, source type, and the
publish / public / autoplay flags. Restored with a clear **"Draft restored"**
banner. Cleared **only** on a successful upload or an explicit discard.

**Cancel** now asks before discarding. The **×** button closes the modal while
*keeping* the draft, so closing it by accident loses nothing. The modal cannot
be closed at all mid-upload, and a `beforeunload` warning fires if you try to
refresh or close the tab while an upload is running.

### The one thing that genuinely cannot be preserved

A `File` is a browser-granted handle to a file on disk. Browsers deliberately do
not let a page serialise or restore that handle across a reload — it would let a
site silently regain access to a local file. **No website can restore a selected
file after a full page refresh.** This matches what you already noted in your
request.

So the draft stores the file *name* and the form tells you exactly what to do:

> Your text was saved. Browsers cannot keep a selected file across a page
> reload, so please choose "my-video.mp4" again below.

Everything else is preserved, and the file needs one click. Within normal use —
tab switching, switching to ChatGPT, moving between admin tabs — the file is now
kept too, because nothing unmounts.

---

## 5. Category system

Still connected to `public.video_categories` **only**. No second table, no
duplicate system:

| Consumer | Endpoint | Table |
|---|---|---|
| Upload form dropdown | `GET /api/videos/categories` | `public.video_categories` |
| Video Categories tab | `GET/POST /api/admin/categories` | `public.video_categories` |
| Manage Categories button | same tab | `public.video_categories` |
| Public page filters | `GET /api/videos/categories` | `public.video_categories` |
| Saved with each video | `videos.category_id` FK | → `video_categories(id)` |

Because the uploaded ZIP had no category management UI at all, that has been
re-applied: a third **Video Categories** tab on the existing Admin Panel, a
**Manage Categories** button in Video Management, and view / add / edit / delete
with a per-category video count. Categories are reloaded every time the upload
form opens, so one added moments earlier is immediately selectable.

Your existing categories — the bot names and tutorial categories — load from
that one table and are neither deleted nor duplicated. Nothing in this delivery
writes sample or dummy categories.

**One safety guard:** your schema declares
`category_id ... REFERENCES video_categories(id) ON DELETE CASCADE`, so deleting
a category would silently delete every video in it. Deletion is now refused with
a count, and the UI demands an explicit second confirmation naming how many
videos would be destroyed.

---

## 6. Optional SQL (not required)

`sql/01_video_visibility_and_autoplay.sql` adds `is_public` and `autoplay` to
`videos` and tightens one SELECT policy, enabling the Public/Private and
Autoplay controls. **I have not run any SQL against your database** — I have no
access to it.

The app works before and after: until it is run, those two checkboxes are
accepted but ignored, published videos behave exactly as they do now, and the
Admin Panel shows a notice explaining why. Everything else here needs no
database change.

`sql/02_diagnose_video_categories.sql` is **read-only** (SELECTs only) — use it
if the category dropdown ever looks empty.

---

## 7. Two pre-existing build blockers (re-applied)

`next build` **fails** on the uploaded ZIP:

```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
Failed to collect page data for /api/admin/approve
```

`lib/email.ts` called `new Resend(process.env.RESEND_API_KEY)` at module scope.
Next.js evaluates API route modules during the build, so a missing
`RESEND_API_KEY` — the default on a fresh Vercel project — was a hard build
failure. The client is now created lazily; a missing key skips the email with a
warning instead of crashing the operation that triggered it (such as approving
an order).

`lib/supabase/server.ts` had a module-level
`throw new Error('Missing Supabase environment variables')` with the same
effect. That is now an exported flag, so a missing variable surfaces as a clear
runtime error rather than an unexplained build failure.

Without these two, this project cannot deploy to Vercel at all.

---

## 8. Verification performed

From the delivered ZIP, after a clean `npm install`:

- `tsc --noEmit` — clean
- `next build` — exit code 0, "Compiled successfully"
- Route table contains no new pages and no duplicates

Runtime, under `next start`:

| Route | Result |
|---|---|
| `/`, `/bots`, `/pricing`, `/faq`, `/support`, `/performance`, `/dashboard`, `/video-tutorials`, `/payment`, `/auth/login`, `/legal/privacy` | 200 |
| `/admin` | 200, real Admin Panel, no redirect to `/` |

Authorization, with no token and with a forged token:

| Endpoint | No auth | Forged token |
|---|---|---|
| `POST /api/admin/upload-video` (signed-URL mode) | 401 | 401 |
| `POST /api/admin/upload-thumbnail` (signed-URL mode) | 401 | 401 |
| `GET /api/admin/categories` | 403 | 403 |
| `GET /api/admin/videos` | 401 | — |

The footer contact section, `tel:+923004587593` and `wa.me/923014879047` all
render on the public site. (Note: the WhatsApp links in the uploaded ZIP were
broken — `wa.me/03014879047` is rejected as an invalid number. `wa.me` needs
international format without the leading zero: `923014879047`.)

### What I could not verify myself

No access to your Supabase project or a real browser session, so these need you:

1. Sign in as admin, open `/admin`, switch to ChatGPT for a minute, come back —
   the panel should still be there, with **no** "Verifying admin access..."
   reappearing.
2. Open Upload Video, fill in title, description and category, choose a file,
   switch tabs and return — everything including the file should still be there.
3. Click Manage Categories, then Back to Videos — the form should be intact.
4. **Upload a video larger than 5 MB.** This is the case that could not
   physically work before. Watch for real percentage progress.
5. The video appears in Video Management with the correct category.
6. Force a failure (go offline mid-upload) — a real error should appear and
   nothing should be cleared.

If step 4 still fails, open the Network tab and look at the response body of the
`POST /api/admin/upload-video` request — it now returns the real reason. Check
that the `videos-content` bucket exists and that the storage policies from
Section 4 of `DATABASE_SETUP.md` were applied, since the signed URL is issued
with the service role key but the object write is still subject to bucket
configuration.
