import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
  if (body?.account_number !== undefined) {
    const acct = String(body.account_number).trim()
    if (!acct) {
      return NextResponse.json(
        { success: false, error: 'Account number cannot be empty.' },
        { status: 400 }
      )
    }
    update.account_number = acct
  }
  if (body?.account_type !== undefined) update.account_type = String(body.account_type).trim()
  if (body?.description !== undefined) update.description = String(body.description).trim() || null
  if (body?.instructions !== undefined) update.instructions = String(body.instructions).trim() || null
  if (body?.is_active !== undefined) update.is_active = body.is_active === true
  if (body?.display_order !== undefined) update.display_order = Number(body.display_order) || 0

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
  }

  let { data, error } = await (supabaseServer as any)
    .from('payment_methods')
    .update(update)
    .eq('id', params.id)
    .select()

  if (error && /is_active|display_order|updated_at/.test(error.message || '')) {
    const reduced = { ...update }
    delete reduced.is_active
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
    const retry = await (supabaseServer as any)
      .from('payment_methods')
      .update(reduced)
      .eq('id', params.id)
      .select()
    data = retry.data
    error = retry.error
  }

  if (error) {
    return NextResponse.json(
      { success: false, error: `Could not update the payment method: ${error.message}` },
      { status: 400 }
    )
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'Payment method not found.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'Payment method updated', method: data[0] })
}

/**
 * Payment methods are referenced by NAME on orders (orders.payment_method is
 * text), so deleting one does not break order history. Disabling is still
 * preferred and is what the UI offers first.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const { error } = await (supabaseServer as any)
    .from('payment_methods')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json(
      { success: false, error: `Could not delete the payment method: ${error.message}` },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, message: 'Payment method deleted' })
}
