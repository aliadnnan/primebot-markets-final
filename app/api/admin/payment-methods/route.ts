import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'
import { PAYMENT_METHOD_COLUMNS, PAYMENT_METHOD_COLUMNS_LEGACY } from '@/lib/payment-methods'

export const dynamic = 'force-dynamic'

/**
 * Admin Payment Method Management — reads and writes the EXISTING
 * `payment_methods` table. The four seeded methods (jazzcash, easypaisa,
 * binance, bybit) are edited in place, never duplicated.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  let { data, error } = await (supabaseServer as any)
    .from('payment_methods')
    .select(PAYMENT_METHOD_COLUMNS)
    .order('display_order', { ascending: true })

  if (error) {
    const fallback = await (supabaseServer as any)
      .from('payment_methods')
      .select(PAYMENT_METHOD_COLUMNS_LEGACY)
      .order('name')
    if (fallback.error) {
      return NextResponse.json(
        { success: false, error: `Could not read payment methods: ${fallback.error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json({
      success: true,
      methods: fallback.data || [],
      warning:
        'Ordered by name because display_order does not exist yet. Run sql/05_future_proof_setup.sql to enable ordering and enable/disable controls.',
    })
  }

  return NextResponse.json({ success: true, methods: data || [] })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const id = typeof body?.id === 'string' ? body.id.trim().toLowerCase() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const accountNumber = typeof body?.account_number === 'string' ? body.account_number.trim() : ''
  const accountType = typeof body?.account_type === 'string' ? body.account_type.trim() : ''

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json(
      { success: false, error: 'ID is required and may contain only lowercase letters, numbers and hyphens.' },
      { status: 400 }
    )
  }
  if (!name || !accountNumber || !accountType) {
    return NextResponse.json(
      { success: false, error: 'Name, account number and account type are required.' },
      { status: 400 }
    )
  }

  const payload: Record<string, any> = {
    id,
    name,
    account_number: accountNumber,
    account_type: accountType,
    description: typeof body?.description === 'string' ? body.description.trim() : null,
    instructions: typeof body?.instructions === 'string' ? body.instructions.trim() : null,
  }
  if (body?.account_holder_name !== undefined) {
    payload.account_holder_name = String(body.account_holder_name).trim() || null
  }
  if (body?.qr_code_url !== undefined) {
    payload.qr_code_url = String(body.qr_code_url).trim() || null
  }
  if (body?.is_active !== undefined) payload.is_active = body.is_active === true
  if (body?.display_order !== undefined) payload.display_order = Number(body.display_order) || 0

  const { data, error } = await (supabaseServer as any)
    .from('payment_methods')
    .insert([payload])
    .select()
    .single()

  if (error) {
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { success: false, error: `A payment method with ID "${id}" already exists.` },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: `Could not create the payment method: ${error.message}` },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, message: 'Payment method created', method: data })
}
