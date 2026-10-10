import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseServer,
  getUserFromRequest,
  isSupabaseServerConfigured,
  PAYMENT_PROOF_BUCKET,
  BOT_DELIVERY_BUCKET,
} from '@/lib/supabase/server'
import {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
  sendBotDeliveredEmail,
} from '@/lib/email'
import {
  buyerFailMessage,
  extractSlipText,
  verifyPaymentProof,
  type VerificationDetail,
} from '@/lib/proof-verification'
import { isMissingColumnError } from '@/lib/video-columns'

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
    let order: any = null
    {
      const { data, error } = await (supabaseServer as any)
        .from('orders')
        .select(
          'id, user_id, bot_id, bot_name, bot_price, payment_method, transaction_id, payer_name, amount_paid, delivery_email, verification_detail'
        )
        .eq('id', orderId)
        .maybeSingle()

      if (error && isMissingColumnError(error)) {
        // sql/11 has not been run yet: read the order without the new columns.
        const { data: legacy, error: legacyError } = await (supabaseServer as any)
          .from('orders')
          .select('id, user_id, bot_id, bot_name')
          .eq('id', orderId)
          .maybeSingle()
        if (legacyError) {
          return NextResponse.json(
            { success: false, error: `Could not verify the order: ${legacyError.message}` },
            { status: 400 }
          )
        }
        order = legacy
      } else if (error) {
        return NextResponse.json(
          { success: false, error: `Could not verify the order: ${error.message}` },
          { status: 400 }
        )
      } else {
        order = data
      }
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
    // The file and the path are attached first so a failed verification can
    // never leave the proof orphaned: the audit trail stays on the order.
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

    // ---- PAYMENT-PROOF VERIFICATION (hard PASS/FAIL gate) ---------------
    // OCR the slip and cross-check what the buyer typed against the slip.
    // ALL MATCH -> order approved automatically (status 'verified', proceeds
    // to the normal delivery step).
    // ANY MISMATCH / unreadable -> order REJECTED automatically with a clear
    // message to the buyer. Never proceeds, never auto-approves, never queues
    // for review. The buyer may resubmit the correct slip against this same
    // order, which re-runs this whole check.
    let detail: VerificationDetail | null = null
    {
      const typedAmount =
        order.amount_paid === null || order.amount_paid === undefined
          ? null
          : Number(order.amount_paid)
      const botPrice =
        order.bot_price === null || order.bot_price === undefined
          ? null
          : Number(order.bot_price)

      const { bytes, mimeType } = await downloadProofFile(path)
      const ocr = await extractSlipText(bytes, mimeType)

      const checked = verifyPaymentProof({
        payerName: order.payer_name ?? fullName ?? null,
        typedTid: order.transaction_id ?? null,
        typedAmount: Number.isFinite(typedAmount as number) ? (typedAmount as number) : null,
        paymentMethod: order.payment_method ?? null,
        botPrice: Number.isFinite(botPrice as number) ? (botPrice as number) : null,
        ocrText: ocr.text,
        ocrStatus: ocr.status,
      })

      // Keep the history of failed attempts for the admin's read-only audit.
      const attempts: Array<Record<string, any>> = []
      const previous = (order as any).verification_detail
      if (previous && typeof previous === 'object') {
        const { attempts: prevAttempts, ...prevRest } = previous
        if (Array.isArray(prevAttempts)) attempts.push(...prevAttempts)
        attempts.push(prevRest)
      }
      detail = { ...checked, attempts } as VerificationDetail
    }

    const failed = detail.status !== 'verified'
    const buyerMessage = failed
      ? buyerFailMessage(detail)
      : 'Your payment has been verified and your order is approved.'

    // Persist the decision. The fulfillment status is decided HERE, by this
    // check: no code path ever fulfills a failed order.
    const decisionPayload: Record<string, any> = failed
      ? {
          status: 'rejected',
          rejection_reason: buyerMessage,
          verification_status: 'failed',
          verification_detail: detail,
        }
      : {
          status: 'verified',
          rejection_reason: null,
          verification_status: 'verified',
          verification_detail: detail,
        }

    {
      const { error: decisionError } = await (supabaseServer as any)
        .from('orders')
        .update(decisionPayload)
        .eq('id', orderId)
        .eq('user_id', user.id)

      if (decisionError && isMissingColumnError(decisionError)) {
        // sql/11 has not been run yet. The gate decision itself is still
        // enforced through the plain fulfillment columns, so a fake slip can
        // never slip through; only the audit columns are skipped.
        const { error: legacyError } = await (supabaseServer as any)
          .from('orders')
          .update(
            failed
              ? { status: 'rejected', rejection_reason: buyerMessage }
              : { status: 'verified', rejection_reason: null }
          )
          .eq('id', orderId)
          .eq('user_id', user.id)
        if (legacyError) {
          console.error('[payment-proof/finalize] Decision update failed:', legacyError)
        }
      } else if (decisionError) {
        console.error('[payment-proof/finalize] Decision update failed:', decisionError)
      }
    }

    // Emails are best-effort and must never change the decision above.
    // They go to the buyer's delivery email (the email the bot is delivered
    // to), falling back to the account email.
    const notifyEmail = order.delivery_email || user.email
    if (notifyEmail) {
      try {
        if (failed) {
          await sendPaymentRejectedEmail(
            notifyEmail,
            fullName || notifyEmail,
            orderId,
            order.bot_name || 'your bot',
            buyerMessage
          )
        } else {
          await sendPaymentApprovedEmail(
            notifyEmail,
            fullName || notifyEmail,
            orderId,
            order.bot_name || 'your bot'
          )

          // AUTO EMAIL DELIVERY (owner order 2026-10-10): the moment the
          // verification gate approves an order, the buyer is emailed the bot
          // file automatically - no admin click needed. The file is the one
          // the admin attached ONCE per bot (bots.delivery_file_path,
          // sql/12). A 7-day signed URL is generated from the private
          // bot-deliveries bucket and emailed; the order keeps the permanent
          // delivered_to_email record and the file path, so the in-dashboard
          // download works too. Never runs for failed/rejected orders. The
          // manual admin "Attach & mark delivered" path still works as a
          // fallback / re-send.
          await autoDeliverBotFile({
            orderId,
            botId: (order as any).bot_id ?? null,
            notifyEmail,
            buyerName: fullName || notifyEmail,
            botName: order.bot_name || 'your bot',
          })
        }
      } catch (emailError) {
        console.error('[payment-proof/finalize] Email failed (decision kept):', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      path,
      verification: {
        status: detail.status,
        name_match: detail.name_match,
        tid_match: detail.tid_match,
        amount_match: detail.amount_match,
        message: failed
          ? buyerMessage
          : 'Payment proof verified. Your order is approved.',
      },
    })
  } catch (error) {
    console.error('[payment-proof/finalize] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

/**
 * AUTO EMAIL DELIVERY on verified approval.
 *
 * When the verification gate approves an order, the buyer is emailed the bot
 * file immediately - no admin click needed. The file is the per-bot delivery
 * file the admin attached once in Bot Management (bots.delivery_file_path,
 * sql/12). A 7-day signed URL is generated from the private bot-deliveries
 * bucket and emailed to the buyer's delivery email; the order keeps the
 * permanent delivered_to_email record and the file path, so the in-dashboard
 * download works too.
 *
 * Best-effort: any failure is logged and the (already persisted) approval is
 * untouched. The manual admin "Attach & mark delivered" path still works as a
 * fallback / re-send. If the bot has no delivery file attached yet, this is a
 * no-op and the admin attaches it per order as before.
 */
const EMAIL_LINK_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

async function autoDeliverBotFile(args: {
  orderId: string
  botId: string | null
  notifyEmail: string
  buyerName: string
  botName: string
}): Promise<void> {
  const { orderId, botId, notifyEmail, buyerName, botName } = args
  if (!botId) {
    console.warn('[auto-deliver] No bot_id on order, skipping auto email:', orderId)
    return
  }

  // Read the bot's pre-attached delivery file. If sql/12 has not been run,
  // the columns do not exist - fall back gracefully (admin path still works).
  let bot: any = null
  {
    const first = await (supabaseServer as any)
      .from('bots')
      .select('id, delivery_file_path, delivery_file_name')
      .eq('id', botId)
      .maybeSingle()
    if (first.error) {
      if (/delivery_file_path|delivery_file_name/.test(first.error.message || '')) {
        console.warn('[auto-deliver] sql/12 not run yet - skipping auto email:', orderId)
        return
      }
      console.error('[auto-deliver] Could not read bot:', first.error)
      return
    }
    bot = first.data
  }
  const filePath = bot?.delivery_file_path as string | null
  if (!filePath) {
    // The admin has not attached a delivery file to this bot yet. The order
    // stays approved; the admin attaches the file per order as before.
    console.warn('[auto-deliver] Bot has no delivery file attached, skipping auto email:', {
      orderId,
      botId,
    })
    return
  }
  const fileName = (bot?.delivery_file_name as string) || botName

  const { data: signed, error: signError } = await supabaseServer.storage
    .from(BOT_DELIVERY_BUCKET)
    .createSignedUrl(filePath, EMAIL_LINK_TTL_SECONDS, { download: fileName })

  if (signError || !signed?.signedUrl) {
    console.error('[auto-deliver] Could not sign delivery link:', { orderId, error: signError })
    return
  }

  await sendBotDeliveredEmail(
    notifyEmail,
    buyerName,
    orderId,
    botName,
    signed.signedUrl,
    'This secure link expires in 7 days. You can also download the file anytime from your account dashboard.'
  )

  // Permanent record: which email the bot was delivered to, plus the file
  // path so the in-dashboard download works immediately.
  const { error: updateError } = await (supabaseServer as any)
    .from('orders')
    .update({
      delivered_to_email: notifyEmail,
      delivery_file_path: filePath,
      delivery_file_name: fileName,
    })
    .eq('id', orderId)

  if (updateError) {
    // sql/11 or sql/05 columns may be missing on an old database - the email
    // already went out, so only log. The admin path can repair the record.
    console.error('[auto-deliver] Delivery record update failed (email sent):', updateError)
  } else {
    console.log('[auto-deliver] Auto-delivered', botName, 'to', notifyEmail, 'for order', orderId)
  }
}

/**
 * Download the slip from the private bucket so the server can OCR it.
 * Returns empty bytes + the guessed mime type when the download fails; the
 * verification step then fails closed (order rejected, buyer notified).
 */
async function downloadProofFile(
  path: string
): Promise<{ bytes: Buffer; mimeType: string | null }> {
  const mimeType = guessMimeType(path)
  try {
    const { data, error } = await supabaseServer.storage
      .from(PAYMENT_PROOF_BUCKET)
      .download(path)
    if (error || !data) {
      console.error('[payment-proof/finalize] Could not download slip for OCR:', error)
      return { bytes: Buffer.alloc(0), mimeType }
    }
    const arrayBuffer = await data.arrayBuffer()
    return { bytes: Buffer.from(arrayBuffer), mimeType }
  } catch (error) {
    console.error('[payment-proof/finalize] Slip download threw:', error)
    return { bytes: Buffer.alloc(0), mimeType }
  }
}

function guessMimeType(path: string): string | null {
  const ext = path.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'bmp':
      return 'image/bmp'
    case 'pdf':
      return 'application/pdf'
    default:
      return null
  }
}
