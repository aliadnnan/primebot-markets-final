-- ============================================================================
-- PrimeBot Markets - Diagnose an empty Category dropdown
-- ============================================================================
-- READ-ONLY. This script only SELECTs. It creates nothing, changes nothing and
-- deletes nothing. Run it in the Supabase SQL Editor when the Category dropdown
-- in the Video Upload form is empty, to find out which of the three possible
-- causes applies.
-- ============================================================================


-- 1. Does the table exist at all?
--    Expect one row. If empty, the video tables were never created - run
--    the video section of DATABASE_SETUP.md first.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('video_categories', 'videos');


-- 2. How many categories are stored?
--    If this returns 0, the table exists but is empty. That is the most common
--    cause of an empty dropdown. Add categories in the Admin Panel under
--    Video Categories (no SQL needed).
SELECT COUNT(*) AS category_count FROM video_categories;


-- 3. List the categories that do exist.
SELECT id, name, description, created_at
FROM video_categories
ORDER BY name;


-- 4. Is RLS blocking anonymous reads?
--    Expect a SELECT policy named "Everyone can see video categories".
--    If it is missing, the API can still read via the service role key, but the
--    public Video Tutorials page filters would break.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'video_categories';


-- 5. Videos per category - useful before deleting a category, because
--    videos.category_id is ON DELETE CASCADE.
SELECT c.name AS category, COUNT(v.id) AS videos
FROM video_categories c
LEFT JOIN videos v ON v.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
