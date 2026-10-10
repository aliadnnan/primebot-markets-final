import { getAdminUserFromRequest, supabaseServer } from '@/lib/supabase/server'
import { sendPaymentApprovedEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
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

    // HARD GATE: an unverified slip can never be approved through this path.
    // Only a slip that passed automatic verification (verification_status =
    // 'verified') may be approved from the admin list. Failed slips are
    // already auto-rejected; they need no admin action and cannot proceed.
    if ((orderData as any).verification_status !== 'verified') {
      return NextResponse.json(
        {
          error:
            'This order cannot be approved: its payment slip was not verified (status: ' +
            String((orderData as any).verification_status ?? 'unknown') +
            '). Only verified requests can be approved.',
        },
        { status: 400 }
      )
    }

    // Update order status to verified
    const { error: updateError } = await (supabaseServer as any)
      .from('orders')
      .update({
        status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    // Send approval email — to the delivery email the buyer shared in the
    // purchase flow (falling back to the account email).
    try {
      const customerUser = Array.isArray((orderData as any).users) ? (orderData as any).users[0] : (orderData as any).users
      const deliveryEmail = (orderData as any).delivery_email as string | undefined
      const accountEmail =
        customerUser && 'email' in customerUser ? customerUser.email : undefined
      const recipient = deliveryEmail || accountEmail
      if (recipient) {
        await sendPaymentApprovedEmail(
          recipient,
          (customerUser && 'full_name' in customerUser && customerUser.full_name) ||
            (orderData as any).payer_name ||
            'Customer',
          orderId,
          (orderData as any).bot_name
        )
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail if email fails
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error approving order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
