-- ============================================================================
-- 12_bot_reviews.sql
-- Buyer reviews per bot + per-bot delivery file (owner order 2026-10-10).
--
-- PART A - reviews table:
--   id                  UUID PK
--   bot_id              TEXT FK -> bots(id) ON DELETE CASCADE
--   reviewer_name       TEXT (required, 2-50 chars, enforced in the API)
--   rating              INT 1-5
--   review_text         TEXT (required, 10-1000 chars, enforced in the API)
--   is_verified_purchase BOOLEAN default FALSE
--   is_approved         BOOLEAN default FALSE - new reviews are hidden until
--                       an admin approves them in the admin panel. The public
--                       site NEVER reads unapproved reviews.
--   created_at          TIMESTAMPTZ default now()
--
-- PART B - per-bot delivery file (auto email delivery on verified approval):
--   bots.delivery_file_path TEXT - path in the private `bot-deliveries`
--     bucket, e.g. `bots/quantum/1690000000-PRIME-QUANTUM.ex4`. The admin
--     attaches the EA file ONCE per bot in Bot Management; every verified
--     order for that bot then gets the file emailed automatically, without
--     an admin click.
--   bots.delivery_file_name TEXT - original filename shown to the buyer.
--
-- RUN ORDER: run ONCE in the Supabase SQL Editor. Fully idempotent: every
-- change is guarded, it DROPS nothing, DELETES no rows and changes no
-- existing data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PART A: reviews table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id TEXT NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_bot_approved_idx
  ON reviews (bot_id, created_at DESC)
  WHERE is_approved = TRUE;

CREATE INDEX IF NOT EXISTS reviews_pending_idx
  ON reviews (created_at DESC)
  WHERE is_approved = FALSE;

-- ----------------------------------------------------------------------------
-- PART B: per-bot delivery file columns
-- ----------------------------------------------------------------------------
ALTER TABLE bots ADD COLUMN IF NOT EXISTS delivery_file_path TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS delivery_file_name TEXT;

-- ----------------------------------------------------------------------------
-- Verify afterwards (optional)
-- ----------------------------------------------------------------------------
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'reviews' ORDER BY ordinal_position;
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'bots' AND column_name LIKE 'delivery_file%';
