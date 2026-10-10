-- ============================================================================
-- 11_payment_proof_verification.sql
-- Payment-proof verification (owner order 2026-10-10):
--
-- However a buyer pays (Binance Pay, Easypaisa, JazzCash, bank, any method),
-- they submit: payment method, their name, amount sent, TID (transaction id),
-- and a payment-slip picture. Before the purchase request proceeds, the slip
-- is verified: the name and TID visible on the slip must match what the buyer
-- typed, and the amount must match too. A mismatch or unreadable slip must
-- NOT be auto-approved (fake-slip protection).
--
-- RUN ORDER: run ONCE in the Supabase SQL Editor (order does not matter vs
-- sql/01..sql/10; the app works before this is run). Fully idempotent: every
-- change is guarded, it DROPS nothing, DELETES no rows and changes no
-- existing data.
--
-- New columns on orders:
--   1. payer_name            TEXT          - name the buyer typed on the form
--   2. amount_paid           DECIMAL(10,2) - amount the buyer says they sent
--   3. verification_status   TEXT          - 'pending' | 'verified' | 'failed'
--      ('verified' = every field matched the slip via OCR, order APPROVED
--                   automatically and proceeds to delivery
--       'failed'   = any mismatch or unreadable slip. The order is REJECTED
--                   automatically with a clear message to the buyer ("wrong
--                   TID/name on the slip - upload the correct one"). It must
--                   NOT proceed and must NEVER auto-approve.
--       This is a hard PASS/FAIL gate, not a review queue.)
--   4. verification_detail   JSONB         - audit trail: per-field results,
--      the OCR text, reasons, timestamps, and the history of failed attempts.
--      The admin can SEE failed attempts (fraud visibility) but takes no
--      action on them; they only proceed if the buyer resubmits correctly.
--   5. delivery_email       TEXT          - email the buyer shares in the
--      purchase flow. The bot is delivered to THIS email.
--   6. buyer_phone          TEXT          - buyer's phone number (required).
--   7. buyer_whatsapp       TEXT          - buyer's WhatsApp number (required).
--      Together with delivery_email these form the full record of who the
--      buyer was, shown in the admin requests dashboard and audit view.
--   8. delivered_to_email   TEXT          - permanent record: which email the
--      bot was actually delivered to, set when the order is marked
--      delivered. The owner can later prove "we delivered this bot to this
--      email".
--
-- NOTE: this is deliberately a SEPARATE axis from orders.status
-- ('pending_verification' | 'verified' | 'rejected' | 'delivered'), which stays
-- the fulfillment status and still changes only by explicit admin action.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'verified', 'failed'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS verification_detail JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_whatsapp TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_to_email TEXT;

-- ----------------------------------------------------------------------------
-- 2. Index for the admin panel's verification filters
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_verification_status
  ON orders (verification_status);

-- ----------------------------------------------------------------------------
-- 3. Verify afterwards (optional)
-- ----------------------------------------------------------------------------
--   SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'orders'
--     AND column_name IN ('payer_name', 'amount_paid', 'verification_status', 'verification_detail', 'delivery_email', 'buyer_phone', 'buyer_whatsapp', 'delivered_to_email');
--
--   SELECT id, payer_name, amount_paid, verification_status, status
--   FROM orders ORDER BY created_at DESC LIMIT 10;
