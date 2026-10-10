import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getUserFromRequest, isSupabaseServerConfigured } from '@/lib/supabase/server'
import { sendOrderConfirmationEmail, sendAdminNotificationNewOrder } from '@/lib/email'
import { parseTypedAmount } from '@/lib/proof-verification'
import { isMissingColumnError } from '@/lib/video-columns'

export const dynamic = 'force-dynamic'

/**
 * Creates an order. Everything that affects money is decided HERE, on the
 * server, never taken from the browser.
 *
 * The browser sends only:
 *   botId, paymentMethodId, transactionId, fullName
 *
 * The server determines:
 *   - user_id      from the verified Bearer token (a customer cannot order for
 *                  someone else by sending another user's id)
 *   - bot_name     read from the bots table
 *   - bot_price    read from the bots table (editing the price in devtools and
 *                  buying a $600 bot for $1 is therefore impossible)
 *   - payment_method  validated against the enabled payment_methods rows
 *
 * bot_name and bot_price are COPIED onto the order, so an order keeps the
 * historical name and price it was placed at even if an admin changes the bot
 * later.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseServerConfigured) {
      return NextResponse.json(
        { success: false, error: 'Server is not configured to reach Supabase.' },
        { status: 500 }
      )
    }

    // ---- 1. Authenticated user (never from the body) --------------------
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to place an order.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const botId = typeof body?.botId === 'string' ? body.botId.trim() : ''
    const paymentMethodId =
      typeof body?.paymentMethodId === 'string' ? body.paymentMethodId.trim() : ''
    const transactionId =
      typeof body?.transactionId === 'string' ? body.transactionId.trim() : ''
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : ''
    // Amount the buyer says they sent. The bot's price is authoritative; this
    // is only cross-checked against the payment slip by the verification step.
    const amountPaid = parseTypedAmount(body?.amountPaid ?? null)
    // The buyer must share an email in the purchase flow: the bot is
    // delivered to THIS email and the record is kept permanently.
    const deliveryEmail =
      typeof body?.deliveryEmail === 'string' ? body.deliveryEmail.trim() : ''
    // Phone + WhatsApp (required): full contact record of who the buyer was.
    const buyerPhone =
      typeof body?.buyerPhone === 'string' ? body.buyerPhone.trim() : ''
    const buyerWhatsapp =
      typeof body?.buyerWhatsapp === 'string' ? body.buyerWhatsapp.trim() : ''

    if (!botId || !paymentMethodId || !transactionId) {
      return NextResponse.json(
        { success: false, error: 'Bot, payment method and transaction ID are all required.' },
        { status: 400 }
      )
    }
    if (amountPaid === null) {
      return NextResponse.json(
        { success: false, error: 'Please enter the amount you sent.' },
        { status: 400 }
      )
    }
    if (!deliveryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address for delivery.' },
        { status: 400 }
      )
    }
    if (buyerPhone.replace(/\D/g, '').length < 7) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number.' },
        { status: 400 }
      )
    }
    if (buyerWhatsapp.replace(/\D/g, '').length < 7) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid WhatsApp number.' },
        { status: 400 }
      )
    }
    if (transactionId.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid transaction ID.' },
        { status: 400 }
      )
    }

    // ---- 2. Authoritative bot record ------------------------------------
    const { data: bot, error: botError } = await (supabaseServer as any)
      .from('bots')
      .select('*')
      .eq('id', botId)
      .maybeSingle()

    if (botError) {
      console.error('[orders/create] Could not read bot:', botError)
      return NextResponse.json(
        { success: false, error: `Could not verify the selected bot: ${botError.message}` },
        { status: 400 }
      )
    }
    if (!bot) {
      return NextResponse.json(
        { success: false, error: 'The selected bot does not exist.' },
        { status: 400 }
      )
    }
    // These columns are added by sql/05_future_proof_setup.sql. Before it runs
    // they are undefined, which is treated as "available" so the existing
    // checkout keeps working unchanged.
    if (bot.is_active === false || bot.available_for_purchase === false) {
      return NextResponse.json(
        { success: false, error: `${bot.name} is not currently available for purchase.` },
        { status: 400 }
      )
    }

    const price = Number(bot.price)
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'The selected bot has no valid price configured.' },
        { status: 400 }
      )
    }

    // ---- 3. Validate the payment method ---------------------------------
    const { data: method, error: methodError } = await (supabaseServer as any)
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .maybeSingle()

    if (methodError) {
      console.error('[orders/create] Could not read payment method:', methodError)
    }
    if (!method) {
      return NextResponse.json(
        { success: false, error: 'The selected payment method does not exist.' },
        { status: 400 }
      )
    }
    if (method.is_active === false) {
      return NextResponse.json(
        { success: false, error: `${method.name} is not currently accepted.` },
        { status: 400 }
      )
    }

    // ---- 4. Transaction ID reuse check ----------------------------------
    // Compared case-insensitively and trimmed, so "ABC 123 " cannot be reused
    // as "abc123". A retry on an EXISTING order never reaches this route -
    // the checkout page reuses its order id and only re-attaches the proof.
    const { data: existing, error: existingError } = await (supabaseServer as any)
      .from('orders')
      .select('id, user_id, transaction_id, created_at')
      .ilike('transaction_id', transactionId)

    if (existingError) {
      console.error('[orders/create] Transaction ID check failed:', existingError)
    } else if (existing && existing.length > 0) {
      const match = existing.find(
        (row: any) =>
          String(row.transaction_id || '').trim().toLowerCase() === transactionId.toLowerCase()
      )
      if (match) {
        const mine = match.user_id === user.id
        return NextResponse.json(
          {
            success: false,
            error: mine
              ? `You have already submitted an order using transaction ID "${transactionId}". Open My Orders to see it, or enter a different transaction ID.`
              : `Transaction ID "${transactionId}" has already been submitted for another order. Please check the ID and enter the correct one.`,
            duplicateTransactionId: true,
            existingOrderId: mine ? match.id : undefined,
          },
          { status: 409 }
        )
      }
    }

    // ---- 5. Insert, returning the created row ---------------------------
    // payer_name / amount_paid come from sql/11_payment_proof_verification.sql.
    // Until it is run, they are left out so the checkout keeps working.
    const baseInsert = {
      user_id: user.id,
      bot_id: bot.id,
      bot_name: bot.name,
      bot_price: price,
      payment_method: method.name,
      transaction_id: transactionId,
      payment_proof_url: null,
      status: 'pending_verification',
    }

    let insertPayload: Record<string, any> = {
      ...baseInsert,
      payer_name: fullName || null,
      amount_paid: amountPaid,
      delivery_email: deliveryEmail,
      buyer_phone: buyerPhone || null,
      buyer_whatsapp: buyerWhatsapp || null,
    }

    let order: any = null
    let insertError: any = null
    const { data: firstTry, error: firstError } = await (supabaseServer as any)
      .from('orders')
      .insert([insertPayload])
      .select()
      .single()

    insertError = firstError
    order = firstTry

    if (insertError && isMissingColumnError(insertError)) {
      // sql/11 has not been run yet: retry without the new columns.
      insertPayload = baseInsert
      const { data: retry, error: retryError } = await (supabaseServer as any)
        .from('orders')
        .insert([insertPayload])
        .select()
        .single()
      insertError = retryError
      order = retry
    }

    if (insertError) {
      console.error('[orders/create] Insert failed:', insertError)
      const code = (insertError as any).code
      if (code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: `Transaction ID "${transactionId}" has already been used.`,
            duplicateTransactionId: true,
          },
          { status: 409 }
        )
      }
      if (code === '23503') {
        return NextResponse.json(
          {
            success: false,
            error: `Order could not be created: a referenced record is missing (foreign key). Raw error: ${insertError.message}`,
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: `Order could not be created: ${insertError.message}` },
        { status: 400 }
      )
    }

    if (!order?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'The order insert returned no row, so its ID could not be read.',
        },
        { status: 500 }
      )
    }

    // Email is best-effort: a mail failure must not lose a real order.
    // Goes to the buyer's delivery email (the email the bot is delivered to).
    const customerEmail = deliveryEmail || user.email || ''
    if (customerEmail) {
      try {
        await sendOrderConfirmationEmail(
          customerEmail,
          fullName || customerEmail,
          order.id,
          bot.name,
          price,
          method.name
        )
        await sendAdminNotificationNewOrder(
          order.id,
          fullName || customerEmail,
          customerEmail,
          bot.name,
          method.name,
          transactionId
        )
      } catch (emailError) {
        console.error('[orders/create] Email notification failed (order kept):', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      // Echoed so the checkout can display the price the SERVER charged.
      order: {
        id: order.id,
        bot_name: order.bot_name,
        bot_price: order.bot_price,
        payment_method: order.payment_method,
        status: order.status,
      },
    })
  } catch (error) {
    console.error('[orders/create] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while creating the order.' },
      { status: 500 }
    )
  }
}

/** True when a Postgres error was caused by sql/11 columns not existing yet. */
function isProofColumnMissing(error: any): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return true
  const message = `${error.message || ''} ${error.details || ''}`
  return /column .*(payer_name|amount_paid|verification_status|verification_detail).* does not exist/i.test(
    message
  )
}
