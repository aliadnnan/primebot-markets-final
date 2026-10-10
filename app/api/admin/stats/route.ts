import { getAdminUserFromRequest, supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all orders. verification_status comes from sql/11; before it runs,
    // the column does not exist, so retry without it and report zeroes.
    let allOrders: any[] | null = null
    const first = await (supabaseServer as any)
      .from('orders')
      .select('status, bot_price, verification_status')
    if (first.error && (first.error as any).code === '42703') {
      const retry = await (supabaseServer as any).from('orders').select('status, bot_price')
      if (retry.error) {
        console.error('Error fetching orders:', retry.error)
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
      }
      allOrders = (retry.data || []).map((o: any) => ({ ...o, verification_status: null }))
    } else {
      if (first.error) {
        console.error('Error fetching orders:', first.error)
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
      }
      allOrders = first.data
    }

    const stats = {
      total: allOrders?.length || 0,
      pending: allOrders?.filter((o) => o.status === 'pending_verification').length || 0,
      verified: allOrders?.filter((o) => o.status === 'verified').length || 0,
      rejected: allOrders?.filter((o) => o.status === 'rejected').length || 0,
      delivered: allOrders?.filter((o) => o.status === 'delivered').length || 0,
      // Slip-verification gate counts (verification_status is a separate axis
      // from fulfillment status; may be null before sql/11 runs).
      verificationVerified:
        allOrders?.filter((o) => o.verification_status === 'verified').length || 0,
      verificationFailed:
        allOrders?.filter((o) => o.verification_status === 'failed').length || 0,
      totalRevenue: allOrders
        ?.filter((o) => o.status === 'verified' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.bot_price || 0), 0) || 0,
    }

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
