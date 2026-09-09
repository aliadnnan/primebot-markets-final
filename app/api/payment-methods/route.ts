import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PAYMENT_METHODS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

/**
 * Public list of ENABLED payment methods, read from `payment_methods` so the
 * admin can change account numbers without a code change.
 *
 * Only fields the customer needs are returned. `lib/constants.ts`
 * PAYMENT_METHODS remains a fallback for database outages.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    return NextResponse.json({
      success: true,
      methods: PAYMENT_METHODS,
      source: 'fallback-constants',
    })
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })

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
      if (error) console.error('[payment-methods] Could not read, using constants:', error)
      return NextResponse.json({
        success: true,
        methods: PAYMENT_METHODS,
        source: 'fallback-constants',
      })
    }

    return NextResponse.json({ success: true, methods: data, source: 'database' })
  } catch (error) {
    console.error('[payment-methods] Unexpected error, using constants:', error)
    return NextResponse.json({
      success: true,
      methods: PAYMENT_METHODS,
      source: 'fallback-constants',
    })
  }
}
