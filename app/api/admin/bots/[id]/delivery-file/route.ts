import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseServer,
  getAdminUserFromRequest,
  BOT_DELIVERY_BUCKET,
} from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const MAX_DELIVERY_SIZE = 100 * 1024 * 1024 // 100 MB

/**
 * Admin: attach the EA delivery file ONCE per bot.
 *
 * POST { filename, contentType, size } -> signed upload URL (the browser
 *                                        uploads direct to the private bucket)
 * PUT  { path, filename }             -> records the path on the bot row
 *
 * The file lives in the private `bot-deliveries` bucket under
 * `bots/<botId>/<timestamp>-<safeName>`. When a buyer's payment is verified,
 * the server emails them a 7-day signed download link for THIS file
 * automatically - no per-order admin attach needed.
 */

/** Issue a signed upload URL for the bot's delivery file. */
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

  const { data: bot, error: botError } = await (supabaseServer as any)
    .from('bots')
    .select('id')
    .eq('id', params.id)
    .maybeSingle()

  if (botError || !bot) {
    return NextResponse.json(
      { success: false, error: botError?.message || 'Bot not found.' },
      { status: botError ? 400 : 404 }
    )
  }

  const safeName =
    filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(-80) || 'delivery'
  const path = `bots/${params.id}/${Date.now()}-${safeName}`

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
        error: `The private storage bucket "${BOT_DELIVERY_BUCKET}" does not exist yet. Create it in Supabase (Storage -> New bucket, Public OFF).`,
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

/** Record the uploaded file against the bot. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const path = typeof body?.path === 'string' ? body.path.trim() : ''
  const filename = typeof body?.filename === 'string' ? body.filename.trim() : ''

  if (!path) {
    return NextResponse.json(
      { success: false, error: 'The uploaded file path is required.' },
      { status: 400 }
    )
  }
  if (!path.startsWith(`bots/${params.id}/`)) {
    return NextResponse.json(
      { success: false, error: 'The file path does not belong to this bot.' },
      { status: 400 }
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
        error: 'The delivery file was not found in storage, so it was not attached to the bot.',
      },
      { status: 400 }
    )
  }

  const { data, error } = await (supabaseServer as any)
    .from('bots')
    .update({
      delivery_file_path: path,
      delivery_file_name: filename || path.slice(lastSlash + 1),
    })
    .eq('id', params.id)
    .select()

  if (error) {
    const missingColumn = /delivery_file_path|delivery_file_name/.test(error.message || '')
    return NextResponse.json(
      {
        success: false,
        error: missingColumn
          ? 'The delivery-file columns do not exist yet. Run sql/12_bot_reviews.sql in Supabase first.'
          : `Could not save the delivery file: ${error.message}`,
      },
      { status: 400 }
    )
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'Bot not found.' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: 'Delivery file attached to the bot. Verified buyers will now receive it by email automatically.',
    bot: data[0],
  })
}
