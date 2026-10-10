-- ============================================================================
-- 10_bot_videos.sql
-- Per-bot videos: lets the admin attach a video to ONE specific bot so that
-- bot's own card on the Bots page plays it (the owner's Urdu explainer video
-- for that bot).
--
-- RUN ORDER: run ONCE in the Supabase SQL Editor, after the base video schema
-- (DATABASE_SETUP.md), sql/01_video_visibility_and_autoplay.sql and
-- sql/05_future_proof_setup.sql. Safe to re-run - fully idempotent: it adds
-- one column, one foreign key and one index, and only when they are missing.
-- It DROPS nothing, DELETES no rows and changes no existing data.
--
-- What it does:
--   1. videos.bot_id TEXT (nullable) - the bot this video belongs to.
--      bots.id is TEXT ('scalper' | 'hedge' | 'ai' | 'quantum' | 'elite'),
--      so bot_id is TEXT too, not a UUID. A video keeps its category_id as
--      well: category drives the Video Tutorials page, bot_id drives the
--      Bots page. One video may have both.
--   2. Foreign key videos.bot_id -> bots(id) ON DELETE SET NULL: deleting a
--      bot in Bot Management never deletes its videos; they simply become
--      unassigned (and stay listed under their category).
--   3. Index on bot_id for the Bots-page lookup (published video per bot).
--
-- RLS: no new policy is needed. Row reads are governed by the existing
-- policies (public: published = TRUE AND is_public = TRUE; admin writes go
-- through the service-role API routes, which bypass RLS). bot_id changes
-- WHICH bot a public video is attached to, not WHO can read the row.
--
-- The application works with or without this migration: until it is run, the
-- Admin Panel's Bot selector is ignored on save (see lib/video-columns.ts)
-- and the Bots page simply shows no per-bot videos.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Column
-- ----------------------------------------------------------------------------
ALTER TABLE videos ADD COLUMN IF NOT EXISTS bot_id TEXT;


-- ----------------------------------------------------------------------------
-- 2. Foreign key (added only when missing, so re-running is a no-op)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'videos_bot_id_fkey'
      AND conrelid = 'public.videos'::regclass
  ) THEN
    ALTER TABLE videos
      ADD CONSTRAINT videos_bot_id_fkey
      FOREIGN KEY (bot_id) REFERENCES public.bots(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 3. Index for the Bots-page query (newest published video per bot)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS videos_bot_id_idx
  ON videos (bot_id, created_at DESC)
  WHERE bot_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 4. Verification (optional - run these to confirm)
-- ----------------------------------------------------------------------------
-- Column and constraint in place:
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'videos' AND column_name = 'bot_id';
--
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'public.videos'::regclass AND conname = 'videos_bot_id_fkey';
--
-- Assign a video to a bot from the Admin Panel:
--   Admin Panel -> Video Management -> Edit a video -> "Bot (optional)".
-- Then check what the Bots page will show (newest published+public per bot):
--   SELECT DISTINCT ON (bot_id) bot_id, title, published, is_public, created_at
--   FROM videos
--   WHERE bot_id IS NOT NULL AND published = TRUE AND is_public = TRUE
--   ORDER BY bot_id, created_at DESC;
