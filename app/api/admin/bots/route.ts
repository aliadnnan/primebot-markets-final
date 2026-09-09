import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Admin Bot Management — reads and writes the EXISTING `bots` table.
 * No new table, no duplicate bot system. The three seeded bots
 * (scalper / hedge / ai) are edited in place, never re-inserted.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const { data, error } = await (supabaseServer as any)
    .from('bots')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    // display_order is added by sql/05_future_proof_setup.sql. Fall back to
    // ordering by price so the panel still works before that SQL is run.
    const fallback = await (supabaseServer as any)
      .from('bots')
      .select('*')
      .order('price', { ascending: true })

    if (fallback.error) {
      console.error('[admin/bots] Could not read bots:', fallback.error)
      return NextResponse.json(
        { success: false, error: `Could not read bots: ${fallback.error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json({
      success: true,
      bots: fallback.data || [],
      warning:
        'Ordered by price because the display_order column does not exist yet. Run sql/05_future_proof_setup.sql to enable ordering and enable/disable controls.',
    })
  }

  return NextResponse.json({ success: true, bots: data || [] })
}

/** Creates a NEW bot. Existing bots are never touched by this. */
export async function POST(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const id = typeof body?.id === 'string' ? body.id.trim().toLowerCase() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const type = typeof body?.type === 'string' ? body.type.trim() : ''
  const price = Number(body?.price)

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Bot ID is required and may contain only lowercase letters, numbers and hyphens.' },
      { status: 400 }
    )
  }
  if (!name || !type) {
    return NextResponse.json(
      { success: false, error: 'Bot name and type are required.' },
      { status: 400 }
    )
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { success: false, error: 'Price must be a number greater than zero.' },
      { status: 400 }
    )
  }

  const features = Array.isArray(body?.features)
    ? body.features.map((f: any) => String(f)).filter(Boolean)
    : []

  const payload: Record<string, any> = {
    id,
    name,
    type,
    price,
    description: typeof body?.description === 'string' ? body.description.trim() : null,
    features,
  }
  if (body?.is_active !== undefined) payload.is_active = body.is_active === true
  if (body?.available_for_purchase !== undefined) {
    payload.available_for_purchase = body.available_for_purchase === true
  }
  if (body?.display_order !== undefined) payload.display_order = Number(body.display_order) || 0

  const { data, error } = await (supabaseServer as any).from('bots').insert([payload]).select().single()

  if (error) {
    console.error('[admin/bots] Create failed:', error)
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { success: false, error: `A bot with ID "${id}" already exists.` },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: `Could not create the bot: ${error.message}` },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, message: 'Bot created', bot: data })
}
