import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Updates an existing bot in place. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const update: Record<string, any> = {}

  if (body?.name !== undefined) {
    const name = String(body.name).trim()
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name cannot be empty.' }, { status: 400 })
    }
    update.name = name
  }
  if (body?.type !== undefined) update.type = String(body.type).trim()
  if (body?.description !== undefined) {
    update.description = String(body.description).trim() || null
  }
  if (body?.price !== undefined) {
    const price = Number(body.price)
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a number greater than zero.' },
        { status: 400 }
      )
    }
    update.price = price
  }
  if (body?.features !== undefined) {
    update.features = Array.isArray(body.features)
      ? body.features.map((f: any) => String(f)).filter(Boolean)
      : []
  }
  if (body?.is_active !== undefined) update.is_active = body.is_active === true
  if (body?.available_for_purchase !== undefined) {
    update.available_for_purchase = body.available_for_purchase === true
  }
  if (body?.display_order !== undefined) update.display_order = Number(body.display_order) || 0

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
  }

  // Changing a bot's price NEVER rewrites history: orders store their own
  // bot_name and bot_price columns, copied at purchase time.
  const attempt = await (supabaseServer as any)
    .from('bots')
    .update(update)
    .eq('id', params.id)
    .select()

  let { data, error } = attempt

  // Retry without the columns added by sql/05 if that SQL has not been run.
  if (error && /is_active|available_for_purchase|display_order|updated_at/.test(error.message || '')) {
    const reduced = { ...update }
    delete reduced.is_active
    delete reduced.available_for_purchase
    delete reduced.display_order
    if (Object.keys(reduced).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Enable/disable and ordering need the new columns. Run sql/05_future_proof_setup.sql in Supabase first.',
        },
        { status: 400 }
      )
    }
    const retry = await (supabaseServer as any).from('bots').update(reduced).eq('id', params.id).select()
    data = retry.data
    error = retry.error
  }

  if (error) {
    console.error('[admin/bots] Update failed:', error)
    return NextResponse.json(
      { success: false, error: `Could not update the bot: ${error.message}` },
      { status: 400 }
    )
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'Bot not found.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'Bot updated', bot: data[0] })
}

/**
 * DELETE is refused when the bot has orders, because orders.bot_id references
 * bots(id) and deleting would break that history. Disable the bot instead.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const { data: orders, error: orderError } = await (supabaseServer as any)
    .from('orders')
    .select('id')
    .eq('bot_id', params.id)
    .limit(1)

  if (orderError) {
    return NextResponse.json(
      { success: false, error: `Could not check existing orders: ${orderError.message}` },
      { status: 400 }
    )
  }

  if (orders && orders.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          'This bot has existing orders, so deleting it would destroy order history. Disable it instead — disabled bots are hidden from the website and cannot be purchased.',
        hasOrders: true,
      },
      { status: 409 }
    )
  }

  const { error } = await (supabaseServer as any).from('bots').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json(
      { success: false, error: `Could not delete the bot: ${error.message}` },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, message: 'Bot deleted' })
}
