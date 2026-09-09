-- ============================================================================
-- PrimeBot Markets — Future-proofing migration
-- ============================================================================
-- Run ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run. It is fully idempotent and it:
--
--   * creates NO new tables that already exist (uses IF NOT EXISTS throughout)
--   * DROPS nothing
--   * DELETES no rows
--   * inserts NO duplicate defaults (every insert is guarded)
--   * only ADDS columns and indexes
--
-- What it enables:
--   1. Admin Bot Management         (bots.is_active, available_for_purchase)
--   2. Admin Payment Method mgmt    (payment_methods.is_active, display_order)
--   3. Secure bot file delivery     (orders.delivery_file_path, delivered_at)
--   4. Transaction ID reuse checks  (index; optional unique constraint)
--
-- Video columns (published / is_public / autoplay) are handled by
-- sql/01_video_visibility_and_autoplay.sql — run that one too if you have not.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. BOT MANAGEMENT
-- ----------------------------------------------------------------------------
-- is_active               -> shown on the website at all
-- available_for_purchase  -> can be selected in checkout
-- Existing bots default to active and purchasable, preserving current behaviour.
ALTER TABLE bots ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS available_for_purchase BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Keep the existing three bots in their current display order.
-- Guarded so re-running changes nothing that an admin has since edited.
UPDATE bots SET display_order = 1 WHERE id = 'scalper' AND display_order = 0;
UPDATE bots SET display_order = 2 WHERE id = 'hedge'   AND display_order = 0;
UPDATE bots SET display_order = 3 WHERE id = 'ai'      AND display_order = 0;

CREATE INDEX IF NOT EXISTS idx_bots_active ON bots(is_active, display_order);


-- ----------------------------------------------------------------------------
-- 2. PAYMENT METHOD MANAGEMENT
-- ----------------------------------------------------------------------------
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE payment_methods SET display_order = 1 WHERE id = 'jazzcash'  AND display_order = 0;
UPDATE payment_methods SET display_order = 2 WHERE id = 'easypaisa' AND display_order = 0;
UPDATE payment_methods SET display_order = 3 WHERE id = 'binance'   AND display_order = 0;
UPDATE payment_methods SET display_order = 4 WHERE id = 'bybit'     AND display_order = 0;

CREATE INDEX IF NOT EXISTS idx_payment_methods_active
  ON payment_methods(is_active, display_order);


-- ----------------------------------------------------------------------------
-- 3. SECURE BOT FILE DELIVERY
-- ----------------------------------------------------------------------------
-- delivery_file_path  -> PATH inside the private bot-deliveries bucket
--                        (never a public URL; signed on demand)
-- delivered_at        -> when the admin completed delivery
-- Existing orders keep delivery_file_path NULL and are unaffected. Orders
-- already marked 'delivered' keep that status.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_file_path TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_file_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_orders_delivery
  ON orders(status, delivered_at);

-- Historical accuracy: orders already store bot_name and bot_price as their own
-- columns, so changing a bot's price later never rewrites past orders. Nothing
-- to change here - noted so it is not "fixed" by mistake later.


-- ----------------------------------------------------------------------------
-- 4. TRANSACTION ID REUSE PREVENTION
-- ----------------------------------------------------------------------------
-- The application checks this on the server before creating an order. This
-- index makes that check fast and is safe on existing data.
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);

-- OPTIONAL hard database constraint.
-- Run the SELECT first. A unique index CANNOT be created while duplicates
-- exist, and forcing it would fail; this is why it is not applied automatically.
--
--   SELECT transaction_id, COUNT(*)
--   FROM orders
--   GROUP BY transaction_id
--   HAVING COUNT(*) > 1;
--
-- If that returns no rows, you may optionally enforce it at database level:
--
--   CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_transaction_id_unique
--     ON orders (lower(trim(transaction_id)));
--
-- Leave it out if you ever legitimately need the same reference twice.


-- ----------------------------------------------------------------------------
-- 5. VERIFICATION (read-only — run these to confirm)
-- ----------------------------------------------------------------------------
-- New bot columns:
--   SELECT id, name, price, is_active, available_for_purchase, display_order
--   FROM bots ORDER BY display_order;
--
-- New payment method columns:
--   SELECT id, name, account_number, is_active, display_order
--   FROM payment_methods ORDER BY display_order;
--
-- New order columns:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'orders'
--     AND column_name IN ('delivery_file_path','delivery_file_name','delivered_at');


-- ============================================================================
-- MANUAL STEP STILL REQUIRED — ONE NEW PRIVATE STORAGE BUCKET
-- ============================================================================
-- Bot delivery files need their own private bucket. This is NOT a duplicate of
-- an existing bucket; there is currently nowhere private to put them.
--
--   Dashboard -> Storage -> New bucket
--     Name:            bot-deliveries
--     Public bucket:   OFF   (must stay private)
--     File size limit: 100 MB   (adjust to your largest EA file)
--
-- Do NOT add any public read policy. All customer downloads go through
-- /api/orders/[id]/download, which verifies the signed-in customer owns the
-- order and only then mints a short-lived signed URL with the service role key.
-- No storage.objects policy is needed for that, because the service role
-- bypasses RLS.
--
-- Existing buckets are unchanged and must keep their exact IDs:
--   video-content        (videos)
--   video-thumbnils      (thumbnails)
--   payment-proofs       (payment proofs, private)
-- ============================================================================
