import { supabaseServer, getUserFromRequest, isSupabaseServerConfigured } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Reads the Authorization header, so it can never be statically rendered.
export const dynamic = 'force-dynamic'

/**
 * The signed-in customer's own orders ("My Orders").
 *
 * Previously this called `supabaseServer.auth.getUser()` with no argument.
 * `supabaseServer` is the SERVICE ROLE client with `persistSession: false` and
 * no user context, so that call always resolved to null and every request got
 * 401 - the My Orders page could never load, for anyone.
 *
 * The user is now resolved by verifying the request's Bearer token against
 * Supabase. The user id used in the query comes from that verified token and
 * never from the request body or a query parameter, so one customer cannot read
 * another customer's orders.
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseServerConfigured) {
      return NextResponse.json(
        { success: false, error: 'Server is not configured to reach Supabase.' },
        { status: 500 }
      )
    }

    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not signed in, or your session has expired. Please sign in again.',
        },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[orders/list] Error fetching orders:', error)
      return NextResponse.json(
        { success: false, error: `Could not read your orders: ${error.message}` },
        { status: 400 }
      )
    }

    // Never expose the raw storage paths to the browser. Whether a proof or a
    // delivery file exists is reported as booleans; the actual download goes
    // through /api/orders/[id]/download, which re-checks ownership.
    const orders = (data || []).map((order: any) => {
      const { payment_proof_url, delivery_file_path, ...safe } = order
      return {
        ...safe,
        has_payment_proof: Boolean(payment_proof_url),
        has_delivery_file: Boolean(delivery_file_path),
      }
    })

    return NextResponse.json({ success: true, count: orders.length, orders }, { status: 200 })
  } catch (error) {
    console.error('[orders/list] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
