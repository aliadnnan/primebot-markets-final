-- ============================================================================
-- 13_tiktok_connections.sql
-- TikTok Login Kit + Content Posting API connection (owner order 2026-10-18).
-- RUN ORDER: run ONCE in the Supabase SQL Editor. Fully idempotent: every
-- change is guarded, it DROPS nothing, DELETES no rows and changes no
-- existing data.
--
-- Stores the owner's TikTok OAuth tokens (one row per TikTok open_id).
-- Tokens are read/written ONLY with the service-role key from server code
-- (lib/tiktok.ts); RLS is enabled with NO policies so nothing else can read
-- them (service_role bypasses RLS by design).
-- ============================================================================

CREATE TABLE IF NOT EXISTS tiktok_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tiktok_connections ENABLE ROW LEVEL SECURITY;

-- No policies: only the service_role key (server code) can touch this table.
