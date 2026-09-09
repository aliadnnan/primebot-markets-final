import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseServer,
  getUserFromRequest,
  isSupabaseServerConfigured,
  PAYMENT_PROOF_BUCKET,
} from '@/lib/supabase/server'
import { sendPaymentSubmittedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Finalizes a payment proof upload: confirms the object really landed in the
 * private bucket, then records its PATH against the order.
 *
 * The path is not taken on trust. It must start with `<verified user id>/<orderId>/`,
 * so a customer cannot point their order at somebody else's uploaded file, and
 * the object is confirmed to exist before the order is updated - otherwise a
 * failed browser upload could still mark the order as having a proof.
 */
export async function POST(request: NextRequest) {
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
        { success: false, error: 'You must be signed in to submit a payment proof.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    const path = typeof body?.path === 'string' ? body.path.trim() : ''
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : ''

    if (!orderId || !path) {
      return NextResponse.json(
        { success: false, error: 'Order ID and uploaded file path are both required.' },
        { status: 400 }
      )
    }

    // The path must live inside this user's own folder for this order.
    const expectedPrefix = `${user.id}/${orderId}/`
    if (!path.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { success: false, error: 'The uploaded file path does not belong to this order.' },
        { status: 403 }
      )
    }

    // ---- Ownership check -------------------------------------------------
    const { data: order, error: orderError } = await (supabaseServer as any)
      .from('orders')
      .select('id, user_id, bot_name')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json(
        { success: false, error: `Could not verify the order: ${orderError.message}` },
        { status: 400 }
      )
    }
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'This order does not belong to your account.' },
        { status: 403 }
      )
    }

    // ---- Confirm the object actually exists ------------------------------
    const lastSlash = path.lastIndexOf('/')
    const folder = path.slice(0, lastSlash)
    const objectName = path.slice(lastSlash + 1)

    const { data: listed, error: listError } = await supabaseServer.storage
      .from(PAYMENT_PROOF_BUCKET)
      .list(folder, { search: objectName, limit: 100 })

    if (listError) {
      console.error('[payment-proof/finalize] Could not verify the upload:', listError)
      return NextResponse.json(
        {
          success: false,
          error: `Could not confirm the uploaded file in the "${PAYMENT_PROOF_BUCKET}" bucket: ${listError.message}`,
        },
        { status: 400 }
      )
    }

    const exists = (listed || []).some((entry: any) => entry.name === objectName)
    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            'The payment proof was not found in storage, so it was not attached to your order. Please try uploading again.',
        },
        { status: 400 }
      )
    }

    // ---- Attach to the order --------------------------------------------
    const { data: updated, error: updateError } = await (supabaseServer as any)
      .from('orders')
      .update({ payment_proof_url: path })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: `The file uploaded successfully (${path}), but saving it to the order failed: ${updateError.message}`,
        },
        { status: 400 }
      )
    }

    // `.update()` reports no error when it matches zero rows, which would leave
    // the proof orphaned in storage with the order holding no reference.
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `The file uploaded successfully (${path}), but order ${orderId} was not updated. The proof is not attached.`,
        },
        { status: 400 }
      )
    }

    // Email is best-effort and must never fail an attached proof.
    if (user.email) {
      try {
        await sendPaymentSubmittedEmail(
          user.email,
          fullName || user.email,
          orderId,
          order.bot_name || 'your bot'
        )
      } catch (emailError) {
        console.error('[payment-proof/finalize] Email failed (proof kept):', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      path,
      message: 'Payment proof attached to your order.',
    })
  } catch (error) {
    console.error('[payment-proof/finalize] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
