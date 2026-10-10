-- ============================================================================
-- 09_new_tier_bots.sql
-- Adds the two new top product tiers (owner order 2026-10-10):
--   PRIME QUANTUM EA  $800  (display_order 4)
--   PRIME ELITE EA    $1000 (display_order 5)
-- alongside the existing PRIME SCALPER EA $200, PRIME HEDGE EA $400 and
-- PRIME AI ALGORITHM EA $600 (unchanged).
--
-- RUN ORDER: run AFTER sql/05_future_proof_setup.sql - this script uses the
-- is_active / available_for_purchase / display_order columns that 05 adds.
-- Run it ONCE in the Supabase SQL Editor. It is idempotent: if a bot with the
-- same id already exists (e.g. the admin added it by hand first), the row is
-- left exactly as the admin has it.
--
-- ALTERNATIVE (no SQL): sign in as admin -> Admin Panel -> Bot Management ->
-- Add Bot, with id "quantum" / "elite" and the values below.
-- ============================================================================

INSERT INTO bots (id, name, type, price, description, features, is_active, available_for_purchase, display_order)
VALUES
  (
    'quantum',
    'PRIME QUANTUM EA',
    'Quantum AI Trading EA',
    800.00,
    'Quantum AI engine with multi-pair intelligence, smart recovery and an advanced risk manager',
    '["Quantum AI engine", "Multi-pair trading including XAUUSD", "Smart recovery system", "Advanced risk manager", "Multiple strategies in one EA", "Priority support", "Lifetime updates"]'::jsonb,
    TRUE, TRUE, 4
  ),
  (
    'elite',
    'PRIME ELITE EA',
    'Elite Institutional Trading EA',
    1000.00,
    'Our flagship institutional-grade EA with an XAUUSD specialist mode, prop-firm mode and VIP onboarding',
    '["Everything in PRIME QUANTUM EA", "Institutional-grade AI engine", "XAUUSD specialist mode", "Prop-firm friendly mode", "Lowest-drawdown mode", "VIP 1-on-1 onboarding & setup support", "Priority support", "Lifetime updates & license"]'::jsonb,
    TRUE, TRUE, 5
  )
ON CONFLICT (id) DO NOTHING;

-- Keep the catalogue in price/tier order even if the display_order column was
-- populated differently by an earlier partial run. Guarded the same way as
-- sql/05: only rows still at the default order are touched.
UPDATE bots SET display_order = 4 WHERE id = 'quantum' AND display_order = 0;
UPDATE bots SET display_order = 5 WHERE id = 'elite'   AND display_order = 0;

-- Verify afterwards:
--   SELECT id, name, price, is_active, display_order FROM bots ORDER BY display_order;
