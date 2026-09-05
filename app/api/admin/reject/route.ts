import { supabaseServer } from '@/lib/supabase/server'
import { sendPaymentRejectedEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json()

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 })
    }

    // Get user from auth
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await (supabaseServer as any)
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get order with customer data
    const { data: orderData, error: orderError } = await supabaseServer
      .from('orders')
      .select('*, users:user_id(id, email, full_name)')
      .eq('id', orderId)
      .single()

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status to rejected
    const { error: updateError } = await (supabaseServer as any)
      .from('orders')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    // Send rejection email
    try {
      const customerUser = Array.isArray((orderData as any).users) ? (orderData as any).users[0] : (orderData as any).users
      if (customerUser && 'email' in customerUser && 'full_name' in customerUser) {
        await sendPaymentRejectedEmail(
          customerUser.email,
          customerUser.full_name || 'Customer',
          orderId,
          (orderData as any).bot_name,
          reason
        )
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail if email fails
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error rejecting order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
