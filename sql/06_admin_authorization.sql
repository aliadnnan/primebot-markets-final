-- ============================================================================
-- PrimeBot Markets — Separate, secure Admin authorization
-- ============================================================================
-- Run ONCE in the Supabase SQL Editor. Safe to re-run (fully idempotent).
-- Drops nothing, deletes no rows, and cannot lock you out: existing admins are
-- migrated automatically in step 3 before the new source becomes authoritative.
--
-- WHAT THIS CHANGES
--
--   Before: admin rights lived in `users.is_admin`, a column on the same row a
--           customer owns. Postgres RLS already prevented customers from
--           updating their own row, so self-promotion was not possible, but the
--           flag sat in customer-owned data and any future "users can update
--           their own profile" policy would have turned it into a privilege
--           escalation hole.
--
--   After:  admin rights live in a dedicated `admin_users` table that has RLS
--           enabled and NO POLICIES AT ALL. That means no anon key and no
--           logged-in user key can read it or write it - only the service role
--           (server-side, never in the browser) can. A customer cannot grant
--           themselves admin by any client-side means.
--
-- `users.is_admin` is kept in place and in sync for backwards compatibility,
-- but it is no longer the source of truth.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. The separate admin authorization table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  note       TEXT,
  granted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);


-- ----------------------------------------------------------------------------
-- 2. Lock it down: RLS ON, and deliberately NO policies
-- ----------------------------------------------------------------------------
-- With RLS enabled and no policy granting access, every request made with the
-- anon key or a logged-in user's key sees zero rows and cannot insert. The
-- service role bypasses RLS, so the server can still read it.
--
-- Do NOT add a SELECT policy here. Nothing in the browser needs to read this
-- table; the app asks the server "am I an admin?" and the server answers.
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Remove any permissive policy a previous run or manual edit may have added.
DROP POLICY IF EXISTS "Anyone can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can see their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Admins can see admin users" ON admin_users;


-- ----------------------------------------------------------------------------
-- 3. Migrate existing admins FIRST (this is what prevents a lockout)
-- ----------------------------------------------------------------------------
-- Every user who currently has users.is_admin = true becomes a row here.
-- ON CONFLICT DO NOTHING, so re-running never duplicates or overwrites.
INSERT INTO admin_users (user_id, email, note)
SELECT u.id, u.email, 'Migrated from users.is_admin'
FROM users u
WHERE u.is_admin = TRUE
ON CONFLICT (user_id) DO NOTHING;

-- Confirm at least one admin exists. If this returns 0, STOP and grant one
-- (step 6) before relying on the new source.
SELECT COUNT(*) AS admin_count FROM admin_users;


-- ----------------------------------------------------------------------------
-- 4. Make admin_users the authoritative source for RLS
-- ----------------------------------------------------------------------------
-- `is_admin_user()` already exists and is used by the RLS policies on users,
-- orders and videos. Redefining it here means every one of those policies
-- follows the new source with no policy changes.
--
-- CREATE OR REPLACE is used deliberately - DROP FUNCTION ... CASCADE would
-- silently remove every dependent policy.
CREATE OR REPLACE FUNCTION is_admin_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- ----------------------------------------------------------------------------
-- 5. Belt and braces: users.is_admin can no longer be changed via the API
-- ----------------------------------------------------------------------------
-- Blocks any attempt to change is_admin from a request carrying a non
-- service_role JWT - including a logged-in admin trying to promote someone by
-- editing the users table directly. Direct SQL (this editor, psql) carries no
-- JWT claims and is still allowed, so you are never locked out.
CREATE OR REPLACE FUNCTION prevent_is_admin_change()
RETURNS TRIGGER AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    BEGIN
      jwt_role := coalesce(
        current_setting('request.jwt.claims', true)::json ->> 'role',
        ''
      );
    EXCEPTION WHEN OTHERS THEN
      jwt_role := '';
    END;

    -- '' means no JWT at all (direct SQL) -> allowed.
    IF jwt_role <> '' AND jwt_role <> 'service_role' THEN
      RAISE EXCEPTION
        'users.is_admin cannot be changed through the API. Admin rights are managed in the admin_users table.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_prevent_is_admin_change ON users;
CREATE TRIGGER trigger_prevent_is_admin_change
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_is_admin_change();


-- ----------------------------------------------------------------------------
-- 6. Granting and revoking admin (run these by hand, here in the SQL Editor)
-- ----------------------------------------------------------------------------
-- GRANT admin to an existing signed-up account:
--
--   INSERT INTO admin_users (user_id, email, note)
--   SELECT id, email, 'Granted manually'
--   FROM users WHERE email = 'you@example.com'
--   ON CONFLICT (user_id) DO NOTHING;
--
--   UPDATE users SET is_admin = TRUE WHERE email = 'you@example.com';
--
-- REVOKE admin:
--
--   DELETE FROM admin_users
--   WHERE user_id = (SELECT id FROM users WHERE email = 'them@example.com');
--
--   UPDATE users SET is_admin = FALSE WHERE email = 'them@example.com';
--
-- The users.is_admin update is optional (it is only kept for compatibility),
-- and it works from this editor because direct SQL carries no JWT claims.


-- ----------------------------------------------------------------------------
-- 7. Verification (read-only)
-- ----------------------------------------------------------------------------
-- Who is an admin?
--   SELECT a.user_id, a.email, a.note, a.created_at FROM admin_users a ORDER BY a.created_at;
--
-- Is admin_users properly locked down? Expect rls_enabled = true and ZERO policies:
--   SELECT relname, relrowsecurity AS rls_enabled FROM pg_class WHERE relname = 'admin_users';
--   SELECT COUNT(*) AS policy_count FROM pg_policies WHERE tablename = 'admin_users';
--
-- Do the two sources agree?
--   SELECT u.email, u.is_admin AS legacy_flag, (a.user_id IS NOT NULL) AS authoritative_admin
--   FROM users u LEFT JOIN admin_users a ON a.user_id = u.id
--   WHERE u.is_admin = TRUE OR a.user_id IS NOT NULL;
-- ============================================================================
