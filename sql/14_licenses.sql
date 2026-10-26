-- ============================================================================
-- 14_licenses.sql
-- Online license control for sold EAs (owner order 2026-10-26).
--
-- One row = one license: a buyer's MT5 account number bound to a license
-- key. The EA itself calls GET /api/license/check?account=..&key=.. (via
-- MT5 WebRequest); the admin turns a license on/off or extends its expiry
-- from the Admin Dashboard "Licenses" tab, and the very next check the EA
-- makes picks the change up - no new EA file needs to be sent to the buyer.
--
-- This sits ON TOP of the existing compiled-in account-number lock, it does
-- not replace it.
--
-- Access model (same as sql/06 admin_users and sql/13 tiktok_connections):
--   RLS is ENABLED with NO policies, so the anon key and any signed-in
--   user's key can neither read nor write this table. All access goes
--   through server code with the service-role key:
--     - Admin CRUD:  /api/admin/licenses*  (verifies admin first)
--     - EA check:    /api/license/check    (returns ok/active/reason ONLY -
--                                          never emails, names or the list)
--
-- RUN ORDER: run ONCE in the Supabase SQL Editor. Fully idempotent: every
-- change is guarded, it DROPS nothing, DELETES no rows and changes no
-- existing data.
-- ============================================================================

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL UNIQUE,
  mt5_account TEXT NOT NULL,
  bot_name TEXT,
  buyer_email TEXT,
  buyer_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS licenses_account_idx ON licenses (mt5_account);
CREATE INDEX IF NOT EXISTS licenses_key_idx ON licenses (license_key);
CREATE INDEX IF NOT EXISTS licenses_status_idx ON licenses (status);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- No policies on purpose: only the service_role key (server code) can
-- touch this table. See the header comment.

-- ----------------------------------------------------------------------------
-- Verify afterwards (optional)
-- ----------------------------------------------------------------------------
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'licenses' ORDER BY ordinal_position;
--   SELECT * FROM licenses LIMIT 5;
