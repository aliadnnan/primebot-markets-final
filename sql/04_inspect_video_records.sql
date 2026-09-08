-- ============================================================================
-- PrimeBot Markets — Inspect video records in public.videos
-- ============================================================================
-- READ-ONLY. Only SELECT statements. Creates nothing, changes nothing.
--
-- Run this in the SQL Editor of project fzepghuiqnmbfehnrgrc right after
-- uploading a test video. It answers, in order:
--
--   1. Was a row created at all?           (Query 2)
--   2. What are its exact flag values?     (Query 3)
--   3. Which listing query hides it?       (Queries 5, 6, 7)
--
-- A successful upload to Storage does NOT mean the videos row was created.
--
-- The Admin Panel's "Run Diagnostics" button reports the same information from
-- inside the deployed app, if you would rather not use the SQL Editor.
-- ============================================================================


-- 1. Do the optional visibility columns exist?
--    If is_public / autoplay are absent, sql/01_video_visibility_and_autoplay.sql
--    has not been run: the Public/Private and Autoplay settings are ignored on
--    save, and the public page falls back to filtering on `published` alone.
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'videos'
ORDER BY ordinal_position;


-- 2. How many rows exist, and how do they break down?
--    total = 0  ->  the insert is failing; the file is in Storage but no record
--                   was created. Upload again and read the error in the form.
SELECT COUNT(*)                                              AS total,
       COUNT(*) FILTER (WHERE published)                      AS published_true,
       COUNT(*) FILTER (WHERE NOT published)                  AS drafts,
       COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') AS created_last_hour
FROM videos;


-- 3. The newest 10 records, with every field that matters.
--    Check that `published` is true for anything you published, and that
--    video_url holds a STORAGE PATH (e.g. videos/1712...mp4) for uploads, or a
--    full https:// URL for external links.
SELECT id,
       title,
       description,
       category_id,
       video_url,
       thumbnail_url,
       published,
       created_at
FROM videos
ORDER BY created_at DESC
LIMIT 10;


-- 3b. Same, including the visibility columns.
--     Run this ONLY if Query 1 showed is_public and autoplay exist;
--     otherwise it errors with "column does not exist", which is itself the answer.
-- SELECT id, title, published, is_public, autoplay, category_id, created_at
-- FROM videos
-- ORDER BY created_at DESC
-- LIMIT 10;


-- 4. Is every video's category_id still valid?
--    A row here means the category was deleted and the relationship is broken,
--    which can make a joined listing query behave unexpectedly.
SELECT v.id, v.title, v.category_id
FROM videos v
LEFT JOIN video_categories c ON c.id = v.category_id
WHERE c.id IS NULL;


-- 5. The ADMIN listing query, reproduced.
--    No published/is_public filter — the Admin Panel must show everything.
--    This count should equal Query 2's `total`.
SELECT COUNT(*) AS admin_listing_rows
FROM videos v
LEFT JOIN video_categories c ON c.id = v.category_id;


-- 6. The PUBLIC page query, reproduced (published only).
SELECT COUNT(*) AS public_rows_published_only
FROM videos
WHERE published = TRUE;


-- 6b. The PUBLIC page query with visibility (published AND is_public).
--     Run only if is_public exists. Zero here with a non-zero Query 6 means
--     your videos are published but marked PRIVATE.
-- SELECT COUNT(*) AS public_rows FROM videos WHERE published = TRUE AND is_public = TRUE;


-- 7. RLS policies on videos.
--    The APIs use the service role key, which bypasses RLS, so RLS cannot be
--    the reason the Admin Panel is empty. Listed for completeness.
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY policyname;


-- ============================================================================
-- READING THE RESULTS
-- ============================================================================
-- Query 2 total = 0            -> insert failing. Not a listing problem.
-- Query 2 total > 0, Q5 = 0    -> the join is dropping rows. The listing now
--                                 falls back to a join-free query automatically.
-- Q5 > 0 but Admin Panel empty -> a client/response problem; Run Diagnostics
--                                 and check the browser console for [admin].
-- Q6 = 0 with Q2 total > 0     -> nothing is published. Use Publish.
-- Q6 > 0 but Q6b = 0           -> published but PRIVATE. Use Make Public.
-- ============================================================================
