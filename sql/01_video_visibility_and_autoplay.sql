-- ============================================================================
-- PrimeBot Markets - Video visibility & autoplay
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
--
-- What it does:
--   1. Adds videos.is_public  - controls whether visitors can see the video
--   2. Adds videos.autoplay   - marks a video to be featured with muted autoplay
--   3. Backfills both columns for existing rows
--   4. Updates the public read RLS policy so it also requires is_public = TRUE
--
-- This script is safe to re-run. It adds nothing that already exists, does not
-- drop any table, does not delete any row, and does not use
-- DROP FUNCTION ... CASCADE.
--
-- The application works with or without this migration: until it is run, the
-- Public/Private and Autoplay controls in the Admin Panel are ignored and every
-- published video behaves as public (the previous behaviour).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Add the columns
-- ----------------------------------------------------------------------------
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS autoplay  BOOLEAN NOT NULL DEFAULT FALSE;


-- ----------------------------------------------------------------------------
-- 2. Backfill existing rows
--    Existing videos were public-by-publication, so keep them public.
-- ----------------------------------------------------------------------------
UPDATE videos SET is_public = TRUE  WHERE is_public IS NULL;
UPDATE videos SET autoplay  = FALSE WHERE autoplay  IS NULL;


-- ----------------------------------------------------------------------------
-- 3. Index for the public listing query (published + is_public)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS videos_public_visibility_idx
  ON videos (published, is_public);


-- ----------------------------------------------------------------------------
-- 4. Tighten the public read policy
--    Replaces the existing "Anyone can view published videos" policy so that a
--    published-but-private video is not readable by anonymous visitors.
--    The four admin policies from DATABASE_SETUP.md are left untouched.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view published videos" ON videos;
CREATE POLICY "Anyone can view published videos"
ON videos
FOR SELECT
USING (published = TRUE AND is_public = TRUE);


-- ----------------------------------------------------------------------------
-- 5. Verification (optional - run these to confirm)
-- ----------------------------------------------------------------------------
-- Confirm the columns exist:
--   SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'videos' AND column_name IN ('is_public', 'autoplay');
--
-- Confirm the policy was recreated:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'videos';
--
-- See how your videos are currently classified:
--   SELECT title, published, is_public, autoplay FROM videos ORDER BY created_at DESC;
