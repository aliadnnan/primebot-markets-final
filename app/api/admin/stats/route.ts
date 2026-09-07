import { getAdminUserFromRequest, supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all orders
    const { data: allOrders, error: ordersError } = await (supabaseServer as any)
      .from('orders')
      .select('status, bot_price')

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    const stats = {
      total: allOrders?.length || 0,
      pending: allOrders?.filter((o) => o.status === 'pending_verification').length || 0,
      verified: allOrders?.filter((o) => o.status === 'verified').length || 0,
      rejected: allOrders?.filter((o) => o.status === 'rejected').length || 0,
      delivered: allOrders?.filter((o) => o.status === 'delivered').length || 0,
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
