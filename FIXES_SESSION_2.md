# PrimeBot Markets — Admin Session & Video Upload Fixes

Second round of fixes, applied on top of `FIXES_APPLIED.md`. The four reported
problems turned out to share **one root cause**, plus one independent
infrastructure limit.

**Change summary**

| | Count |
|---|---|
| Existing files modified | 6 |
| New files created | 3 (incl. this document) |
| Files deleted | 0 |
| New database changes required | 0 |
| Duplicate Admin Panels / video systems / category systems created | 0 |

No SQL is needed for this round. `public.video_categories` and the `videos`
table are untouched.

---

## The single root cause behind Problems 1, 2 and 3

`supabase-js` registers a `visibilitychange` listener on the browser window.
Confirmed directly in the installed library
(`node_modules/@supabase/auth-js/dist/main/GoTrueClient.js`):

```js
window.addEventListener('visibilitychange', this.visibilityChangedCallback)
```

Every time the tab goes from hidden back to visible, that callback runs
`_recoverAndRefresh()`, which ends in:

```js
await this._notifyAllSubscribers('SIGNED_IN', currentSession)
```

It fires a **fresh `SIGNED_IN` event even though nothing about the session
changed**. The same happens on every `TOKEN_REFRESHED` auto-refresh, and both
are mirrored across browser tabs.

My `onAuthStateChange` handler treated all of those as a new sign-in. It called
`setAdminChecked(false)` on each one, and `app/admin/page.tsx` rendered its
"Verifying admin access..." screen whenever `adminChecked` was false.

That produced the following chain on **every single tab switch**:

```
switch to ChatGPT and back
  → visibilitychange
  → supabase emits SIGNED_IN
  → setAdminChecked(false)
  → /admin renders "Verifying admin access..."
  → <VideoManagement /> UNMOUNTS
  → all form state destroyed, including the selected File object
  → an in-flight upload has no component left to report back to
```

So the repeated "Verify Admin" message (Problem 1), the vanishing form data
(Problem 2), and the upload that looked cancelled (Problem 3) were all the same
bug — and it was introduced by my previous fix for the `/admin` redirect. That
gate was correct about *when* to decide, but wrong to tear the panel down every
time it re-decided.

### Fix — three layers, so no single mistake can unmount the panel again

**1. The auth context no longer re-verifies a known administrator.**
`lib/auth-context.tsx` now caches the resolved result against the user id:

```ts
const verifiedRef = useRef<{ userId: string; isAdmin: boolean } | null>(null)
```

A repeat event for the **same already-verified user** returns immediately
without touching `user`, `isAdmin`, `adminChecked` or `loading` — so React does
not re-render into a loading state and nothing unmounts. A blocking check now
only happens when the user id actually changes or on first resolution. An
in-flight guard (`pendingUserIdRef`) stops `INITIAL_SESSION` and `SIGNED_IN`
racing into two duplicate checks on first load.

Staleness is handled by `revalidateAdminStatusSilently()`, which re-checks in
the background at most every 10 minutes and **never** flips `adminChecked`. A
transient network failure during revalidation is ignored — the trusted answer is
kept rather than downgraded to "not an admin". Only a definitive change (a real
grant or revocation) updates state.

**2. The Admin Panel latches its verified state.**
`app/admin/page.tsx` sets `verifiedOnce` the first time an administrator is
confirmed. Once latched, `gateResolved` is true and every gate screen is
skipped, so the panel renders unconditionally. The latch drops only on a genuine
sign-out. Genuine server-side revocation is handled separately with a distinct
"Admin access removed" screen, so revoking permissions still works.

The orders/stats effect is now keyed on `user?.id` rather than the `user`
object. Supabase hands out a new object on each token refresh, and depending on
the object refetched orders and stats on every tab switch.

**3. Switching admin tabs no longer unmounts the form.**
`<VideoManagement />` was mounted conditionally on `activeTab === 'videos'`. Any
tab change destroyed it — including via the "Manage Categories" button I added
last round, which switches tabs. It is now rendered once and hidden with CSS:

```tsx
<div className={activeTab === 'videos' ? '' : 'hidden'}>
  <VideoManagement … />
</div>
```

`display: none` preserves React state and the `File` object; unmounting does not.

**4. Session persistence is now explicit** in `lib/supabase/client.ts`
(`persistSession`, `autoRefreshToken`, `detectSessionInUrl`) rather than relying
on defaults, so the intent is stated in the code.

**No middleware was added or changed**, for the reason given in
`FIXES_APPLIED.md`: this project's session lives in `localStorage`, which edge
middleware cannot read.

---

## Problem 2 — draft persistence for a real page refresh

The unmount fix covers tab switches and navigating away. A genuine **page
refresh** still wipes React state, so `lib/video-draft.ts` adds explicit draft
persistence in `sessionStorage`:

- Saved on every form change: title, description, category, link, source type,
  and the publish / public / autoplay flags.
- Restored when the Video Tutorials tab opens, with a clear **"Draft restored"**
  banner and a **Discard draft** button.
- Cleared **only** on a successful upload or an explicit discard.
- Survives a refresh and back-navigation; discarded when the tab closes.

### The one thing that genuinely cannot be preserved

A `File` object is a handle to a file on disk that the user granted the page
access to. Browsers deliberately do not let a site serialise or restore that
handle — it would let a page silently regain access to a local file across
reloads. **No web application can restore a selected file after a refresh.**

Rather than presenting a mysteriously empty file input, the draft stores the
file *name* and the form says exactly what to do:

> Your text was saved. Browsers cannot keep a selected file across a page
> reload, so please choose "my-video.mp4" again below.

Also fixed: **Cancel** now asks before discarding, and the **×** button closes
the modal while *keeping* the draft, so accidentally closing it loses nothing.

---

## Problem 3 — the independent cause: uploads could not physically succeed

Beyond the unmount, there was a hard infrastructure limit.

`/api/admin/upload-video` received the whole file as a `FormData` body and
re-uploaded it to Supabase from the server. **A Vercel serverless function
request body is capped at roughly 4.5 MB.** The form advertises "Max size:
500MB", so any realistic video was rejected by the platform before it ever
reached the route handler. The browser saw a failed request, the old code
swallowed the detail into a generic toast, and the upload appeared to cancel
itself. The 5 MB thumbnail limit was over the cap too.

### Fix — upload directly from the browser to Supabase Storage

Both upload routes now accept a JSON request and return a **signed upload URL**
via `createSignedUploadUrl()`. The bytes then travel browser → Supabase,
completely bypassing the serverless body cap. Admin authorization is still
enforced in the route *before* the URL is issued, the object path is generated
server-side (the client never chooses where the file lands), and the file type
and size are validated there as well.

`lib/admin-upload.ts` implements the client side with three ordered strategies:

1. **`signed-direct`** — `XMLHttpRequest` PUT to the signed URL. This is also
   what gives **real byte-level progress**, replacing the previous fake
   25 / 50 / 75 steps that told the administrator nothing.
2. **`signed-client`** — retry through `supabase.storage.uploadToSignedUrl()`
   with the same token if the direct PUT fails.
3. **`server-proxy`** — the original FormData route, kept as a fallback for
   small files and local development. A 413 from this path now reports the size
   explicitly instead of failing opaquely.

The multipart body sent in step 1 mirrors exactly what `supabase-js` sends for a
Blob upload (a `cacheControl` field plus the file under an empty field name,
with `x-upsert` as a header and `Content-Type` left to the browser so it can set
the multipart boundary).

### Nothing is cleared on failure any more

The submit handler was restructured so that **only the success path** calls
`resetForm()`. On any failure the typed values and the selected file stay
exactly as they were, and the real error is shown in a red panel inside the form
with the note "Nothing was cleared."

Other upload fixes:

- **Partial success is reported honestly.** If the file uploads but the database
  insert fails, the error names the storage path where the file landed and says
  the upload itself worked, instead of implying the whole thing failed.
- **A thumbnail failure no longer loses the video.** It is reported as a warning
  and the video is still saved.
- **Real cancellation** via an `AbortController` and a Cancel Upload button —
  cancelling is now something the administrator does deliberately, not something
  that appears to happen on its own.
- **A `beforeunload` warning** while an upload is running.
- **The modal cannot be closed mid-upload** by accident.
- **The selected file is shown** with its name and size, so it is obvious
  whether one is attached.
- **Validation messages are specific** ("Please select a category. If the list
  is empty, add one under Video Categories first.") instead of one generic
  "Please fill in all required fields".
- Removed `required` from the video link input, which blocked submission when
  the form was switched back to file-upload mode.

---

## Problem 4 — the category system is untouched

Deliberately **no change** was made to the category system this round. It still
reads and writes `public.video_categories` only:

| Consumer | Endpoint | Table |
|---|---|---|
| Upload form dropdown | `GET /api/videos/categories` | `public.video_categories` |
| Video Categories tab | `GET/POST /api/admin/categories` | `public.video_categories` |
| Public page filters | `GET /api/videos/categories` | `public.video_categories` |
| Saved with each video | `videos.category_id` FK | → `video_categories(id)` |

No second category table, no duplicate system. Categories you have already added
— including the ones named after your bots — load from that one table.

Two things in this round actively help the dropdown: the selected category now
survives a tab switch (it was being lost with the rest of the form), and it is
restored from the draft after a refresh. Categories are still reloaded each time
the upload form opens, so a category added moments earlier is immediately
selectable.

---

## Verification performed

Build and typecheck, from the delivered ZIP:

- `tsc --noEmit` — clean
- `next build` — exit code 0, "Compiled successfully", 36/36 static pages
- Route table unchanged: no new routes, no duplicates

Runtime, under `next start`:

| Route | Result |
|---|---|
| `/`, `/bots`, `/pricing`, `/faq`, `/support`, `/performance`, `/dashboard`, `/video-tutorials`, `/legal/terms`, `/auth/login` | 200 |
| `/admin` | 200, no redirect |

Authorization on the new signed-URL mode:

| Request | No auth | Forged token |
|---|---|---|
| `POST /api/admin/upload-video` (JSON) | 401 | 401 |
| `POST /api/admin/upload-thumbnail` (JSON) | 401 | 401 |
| `POST /api/admin/upload-video` (FormData) | 401 | — |

The footer contact section, `tel:+923004587593` and `wa.me/923014879047` all
still render on the public site.

### What I could not verify myself

I have no access to your Supabase project or a real browser session, so these
need your confirmation:

1. Sign in as admin, open `/admin`, switch to another tab or app for a minute,
   come back — the panel should still be there with **no** "Verifying admin
   access..." reappearing.
2. Open Upload Video, fill in title, description and category, choose a file,
   switch tabs and return — everything including the file should still be there.
3. Click Manage Categories and then Back to Videos — the form should be intact.
4. Refresh the page — the text should come back with the "Draft restored"
   banner, and you should be prompted to re-select the file by name.
5. Upload a video larger than 5 MB — this is the case that could not work
   before. Watch for real percentage progress.
6. The video appears in Video Management with the correct category.
7. Force a failure (for example go offline mid-upload) and confirm the real
   error appears and **nothing is cleared**.

If step 5 still fails, the response body of the `POST /api/admin/upload-video`
request in the Network tab will name the cause — check that the
`videos-content` bucket exists and that the storage policies from Section 4 of
`DATABASE_SETUP.md` were applied, since the signed URL is issued with the
service role key but the object write is still subject to bucket configuration.
