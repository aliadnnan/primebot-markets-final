-- ============================================================================
-- PrimeBot Markets — Verify storage buckets and video tables
-- ============================================================================
-- READ-ONLY. Only SELECT statements. Creates nothing, changes nothing.
--
-- PURPOSE: this is the other half of the "am I connected to the right Supabase
-- project?" test.
--
--   1. Open the Admin Panel -> Video Tutorials -> "Run Diagnostics".
--      It prints the project ref the DEPLOYED SITE is actually connected to.
--   2. Run this file in the SQL Editor of the project you believe is correct.
--      Query 0 prints THAT project's ref.
--
-- If the two refs differ, the website is talking to a different Supabase
-- project than the one where you created the buckets and tables — which is
-- exactly the situation that produces:
--
--     "The related resource does not exist"
--
-- during upload. Supabase Storage returns that (404, RelatedResourceNotFound)
-- when an object write has no matching bucket row.
-- ============================================================================


-- 0. Which project is THIS SQL Editor connected to?
--    Compare this value with the "Connected project" shown by Run Diagnostics.
SELECT current_setting('app.settings.project_ref', true) AS project_ref_setting,
       current_database()                                AS database_name;


-- 1. Do the two required buckets exist, with the EXACT ids?
--    Both rows must come back. Bucket ids are case-sensitive.
SELECT id,
       name,
       public,
       file_size_limit,
       allowed_mime_types,
       created_at
FROM storage.buckets
WHERE id IN ('video-content', 'video-thumbnils')
ORDER BY id;


-- 2. Every bucket in this project.
--    If 'video-content' is absent here, that is the missing resource.
--    Watch for near-misses such as 'videos-content', 'video_content', 'Video-Content'.
SELECT id, name, public, created_at
FROM storage.buckets
ORDER BY id;


-- 3. Storage policies affecting those buckets.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;


-- 4. How many objects are already stored in each bucket?
SELECT bucket_id, COUNT(*) AS objects
FROM storage.objects
WHERE bucket_id IN ('video-content', 'video-thumbnils')
GROUP BY bucket_id;


-- 5. Do the application tables exist in THIS project?
--    Expect: users, videos, video_categories (plus orders, bots, payment_methods).
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;


-- 6. Foreign key prerequisite for saving a video.
--    videos.category_id is NOT NULL and references video_categories(id), so a
--    video cannot be saved while this returns 0.
SELECT COUNT(*) AS category_count FROM video_categories;

SELECT id, name FROM video_categories ORDER BY name;


-- 7. Confirm the foreign key and its delete rule.
--    Expect one row: videos.category_id -> video_categories.id, CASCADE.
SELECT tc.constraint_name,
       kcu.column_name      AS child_column,
       ccu.table_name       AS parent_table,
       ccu.column_name      AS parent_column,
       rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'videos';


-- ============================================================================
-- IF QUERY 1 RETURNS FEWER THAN TWO ROWS
-- ============================================================================
-- The bucket(s) are missing from this project. Create them in the Dashboard:
--   Storage -> New bucket
--     Name: video-content        Public: OFF    File size limit: 500 MB
--     Name: video-thumbnils      Public: OFF    File size limit: 5 MB
--
-- Private is correct — the application generates signed URLs for viewing.
-- Then apply the storage policies from Section 4 of DATABASE_SETUP.md.
-- ============================================================================
