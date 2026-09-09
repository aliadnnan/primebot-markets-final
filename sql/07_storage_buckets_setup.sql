-- ============================================================================
-- PrimeBot Markets — Storage bucket setup (payment-proofs, bot-deliveries)
-- ============================================================================
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- WHY YOU NEED THIS
-- Your production error was:
--
--   "Signed upload URL could not be generated for the 'payment-proofs' bucket:
--    The related resource does not exist"
--
-- That message comes from Supabase Storage (RelatedResourceNotFound, HTTP 404).
-- Storage raises it when an object write has no related BUCKET row — i.e. the
-- bucket does not exist in the connected project. Code alone cannot fix a
-- missing bucket; this script creates it with the exact required settings.
--
-- It creates NOTHING that already exists (ON CONFLICT DO NOTHING), DROPS
-- nothing, and DELETES nothing. Existing objects in existing buckets are
-- untouched.
--
-- IT DOES NOT TOUCH your video buckets. Those keep their exact existing IDs:
--   video-content        (videos)
--   video-thumbnils      (thumbnails)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. What buckets exist right now? (run this first and read the result)
-- ----------------------------------------------------------------------------
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY id;


-- ----------------------------------------------------------------------------
-- 1. payment-proofs — PRIVATE, 10 MB, images + PDF
-- ----------------------------------------------------------------------------
-- public = false is essential. The app serves proofs to admins via on-demand
-- signed URLs; a public bucket would expose every customer's receipt.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  FALSE,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- If the bucket already existed but with the wrong settings, this corrects
-- them WITHOUT touching the files inside it.
UPDATE storage.buckets
SET public = FALSE,
    file_size_limit = 10485760,
    allowed_mime_types =
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE id = 'payment-proofs';


-- ----------------------------------------------------------------------------
-- 2. bot-deliveries — PRIVATE, 100 MB, any type
-- ----------------------------------------------------------------------------
-- EA files vary (.ex4/.ex5/.zip), so MIME types are left unrestricted.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('bot-deliveries', 'bot-deliveries', FALSE, 104857600)  -- 100 MB
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET public = FALSE,
    file_size_limit = 104857600
WHERE id = 'bot-deliveries';


-- ----------------------------------------------------------------------------
-- 3. No storage policies are needed for these two buckets
-- ----------------------------------------------------------------------------
-- Deliberate. Every read and write goes through the server using the SERVICE
-- ROLE key, which bypasses RLS:
--
--   * Upload  — the browser PUTs to a signed upload URL that the server issues
--               only after verifying the signed-in user owns the order.
--   * Admin view — /api/admin/orders mints a 1-hour signed URL after verifying
--               the caller is an admin.
--   * Customer download — /api/orders/[id]/download mints a 5-minute signed URL
--               after verifying the caller owns a verified order.
--
-- Adding a permissive `storage.objects` policy for anon or authenticated roles
-- would let customers list or read each other's receipts. Do not add one.


-- ----------------------------------------------------------------------------
-- 4. Verification — expect exactly two rows, both public = false
-- ----------------------------------------------------------------------------
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('payment-proofs', 'bot-deliveries')
ORDER BY id;

-- Confirm the video buckets are untouched (expect both, unchanged):
SELECT id, public, file_size_limit
FROM storage.buckets
WHERE id IN ('video-content', 'video-thumbnils')
ORDER BY id;

-- How many payment proofs are stored?
SELECT COUNT(*) AS stored_payment_proofs
FROM storage.objects
WHERE bucket_id = 'payment-proofs';


-- ============================================================================
-- IF STEP 1 FAILS WITH A PERMISSION ERROR
-- ============================================================================
-- Some projects restrict inserts into storage.buckets from the SQL Editor.
-- In that case create them by hand instead — identical result:
--
--   Dashboard -> Storage -> New bucket
--     Name: payment-proofs     Public: OFF   File size limit: 10 MB
--       Allowed MIME types: image/jpeg, image/png, image/gif, image/webp,
--                           application/pdf
--     Name: bot-deliveries     Public: OFF   File size limit: 100 MB
--
-- Then re-run section 4 to confirm.
--
-- If your bucket is already named something else and you would rather keep that
-- name, set this environment variable in Vercel instead of renaming anything:
--   NEXT_PUBLIC_SUPABASE_PAYMENT_PROOF_BUCKET=<your-actual-bucket-id>
-- ============================================================================
