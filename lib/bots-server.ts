import { createClient } from '@supabase/supabase-js'
import { BOTS, PAYMENT_METHODS } from './constants'
import type { Bot, PaymentMethod } from '@/types'

/**
 * Server-side reads of the admin-managed bots and payment methods.
 *
 * Used by server components (home, /bots, /pricing) so the public site shows
 * whatever the admin has configured instead of values baked into the source.
 *
 * `lib/constants.ts` is kept as a FALLBACK for database outages, so the site
 * never renders an empty product list. It is never used to price an order:
 * /api/orders/create always re-reads the authoritative price from the database.
 */
function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getActiveBots(): Promise<Bot[]> {
  const supabase = serverClient()
  if (!supabase) return BOTS

  try {
    let { data, error } = await (supabase as any)
      .from('bots')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // is_active / display_order are added by sql/05_future_proof_setup.sql.
    if (error) {
      const fallback = await (supabase as any).from('bots').select('*').order('price')
      data = fallback.data
      error = fallback.error
    }

    if (error || !data || data.length === 0) {
      if (error) console.error('[bots-server] Falling back to constants:', error.message)
      return BOTS
    }

    return data as Bot[]
  } catch (error) {
    console.error('[bots-server] Falling back to constants:', error)
    return BOTS
  }
}

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = serverClient()
  if (!supabase) return PAYMENT_METHODS

  try {
    let { data, error } = await (supabase as any)
      .from('payment_methods')
      .select('id, name, description, account_number, account_type, instructions')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      const fallback = await (supabase as any)
        .from('payment_methods')
        .select('id, name, description, account_number, account_type, instructions')
        .order('name')
      data = fallback.data
      error = fallback.error
    }

    if (error || !data || data.length === 0) {
      if (error) console.error('[bots-server] Falling back to constants:', error.message)
      return PAYMENT_METHODS
    }

    return data as PaymentMethod[]
  } catch (error) {
    console.error('[bots-server] Falling back to constants:', error)
    return PAYMENT_METHODS
  }
}
