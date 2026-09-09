import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseServer,
  getUserFromRequest,
  isSupabaseServerConfigured,
  BOT_DELIVERY_BUCKET,
} from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Secure customer download of their purchased EA/bot file.
 *
 * Guarantees:
 *   - The caller must be signed in (verified Bearer token, not a body value).
 *   - The order must belong to that caller. Another customer requesting this
 *     order id gets 404, not the file - and not a different error, so order ids
 *     cannot be probed for existence.
 *   - Payment must be verified or delivered. An unpaid order cannot download.
 *   - The response is a SHORT-LIVED signed URL (5 minutes) for the private
 *     bot-deliveries bucket. No public URL is ever produced, and the storage
 *     path is never sent to the browser.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
        { success: false, error: 'You must be signed in to download your purchase.' },
        { status: 401 }
      )
    }

    const { data: order, error } = await (supabaseServer as any)
      .from('orders')
      .select('id, user_id, status, bot_name, delivery_file_path, delivery_file_name')
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      const missingColumn = /delivery_file_path/.test(error.message || '')
      return NextResponse.json(
        {
          success: false,
          error: missingColumn
            ? 'The delivery system is not set up yet. Run sql/05_future_proof_setup.sql in Supabase.'
            : `Could not read the order: ${error.message}`,
        },
        { status: 400 }
      )
    }

    // Deliberately identical response for "does not exist" and "not yours", so
    // order ids cannot be enumerated.
    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }

    if (order.status !== 'verified' && order.status !== 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Your payment has not been verified yet. Your download will appear here once an administrator approves it.',
          status: order.status,
        },
        { status: 403 }
      )
    }

    if (!order.delivery_file_path) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Your payment is verified, but the delivery file has not been attached yet. Please check back shortly.',
          status: order.status,
        },
        { status: 404 }
      )
    }

    const { data: signed, error: signError } = await supabaseServer.storage
      .from(BOT_DELIVERY_BUCKET)
      .createSignedUrl(order.delivery_file_path, 300, {
        download: order.delivery_file_name || true,
      })

    if (signError || !signed?.signedUrl) {
      console.error('[orders/download] Could not sign delivery file:', {
        orderId: order.id,
        error: signError,
      })
      return NextResponse.json(
        {
          success: false,
          error:
            'Your download link could not be generated. Please contact support so we can re-attach your file.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signed.signedUrl,
      fileName: order.delivery_file_name || 'bot-delivery',
      botName: order.bot_name,
      expiresInSeconds: 300,
    })
  } catch (error) {
    console.error('[orders/download] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
