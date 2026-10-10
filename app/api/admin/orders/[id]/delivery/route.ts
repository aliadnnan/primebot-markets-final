import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseServer,
  getAdminUserFromRequest,
  BOT_DELIVERY_BUCKET,
} from '@/lib/supabase/server'
import { sendBotDeliveredEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const MAX_DELIVERY_SIZE = 100 * 1024 * 1024 // 100 MB
// Email delivery link lifetime: 7 days. The link is a bearer URL, so it is
// only ever sent to the buyer's own delivery email; the in-dashboard download
// uses a separate 5-minute signed URL via /api/orders/[id]/download.
const EMAIL_LINK_TTL_SECONDS = 7 * 24 * 60 * 60

/**
 * Admin: attach the EA/bot delivery file to an order.
 *
 * POST { filename, contentType, size }  -> signed upload URL (browser uploads
 *                                          direct to the private bucket)
 * PUT  { path, filename, markDelivered } -> records the path on the order and,
 *                                          optionally, marks it delivered
 *
 * The file lives in the private `bot-deliveries` bucket. Its PATH is stored on
 * the order; no public URL is ever generated. Customers download through
 * /api/orders/[id]/download, which re-checks ownership.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const filename = typeof body?.filename === 'string' ? body.filename : ''
  const size = typeof body?.size === 'number' ? body.size : 0

  if (size && size > MAX_DELIVERY_SIZE) {
    return NextResponse.json(
      { success: false, error: 'Delivery file must be 100MB or smaller.' },
      { status: 400 }
    )
  }

  const { data: order, error: orderError } = await (supabaseServer as any)
    .from('orders')
    .select('id, user_id, status')
    .eq('id', params.id)
    .maybeSingle()

  if (orderError) {
    return NextResponse.json(
      { success: false, error: `Could not read the order: ${orderError.message}` },
      { status: 400 }
    )
  }
  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
  }

  // Path is keyed by order id, so one order's file can never be confused with
  // another's, and it is not guessable from a customer-visible value alone.
  const safeName =
    filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(-80) || 'delivery'
  const path = `${order.id}/${Date.now()}-${safeName}`

  // Confirm the bucket exists before issuing a URL, so a missing bucket is
  // reported clearly rather than failing later as a confusing 404.
  const { data: buckets, error: bucketError } = await supabaseServer.storage.listBuckets()
  if (bucketError) {
    return NextResponse.json(
      { success: false, error: `Could not read storage buckets: ${bucketError.message}` },
      { status: 400 }
    )
  }
  const ids = (buckets || []).map((b: any) => b.id ?? b.name)
  if (!ids.includes(BOT_DELIVERY_BUCKET)) {
    return NextResponse.json(
      {
        success: false,
        error: `The private storage bucket "${BOT_DELIVERY_BUCKET}" does not exist yet. Create it in Supabase (Storage -> New bucket, Public OFF) as described at the end of sql/05_future_proof_setup.sql. Existing buckets: ${ids.join(', ')}`,
        missingBucket: BOT_DELIVERY_BUCKET,
      },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseServer.storage
    .from(BOT_DELIVERY_BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: `Signed upload URL could not be generated for "${BOT_DELIVERY_BUCKET}": ${
          error?.message || 'unknown error'
        }`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    bucket: BOT_DELIVERY_BUCKET,
  })
}

/** Records the uploaded delivery file against the order. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const path = typeof body?.path === 'string' ? body.path.trim() : ''
  const filename = typeof body?.filename === 'string' ? body.filename.trim() : ''
  const markDelivered = body?.markDelivered === true

  if (!path) {
    return NextResponse.json(
      { success: false, error: 'The uploaded file path is required.' },
      { status: 400 }
    )
  }
  if (!path.startsWith(`${params.id}/`)) {
    return NextResponse.json(
      { success: false, error: 'The file path does not belong to this order.' },
      { status: 400 }
    )
  }

  let order: any = null
  {
    const first = await (supabaseServer as any)
      .from('orders')
      .select('id, status, delivery_email, bot_name, payer_name')
      .eq('id', params.id)
      .maybeSingle()
    if (first.error && (first.error as any).code === '42703') {
      // sql/11 has not been run yet: delivery_email does not exist.
      const retry = await (supabaseServer as any)
        .from('orders')
        .select('id, status, bot_name, payer_name')
        .eq('id', params.id)
        .maybeSingle()
      if (retry.error || !retry.data) {
        return NextResponse.json(
          { success: false, error: retry.error?.message || 'Order not found.' },
          { status: retry.error ? 400 : 404 }
        )
      }
      order = { ...retry.data, delivery_email: null }
    } else {
      if (first.error || !first.data) {
        return NextResponse.json(
          { success: false, error: first.error?.message || 'Order not found.' },
          { status: first.error ? 400 : 404 }
        )
      }
      order = first.data
    }
  }
  const deliveryEmail = (order.delivery_email as string | null) || null

  // An order may only be marked delivered once payment has been verified.
  if (markDelivered && order.status !== 'verified' && order.status !== 'delivered') {
    return NextResponse.json(
      {
        success: false,
        error: `This order cannot be marked delivered while its status is "${order.status}". Approve the payment first.`,
      },
      { status: 409 }
    )
  }

  // Confirm the object really exists before recording it.
  const lastSlash = path.lastIndexOf('/')
  const { data: listed, error: listError } = await supabaseServer.storage
    .from(BOT_DELIVERY_BUCKET)
    .list(path.slice(0, lastSlash), { search: path.slice(lastSlash + 1), limit: 100 })

  if (listError) {
    return NextResponse.json(
      { success: false, error: `Could not confirm the uploaded file: ${listError.message}` },
      { status: 400 }
    )
  }
  if (!(listed || []).some((e: any) => e.name === path.slice(lastSlash + 1))) {
    return NextResponse.json(
      {
        success: false,
        error: 'The delivery file was not found in storage, so it was not attached to the order.',
      },
      { status: 400 }
    )
  }

  const update: Record<string, any> = {
    delivery_file_path: path,
    delivery_file_name: filename || path.slice(lastSlash + 1),
  }
  if (markDelivered) {
    update.status = 'delivered'
    update.delivered_at = new Date().toISOString()
    // Permanent delivery record: which email the bot was delivered to, so the
    // owner can later prove "we delivered this bot to this email".
    update.delivered_to_email = deliveryEmail
  }

  let updated: any = null
  {
    const first = await (supabaseServer as any)
      .from('orders')
      .update(update)
      .eq('id', params.id)
      .select()
    if (first.error && /delivered_to_email|delivery_email/.test(first.error.message || '')) {
      // sql/11 has not been run yet: retry without the new column.
      const { delivered_to_email: _dropped, ...legacyUpdate } = update
      const retry = await (supabaseServer as any)
        .from('orders')
        .update(legacyUpdate)
        .eq('id', params.id)
        .select()
      if (retry.error || !retry.data || retry.data.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: retry.error
              ? `The file uploaded (${path}) but the order was not updated: ${retry.error.message}`
              : `The file uploaded (${path}) but no order was updated.`,
          },
          { status: 400 }
        )
      }
      updated = retry.data[0]
    } else {
      if (first.error) {
        const missingColumn = /delivery_file_path|delivery_file_name|delivered_at/.test(
          first.error.message || ''
        )
        return NextResponse.json(
          {
            success: false,
            error: missingColumn
              ? `The delivery columns do not exist yet. Run sql/05_future_proof_setup.sql in Supabase. Raw error: ${first.error.message}`
              : `The file uploaded (${path}) but the order was not updated: ${first.error.message}`,
          },
          { status: 400 }
        )
      }
      if (!first.data || first.data.length === 0) {
        return NextResponse.json(
          { success: false, error: `The file uploaded (${path}) but no order was updated.` },
          { status: 400 }
        )
      }
      updated = first.data[0]
    }
  }

  // EMAIL DELIVERY (best-effort, never fails the delivery itself): when the
  // order is marked delivered, email the buyer at their delivery email with a
  // secure 7-day download link for the bot file.
  let emailSent = false
  if (markDelivered && deliveryEmail) {
    try {
      const { data: signed, error: signError } = await supabaseServer.storage
        .from(BOT_DELIVERY_BUCKET)
        .createSignedUrl(path, EMAIL_LINK_TTL_SECONDS, {
          download: filename || true,
        })
      if (!signError && signed?.signedUrl) {
        await sendBotDeliveredEmail(
          deliveryEmail,
          (order.payer_name as string) || 'Customer',
          params.id,
          (order.bot_name as string) || 'your bot',
          signed.signedUrl,
          'This secure link expires in 7 days. You can also download the file anytime from your account dashboard.'
        )
        emailSent = true
      } else {
        console.error('[admin/delivery] Could not sign email delivery link:', {
          orderId: params.id,
          error: signError,
        })
      }
    } catch (emailError) {
      console.error('[admin/delivery] Delivery email failed (best-effort):', emailError)
    }
  }

  return NextResponse.json({
    success: true,
    message: markDelivered ? 'Delivery file attached and order marked delivered' : 'Delivery file attached',
    emailSent: markDelivered ? emailSent : undefined,
    deliveredToEmail: markDelivered ? deliveryEmail : undefined,
    order: updated,
  })
}
