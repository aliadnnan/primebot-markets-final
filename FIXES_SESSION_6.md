# PrimeBot Markets — Uploaded videos not appearing

## What I could and could not determine

I traced all three endpoints. **The listing queries were already correct**, so I
could not find a defect that explains the symptom by reading the code alone:

- `GET /api/admin/videos` applies **no** `published` or `is_public` filter. I
  confirmed this in the compiled build, not just the source:
  ```
  admin route:  eq("published", …)  ->  no matches  (no filter)
  public route: eq("published", !0), eq("is_public", !0)  (correct)
  ```
- `GET /api/videos` correctly filters `published = true AND is_public = true`.
- `POST /api/admin/videos` inserts `published` and `is_public` straight from the
  form, and the client already throws on a failed insert rather than reporting
  success.

So rather than guess, I did two things: built the direct `public.videos`
inspection you asked for, and removed every way the listing could hide videos
even in principle.

**The one output I need from you** is Run Diagnostics (below). It reads
`public.videos` directly and will say which of the four possible causes it is.

---

## 1. The exact inspection you asked for — one click

**Admin Panel → Video Tutorials → Run Diagnostics** now reports, reading the
table directly with the service role key (so RLS cannot interfere):

- **Row count in `public.videos`** — total, and how many were created in the
  last hour. Zero means the insert is failing and this is not a listing problem
  at all.
- **The newest 5 records**, each showing every field you listed:
  `id`, `title`, `category_id`, `video_url`, `thumbnail_url`, `published`,
  `is_public`, `autoplay`, `created_at`.
- **Whether `is_public` and `autoplay` exist as columns** — if
  `sql/01_video_visibility_and_autoplay.sql` was never run, those two settings
  are silently dropped on save.
- **The admin listing query re-run exactly as the API runs it**, join included,
  with the row count or the precise failure.
- **The public page query re-run exactly as the API runs it**
  (`published = true AND is_public = true`), with the row count or failure.

That last pair is the decisive test: if the admin query returns rows but the
Admin Panel is empty, the fault is in the response handling, not the database.

`sql/04_inspect_video_records.sql` (read-only, SELECTs only) does the same from
the SQL Editor, with a "reading the results" key at the bottom.

## 2. A category relationship can no longer hide any video

You specifically asked for this, and it was a genuine latent risk. Both listing
queries used an embedded join:

```ts
.select('*, video_categories ( id, name, description )')
```

That join depends on PostgREST resolving the foreign key through its schema
cache. If resolution fails — a stale cache, a changed constraint — the **whole
query errors** and *every* video vanishes, from both the Admin Panel and the
public page.

Both endpoints now attempt the join, and on **any** failure fall back to a
join-free `select('*')` and attach category names from a separate query. The
admin response carries a `warning`, shown as a yellow banner, so you know the
fallback engaged rather than it failing silently.

## 3. Signed-URL generation is isolated per video

Both endpoints looped over the videos calling `createSignedUrl`. Inside a
`Promise.all`, one throw rejects the whole batch — so a single missing storage
object could blank the entire list. Each video's signing is now wrapped
individually. A failure leaves that one video's raw path, attaches a
`storage_warning`, logs the bucket and path, and the other videos are unaffected.

## 4. A failed load no longer looks like an empty library

This was the worst diagnostic problem, and it is why the symptom was so opaque.

`loadVideos()` showed a transient toast on failure and left the list empty, so
the Admin Panel rendered **"No videos uploaded yet"** — identical to genuinely
having no videos. The public page was worse: it checked `if (data.success)` and
ignored the `else` entirely, so a server error rendered as "No videos found".

Now:

- **Admin Panel** — a load failure renders a red panel: *"Could not load the
  video list … This is a loading failure, not an empty library — your videos may
  still exist"*, with the real error, a Try again button and a Run Diagnostics
  button. The genuine empty state says the table returned zero rows and offers
  Run Diagnostics.
- **Public page** — a load failure renders *"Tutorials could not be loaded"* with
  the real error and a retry. A genuinely empty result says *"No tutorials have
  been published yet"*. A search that matches nothing still says *"No videos
  found matching your search"*. Three distinct states that used to be one.
- Both log a structured `[admin]` / `[video-tutorials]` console entry with the
  HTTP status and response body.

## 5. The save now reports what the database actually stored

`POST /api/admin/videos` echoes back the **saved row's** flags, and the toast
reports those rather than what the form believed it sent:

> Saved to database. Published — Public.

And if the stored state means it will not be visible, you are told immediately:

> This video is a DRAFT, so it will not appear on the public Video Tutorials
> page. Use Publish in the list below.

> This video is PRIVATE, so visitors cannot see it. Use Make Public in the list
> below.

This closes the gap where "Publish immediately" was ticked but the stored value
could not be confirmed. It also covers the case where
`sql/01_video_visibility_and_autoplay.sql` has not been run: `is_public` comes
back `undefined`, and the toast says *"Public/Private not stored (run sql/01)"*.

There is also now a guard for the odd case where the insert reports no error but
returns no row — previously that would have been reported as success with an
undefined video. It now fails explicitly.

## 6. Database errors are named precisely

Already added last round, retained here: Postgres `23503` reports *"Category
reference failed: the selected category does not exist in
public.video_categories (foreign key on videos.category_id)"*; `42P01` reports a
missing table; `42501` reports an RLS/permission problem. Raw `code` and
`message` are always appended.

---

## What to do — and what to send me

1. Deploy.
2. Upload one test video with **Publish immediately** ticked.
3. Read the toast. It now states what the database stored.
4. **Run Diagnostics** and read these four lines:

| Line | Meaning |
|---|---|
| `Video rows in public.videos` | `0` → the insert is failing, not the listing |
| `Video #1: <title>` | the actual `published` / `is_public` / `category_id` values |
| `Admin listing query (with category join)` | FAIL → the join was the cause; the fallback now covers it |
| `Public page query (published + is_public)` | `0` rows → published but private, or not published |

Most likely outcomes, in my order of probability:

- **`published = false` on the row** despite ticking the box → the new toast
  will now say "Draft" straight after saving, and Publish in the list fixes it.
- **`is_public` column missing** (sql/01 never run) → the diagnostics line says
  so; the public page falls back to `published` only, so videos still appear.
- **Admin listing query FAILS** → the join was hiding everything; already fixed
  by the fallback.
- **Rows exist and both queries return them, but the panel is empty** → a
  client-side problem, and the red error panel plus the `[admin]` console entry
  will now name it.

If it is still not visible after this, send me the Run Diagnostics output. Those
four lines pin it down exactly.

---

## Change summary

**This round:** 5 files modified — `app/api/admin/videos/route.ts`,
`app/api/videos/route.ts`, `app/admin/VideoManagement.tsx`,
`app/video-tutorials/page.tsx`, `lib/supabase-diagnostics.ts`. 2 files added —
`sql/04_inspect_video_records.sql` and this document.

No new tables, no duplicate video or category system, no second Admin Panel, no
schema change, and no change to any bot, price, page, order or design. The
upload architecture is untouched: still a direct signed upload to
`video-content`, bypassing the Vercel request body limit.

## Verification performed

- `tsc --noEmit` — clean
- `next build` — exit 0, 36/36 static pages
- Compiled output: admin listing contains **no** `eq("published")` filter;
  public route contains both `eq("published", true)` and `eq("is_public", true)`
- `GET /api/admin/videos` → 401 without a token; `GET /api/admin/diagnostics` →
  403 without admin
- `GET /api/videos` with an unreachable database now returns a real message —
  `Could not read the videos table: <reason> (code …)` — instead of an empty
  success
- `/`, `/admin`, `/video-tutorials`, `/bots` → all 200

### What I could not verify

I have no access to project `fzepghuiqnmbfehnrgrc`, so I could not upload a real
video, read a real row, or confirm which of the four causes applies. What I did
verify is that the admin listing cannot filter by publish state, that neither
listing can be emptied by a join or signing failure, and that every failure path
now reports the real reason instead of rendering as an empty library.
