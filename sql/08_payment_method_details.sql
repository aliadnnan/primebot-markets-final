-- ============================================================================
-- PrimeBot Markets — Payment method details
-- ============================================================================
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Adds the fields customers need in order to actually pay:
--   account_holder_name  — who the payment is being sent to
--   qr_code_url          — optional QR image (Binance Pay / Bybit Pay)
--
-- DELETES nothing. DROPS nothing. Does NOT overwrite any account number,
-- instruction or name you have already configured. Every UPDATE below is
-- guarded so re-running changes nothing.
--
-- Depends on sql/05_future_proof_setup.sql for is_active / display_order.
-- If you have not run that yet, run it first (or run it after — both work; the
-- app retries without those columns until they exist).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. What is actually configured right now? (read this before changing anything)
-- ----------------------------------------------------------------------------
SELECT id, name, account_type, account_number, instructions
FROM payment_methods
ORDER BY id;


-- ----------------------------------------------------------------------------
-- 2. Add the new columns
-- ----------------------------------------------------------------------------
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS qr_code_url TEXT;


-- ----------------------------------------------------------------------------
-- 3. Nothing is auto-filled
-- ----------------------------------------------------------------------------
-- No default account holder name is inserted, deliberately. Inventing one would
-- be fake data, and a customer sending money to a wrong name is worse than a
-- blank field. Set them in the Admin Panel (Payment Methods -> Edit), or here:
--
--   UPDATE payment_methods
--   SET account_holder_name = 'YOUR REAL NAME AS REGISTERED'
--   WHERE id = 'jazzcash';
--
--   UPDATE payment_methods
--   SET account_holder_name = 'YOUR REAL NAME AS REGISTERED'
--   WHERE id = 'easypaisa';
--
-- Binance Pay / Bybit Pay usually need an ID or UID rather than a phone number.
-- Use account_type to label what the number is, so the checkout labels it
-- correctly for the customer:
--
--   UPDATE payment_methods
--   SET account_type = 'Binance Pay ID', account_number = '<your pay id>'
--   WHERE id = 'binance';
--
--   UPDATE payment_methods
--   SET account_type = 'Bybit UID', account_number = '<your uid>'
--   WHERE id = 'bybit';
--
-- The checkout uses account_type as the label above the number, so setting it
-- to "Binance Pay ID" makes the customer see "Binance Pay ID:" rather than
-- "Account Number:".


-- ----------------------------------------------------------------------------
-- 4. QR codes (optional)
-- ----------------------------------------------------------------------------
-- qr_code_url takes any URL the browser can load. The simplest route is to
-- upload the image to an existing PUBLIC bucket, or use a public URL you
-- already host, then:
--
--   UPDATE payment_methods SET qr_code_url = 'https://.../binance-qr.png'
--   WHERE id = 'binance';
--
-- Do NOT put a QR code in the payment-proofs or bot-deliveries buckets — both
-- are private, so the customer's browser could not load the image.


-- ----------------------------------------------------------------------------
-- 5. Verification
-- ----------------------------------------------------------------------------
-- Confirm the columns exist:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payment_methods'
ORDER BY ordinal_position;

-- What the customer will see for each ENABLED method.
-- A blank account_number here is exactly what makes the checkout show
-- "This payment method has no account number configured".
SELECT id,
       name,
       account_type        AS label_shown_to_customer,
       account_number      AS value_shown_to_customer,
       account_holder_name,
       (qr_code_url IS NOT NULL) AS has_qr_code,
       instructions
FROM payment_methods
ORDER BY id;
