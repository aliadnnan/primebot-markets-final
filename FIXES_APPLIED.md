# PrimeBot Markets — Fixes Applied

This document records what was actually wrong, why, and exactly what was changed.
The existing project was used as the base throughout. No page, component, route,
bot, price, order or design was rebuilt or replaced.

**Change summary**

| | Count |
|---|---|
| Existing files modified | 16 |
| New files created | 7 (incl. this document) |
| Files deleted | 0 |
| Duplicate Admin Panels / video systems / category systems created | 0 |

---

## Required manual step

One SQL file must be run by you in the Supabase SQL Editor to enable the
Public/Private and Autoplay controls:

```
sql/01_video_visibility_and_autoplay.sql
```

**No SQL has been executed against your database.** I have no access to it.

The application is written to work **both before and after** you run it. Until it
is run, the Public/Private and Autoplay checkboxes are accepted but ignored, and
every published video behaves exactly as it does today. The Admin Panel shows a
notice telling you this when it happens. Everything else in this delivery works
with no database change at all.

There is also a second, **read-only** SQL file, `sql/02_diagnose_video_categories.sql`,
which only runs SELECT statements. Use it if the Category dropdown is still empty
— it tells you which of the three possible causes applies.

---

## Task 1 — `/admin` redirecting to the public homepage

### Root cause

`lib/auth-context.tsx` exposed `isAdmin`, which starts as `false` and is only
corrected after an **asynchronous** `POST /api/auth/check-admin` call completes.
`loading` was set to `false` independently of that call.

The result was an intermediate state that lasted a few hundred milliseconds:

```
user = <signed in>    loading = false    isAdmin = false
```

`app/admin/page.tsx` acted on exactly that state:

```ts
if (!isAdmin) {
  toast.error('You do not have admin access')
  router.push('/')      // <-- fired for real administrators
}
```

The `onAuthStateChange` handler made it reliable rather than intermittent: it set
`user` synchronously and only *then* awaited the admin check, so React always
rendered at least once with "signed in, not loading, not admin". A genuine
administrator was bounced to `/` before the check could answer.

### Fix

- `lib/auth-context.tsx` now tracks `adminChecked` (the check has finished) and
  `adminCheckFailed` (the check itself errored) separately from `isAdmin`. A
  single `applySession()` function sequences the state updates so that
  "signed in, not loading, not admin" can no longer be observed while the check
  is in flight. A monotonic counter discards stale results when several auth
  events arrive together.
- A `refreshAdminStatus()` function was added for retrying.
- `app/admin/page.tsx` waits for `adminChecked` before making any access
  decision, and **no longer redirects on a failed authorization check**. Instead:
  - not signed in → redirect to `/auth/login?redirect=/admin`
  - signed in, not an admin → in-page **Access Denied** panel
  - check failed (network/server) → in-page **Could not verify access** panel with
    a Try again button
- `app/api/auth/check-admin/route.ts` now returns HTTP 500 when Supabase server
  credentials are missing, so a misconfiguration is no longer reported as
  "you are not an administrator".

### Authorization posture

Every admin API route verifies the bearer token server-side and re-reads
`users.is_admin` with the service role key. This was already true and is
unchanged. Verified at runtime with no token and with a forged token:

| Endpoint | No auth | Forged token |
|---|---|---|
| `GET /api/admin/categories` | 403 | 403 |
| `POST /api/admin/categories` | 403 | 403 |
| `PUT /api/admin/categories/[id]` | 403 | 403 |
| `DELETE /api/admin/categories/[id]` | 403 | 403 |
| `GET /api/admin/videos` | 401 | 401 |
| `PUT /api/admin/videos/[id]` | 401 | 401 |
| `POST /api/auth/check-admin` | 401 | 401 |

(The category routes answer 403 "Admin access required" and the video routes
answer 401 "Unauthorized" — both are rejections; they differ only because the
category routes run the token and the admin lookup through one shared helper.)

**No `middleware.ts` was added, deliberately.** This project authenticates with
`@supabase/supabase-js`, which stores the session in browser `localStorage`, not
in cookies. Next.js middleware runs on the edge and can only read cookies, so a
middleware guard on `/admin` would find no session and would lock **everyone**
out of the Admin Panel, including you. The client-side gate plus server-side
enforcement on every admin API route is the correct design for this auth setup —
the page shell is public, but no admin data is ever served without a verified
admin token.

The Admin Panel link continues to appear in the header **only** when
`isAdmin` is true. Verified: the public homepage HTML served to a logged-out
visitor contains zero occurrences of `href="/admin"`.

---

## Task 2 — Video Categories not opening, Category dropdown empty

### Root cause

There were **three separate problems**, none of which was a broken button.

1. **No category management existed anywhere in the project.** There was no
   Categories tab, no "Manage Categories" control, and no
   `CategoryManagement` component. `app/admin/page.tsx` rendered exactly two
   tabs — Orders & Payments, and Video Tutorials. The options could not open
   because there was nothing to open.
2. **No category write API existed.** The project had only
   `GET /api/videos/categories`. There was no route to create, rename or delete
   a category, so categories could only ever be added by hand in SQL.
3. **The dropdown failed silently.** `GET /api/videos/categories` returned HTTP
   500 whenever `SUPABASE_SERVICE_ROLE_KEY` was absent, and
   `VideoManagement.loadCategories()` discarded every failure into
   `console.error` without touching the UI. Whether the table was empty, RLS
   blocked the read, or the key was missing, the operator saw one identical
   symptom: an empty dropdown and no explanation.

### Fix

- **New** `app/admin/CategoryManagement.tsx` — view, add, edit and delete
  categories, with a per-category video count.
- **New** `app/api/admin/categories/route.ts` — `GET` (list with video counts),
  `POST` (create).
- **New** `app/api/admin/categories/[id]/route.ts` — `PUT` (rename/redescribe),
  `DELETE`.
- `app/admin/page.tsx` — added a third **Video Categories** tab to the existing
  Admin Panel. The existing panel was extended; no second panel was created.
- `app/admin/VideoManagement.tsx` —
  - added a **Manage Categories** button that switches to the Categories tab
  - categories are **reloaded every time the upload form opens**, so a category
    added moments earlier is immediately selectable
  - a red panel now reports the actual error when categories fail to load, with
    a Try again button
  - a yellow panel now explains the empty state ("No video categories exist
    yet") with a shortcut to add one
  - an inline hint appears under the Category dropdown when it is empty
- `app/api/videos/categories/route.ts` — rewritten to fall back to the anon key
  when the service role key is absent (`video_categories` is world-readable
  under your existing RLS policy), to always return a `categories` array, and to
  report the real error message instead of a generic 500.

### Safety note on deleting a category

Your schema declares:

```sql
category_id UUID NOT NULL REFERENCES video_categories(id) ON DELETE CASCADE
```

Deleting a category therefore **silently deletes every video in it**. The delete
endpoint refuses the request with HTTP 409 and reports the attached video count.
The UI then shows an explicit second confirmation naming how many videos would
be destroyed, and only then re-sends with `?force=true`.

---

## Task 3 — Video Management

Extended the existing `VideoManagement.tsx` and the existing video API routes.
No separate video system was created.

- **Publish / Unpublish** — one-click inline toggle in the video list.
- **Public / Private** — one-click inline toggle, plus checkboxes in the upload
  and edit forms. Backed by the new `is_public` column.
- **Autoplay** — per-video flag, toggle and checkboxes (see Task 5).
- **Status badges** — each video now shows Published/Draft, Public/Private and
  Autoplay at a glance.
- **Edit** — the edit form now includes Category (with a placeholder option),
  Public/Private, Autoplay, and an optional **Replace Video Link** field.
- **Sources** — MP4/WebM upload, YouTube, TikTok, Facebook and direct links all
  continue to work through the existing upload/link radio selector.

### Two real bugs fixed in the video API

1. **Signed URLs could overwrite stored storage paths.**
   `GET /api/admin/videos` rewrites `video_url` into a **1-hour signed URL** for
   uploaded files. If a PUT ever echoed that value back, the permanent storage
   path in the database would be replaced by a URL that expires in an hour, and
   the video would break for good. `PUT /api/admin/videos/[id]` now writes
   `video_url` **only** when a non-empty replacement is explicitly supplied, and
   the Replace Video Link field is deliberately left blank on open.
2. **External links were being passed to storage deletion.**
   `DELETE` called `storage.remove([video.video_url])` unconditionally, including
   for YouTube/TikTok/Facebook URLs. Now guarded so only real storage paths
   (values that are not `http(s)://…`) are sent to the storage buckets.

---

## Task 4 — Public video access

`GET /api/videos` is unauthenticated, so visitors watch without an account.
It now filters on **both** flags:

```
published = true  AND  is_public = true
```

`published` separates draft from live; `is_public` controls visitor access. A
video that is unpublished, or published but marked private, is never returned.
`created_by` is now stripped from the public payload so internal user IDs are not
exposed. If the `is_public` column is not present yet, the route falls back to
filtering on `published` alone — the previous behaviour, never something looser.

`sql/01_video_visibility_and_autoplay.sql` also tightens the RLS policy itself,
so the restriction is enforced at the database level and not only in the API:

```sql
USING (published = TRUE AND is_public = TRUE)
```

The existing Video Tutorials page, its search, and its category filters are
unchanged in behaviour and design.

---

## Task 5 — Video playback and autoplay

A **Featured** player was added at the top of the existing Video Tutorials page,
rendered only for a video you have flagged with Autoplay in the Admin Panel.

- **Muted autoplay only.** Autoplay is always paired with `mute=1`; browsers
  block autoplay with sound, and a rejected `play()` leaves a player broken.
- **Only one featured video is ever rendered** — the newest flagged one. Several
  players can never autoplay at once.
- **Nothing loads or plays off-screen.** An `IntersectionObserver` starts
  playback at 50% visibility and pauses on exit. Third-party embeds (YouTube,
  TikTok, Facebook) are not even mounted until scrolled into view, so no
  off-screen player consumes bandwidth.
- **Graceful degradation.** Native controls are always present, `play()`
  rejections are swallowed, and browsers without `IntersectionObserver` simply
  get the player.
- The grid of video cards still shows thumbnails only — no change to the layout,
  spacing or styling of the existing page.
- Also fixed: the player modal previously passed direct MP4/WebM URLs through
  `getEmbedUrl()` and hardcoded `type="video/mp4"`, which mislabelled WebM files.

---

## Task 6 — Contact information

A **More Information** section was added inside the existing `components/Footer.tsx`,
directly above the Risk Disclaimer block. The existing four-column footer, the
disclaimer and the copyright bar were not redesigned. No new page or component
was created, and because the footer is in the root layout the section appears
site-wide.

Two cards, matching the existing slate/blue card styling, stacking to one column
on mobile:

- **Call Us — 03004587593**, linked as `tel:+923004587593`
- **WhatsApp — 03014879047**, linked as `https://wa.me/923014879047?text=…`

### A pre-existing bug this uncovered

The WhatsApp links already in the project were **not working**:

```
https://wa.me/03014879047      <-- rejected by WhatsApp as an invalid number
```

`wa.me` and `tel:` require international format with the country code and
**without** the leading zero. Pakistan is +92, so `03014879047` must be sent as
`923014879047`. The old code took the local number and stripped non-digits,
which left the leading zero intact.

This affected both `components/WhatsAppButton.tsx` (the floating button on every
page) and the "Chat on WhatsApp" button on `app/faq/page.tsx`.

Both now build their links from a single source of truth, `CONTACT_INFO` and
`getWhatsAppLink()` in `lib/constants.ts`, so the number cannot drift again. The
footer's email link now also reuses the existing `SUPPORT_EMAIL` constant instead
of a second hardcoded copy.

---

## Task 7 — Existing data preserved

Nothing was deleted. Verified by direct file-by-file comparison against the ZIP
you uploaded:

- All 3 trading bots, their types, prices ($200 / $400 / $600), descriptions and
  feature lists — untouched in `lib/constants.ts`
- All 4 payment methods and account numbers — untouched
- Performance data, backtest results — untouched
- Pages untouched: `/`, `/bots`, `/pricing`, `/performance`, `/support`,
  `/dashboard`, `/payment`, all 4 `/legal/*` pages, all 4 `/auth/*` pages
- `app/faq/page.tsx` — only the broken WhatsApp URL was changed; all FAQ
  question and answer text is byte-identical
- Orders, authentication, RLS policies, storage buckets, database schema —
  no destructive change. The one migration only **adds** two columns and
  recreates one SELECT policy.
- `payment-proofs` remains private; no public URLs are generated for it
- No service role key is exposed to the client or through any `NEXT_PUBLIC_`
  variable
- `CREATE OR REPLACE FUNCTION` is used throughout; no `DROP FUNCTION … CASCADE`
- No dummy, sample or placeholder content was added anywhere

---

## Task 8 — Routing and deployment

`next build` completes successfully. Verified at runtime with `next start`:

| Route | Result |
|---|---|
| `/` | 200, public website, no redirect |
| `/admin` | 200, real Admin Panel, **no redirect to `/`** |
| `/video-tutorials` | 200 |
| `/bots`, `/pricing`, `/faq`, `/support`, `/dashboard`, `/performance` | 200 |
| all `/legal/*`, all `/auth/*` | 200 |

No route conflicts and no duplicate routes. The `.old` backup files
(`app/admin/page.tsx.old`, `app/payment/page.tsx.old`,
`components/Header.tsx.old`) were **left in place**; Next.js does not route
non-`.tsx` extensions, so they are inert. They are yours to keep or remove.

### A second pre-existing build blocker fixed

`next build` was **failing outright** before any of this work:

```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
Failed to collect page data for /api/admin/approve
```

`lib/email.ts` called `new Resend(process.env.RESEND_API_KEY)` at module scope.
Next.js evaluates API route modules during the build, so a missing
`RESEND_API_KEY` — the default on a fresh Vercel project — turned into a hard
build failure. The client is now created lazily on first use, and a missing key
skips the email with a warning instead of crashing the operation that triggered
it (for example, approving an order).

`lib/supabase/server.ts` had the same shape of problem: a module-level
`throw new Error('Missing Supabase environment variables')`. That is now an
exported `isSupabaseServerConfigured` flag, so a missing variable surfaces as a
clear runtime error rather than an unexplained build failure.

### Environment variables required on Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     (server-side only — never NEXT_PUBLIC_)
RESEND_API_KEY                (optional — email is skipped without it)
ADMIN_EMAIL                   (optional)
EMAIL_FROM                    (optional)
```

---

## Full file manifest

### Modified (16)

| File | Change |
|---|---|
| `lib/auth-context.tsx` | Fixed the admin-check race; added `adminChecked`, `adminCheckFailed`, `refreshAdminStatus` |
| `app/admin/page.tsx` | Wait for `adminChecked`; Access Denied / retry panels instead of redirect; added Video Categories tab |
| `app/admin/VideoManagement.tsx` | Manage Categories button; category error + empty states; category reload on open; publish/public/autoplay toggles and badges; edit form additions |
| `app/api/videos/categories/route.ts` | Anon-key fallback; always returns an array; reports real errors |
| `app/api/videos/route.ts` | Filter on `published` + `is_public` with fallback; strip `created_by` |
| `app/api/admin/videos/route.ts` | Accept `is_public` / `autoplay` with migration fallback |
| `app/api/admin/videos/[id]/route.ts` | Same, plus signed-URL overwrite guard and storage-path guard on delete |
| `app/api/auth/check-admin/route.ts` | Return 500 on misconfiguration instead of `isAdmin: false` |
| `lib/supabase/server.ts` | Removed module-level throw; added `isSupabaseServerConfigured` |
| `lib/supabase/client.ts` | Added optional `is_public` / `autoplay` to the `videos` types |
| `lib/email.ts` | Lazy Resend client; skip email when no key |
| `lib/constants.ts` | Added `CONTACT_INFO` and `getWhatsAppLink()` |
| `components/Footer.tsx` | Added the More Information contact section; reuse `SUPPORT_EMAIL` |
| `components/WhatsAppButton.tsx` | Fixed the invalid `wa.me` number format |
| `app/video-tutorials/page.tsx` | Featured autoplay player; `getEmbedUrl(url, autoplay)`; modal source fixes |
| `app/faq/page.tsx` | Fixed the invalid `wa.me` number format (FAQ text unchanged) |

### Created (7)

| File | Purpose |
|---|---|
| `app/admin/CategoryManagement.tsx` | Category CRUD UI |
| `app/api/admin/categories/route.ts` | List + create categories |
| `app/api/admin/categories/[id]/route.ts` | Update + delete, with cascade guard |
| `lib/video-columns.ts` | Missing-column detection so the app works pre- and post-migration |
| `sql/01_video_visibility_and_autoplay.sql` | Adds `is_public` + `autoplay`, tightens the public RLS policy |
| `sql/02_diagnose_video_categories.sql` | Read-only diagnostics for an empty Category dropdown |
| `FIXES_APPLIED.md` | This document |

### Deleted (0)

---

## What I could not verify myself

I have no access to your Supabase project, so these need your confirmation:

1. `sql/01_video_visibility_and_autoplay.sql` executes cleanly in your SQL Editor.
2. A real admin account (`users.is_admin = true`) reaches `/admin` and stays there.
3. A real non-admin account sees Access Denied.
4. Categories save and appear in the upload dropdown against your live database.
5. An uploaded MP4 and a YouTube/TikTok/Facebook link each play on the public page.

Everything else in this document was verified by build, typecheck, HTTP request
or direct file comparison.
