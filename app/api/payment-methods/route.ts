import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  normalisePaymentMethods,
  PAYMENT_METHOD_COLUMNS,
  PAYMENT_METHOD_COLUMNS_LEGACY,
} from '@/lib/payment-methods'

export const dynamic = 'force-dynamic'

/**
 * Public list of ENABLED payment methods, with their real configured details.
 *
 * Returned in the camelCase shape the checkout renders (see
 * lib/payment-methods.ts) so account numbers cannot silently render blank.
 *
 * NO FALLBACK TO HARD-CODED CONSTANTS. Showing a stale account number from
 * source when the database is unreachable would send a customer's money to the
 * wrong place. If the methods cannot be read, this returns an error and the
 * checkout tells the customer to contact support instead of displaying
 * anything potentially wrong.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    return NextResponse.json(
      {
        success: false,
        error: 'Payment methods are unavailable: Supabase is not configured on the server.',
        methods: [],
      },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })

    let { data, error } = await (supabase as any)
      .from('payment_methods')
      .select(PAYMENT_METHOD_COLUMNS)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // account_holder_name / qr_code_url / is_active / display_order are added by
    // sql/08_payment_method_details.sql. Retry with the original columns so the
    // checkout keeps working before that migration is applied.
    if (error) {
      const legacy = await (supabase as any)
        .from('payment_methods')
        .select(PAYMENT_METHOD_COLUMNS_LEGACY)
        .order('name', { ascending: true })
      data = legacy.data
      error = legacy.error
    }

    if (error) {
      console.error('[payment-methods] Could not read payment methods:', error)
      return NextResponse.json(
        {
          success: false,
          error: `Could not read the payment methods: ${error.message}`,
          methods: [],
        },
        { status: 400 }
      )
    }

    const methods = normalisePaymentMethods(data)

    return NextResponse.json({ success: true, count: methods.length, methods })
  } catch (error) {
    console.error('[payment-methods] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while reading the payment methods.',
        methods: [],
      },
      { status: 500 }
    )
  }
}
