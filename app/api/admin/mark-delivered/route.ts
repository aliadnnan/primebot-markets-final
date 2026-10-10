import { getAdminUserFromRequest, supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Read the order first so the permanent delivery record can capture
    // WHICH email the bot was delivered to. Before sql/11 runs the
    // delivery_email column does not exist — fall back gracefully.
    let orderData: any = null
    const firstRead = await (supabaseServer as any)
      .from('orders')
      .select('id, delivery_email')
      .eq('id', orderId)
      .single()
    if (firstRead.error && (firstRead.error as any).code === '42703') {
      const retryRead = await (supabaseServer as any)
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single()
      if (retryRead.error || !retryRead.data) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      orderData = retryRead.data
    } else {
      if (firstRead.error || !firstRead.data) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      orderData = firstRead.data
    }

    // Update order status to delivered, recording the delivery email
    // permanently. The owner can later prove "we delivered this bot to
    // this email". Falls back gracefully before sql/11 is run.
    let updateError: any = null
    const deliveredAt = new Date().toISOString()
    const firstUpdate = await (supabaseServer as any)
      .from('orders')
      .update({
        status: 'delivered',
        delivered_to_email: (orderData as any).delivery_email || null,
        updated_at: deliveredAt,
      })
      .eq('id', orderId)
    updateError = firstUpdate.error
    if (updateError && (updateError as any).code === '42703') {
      // delivered_to_email column does not exist yet (sql/11 not run).
      const retry = await (supabaseServer as any)
        .from('orders')
        .update({ status: 'delivered', updated_at: deliveredAt })
        .eq('id', orderId)
      updateError = retry.error
    }

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error marking delivered:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
