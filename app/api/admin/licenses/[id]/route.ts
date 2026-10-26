import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Admin: manage one license.
 * PUT { action: 'activate' }                 -> status = 'active'
 * PUT { action: 'deactivate' }               -> status = 'disabled' (EA stops)
 * PUT { action: 'extend', days: 30 }         -> expires_at += days
 *                                               (from current expiry, or from
 *                                               now when already expired /
 *                                               lifetime - lifetime becomes
 *                                               now + days)
 * PUT { action: 'extend', expires_at: iso }  -> set an exact expiry
 * PUT { action: 'set_lifetime' }             -> expires_at = null
 * DELETE                                     -> removes the license row; the
 *                                               EA then answers not_found.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const action = typeof body?.action === 'string' ? body.action : ''

  const fail = (error: string, status = 400) =>
    NextResponse.json({ success: false, error }, { status })

  if (action === 'activate' || action === 'deactivate') {
    const { data, error } = await (supabaseServer as any)
      .from('licenses')
      .update({ status: action === 'activate' ? 'active' : 'disabled', updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()

    if (error) return fail(`Could not update the license: ${error.message}`)
    if (!data || data.length === 0) return fail('License not found.', 404)
    return NextResponse.json({
      success: true,
      message: action === 'activate' ? 'License activated.' : 'License disabled - the EA will stop on its next check.',
      license: data[0],
    })
  }

  if (action === 'set_lifetime') {
    const { data, error } = await (supabaseServer as any)
      .from('licenses')
      .update({ expires_at: null, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()

    if (error) return fail(`Could not update the license: ${error.message}`)
    if (!data || data.length === 0) return fail('License not found.', 404)
    return NextResponse.json({ success: true, message: 'License set to lifetime.', license: data[0] })
  }

  if (action === 'extend') {
    const { data: current, error: readError } = await (supabaseServer as any)
      .from('licenses')
      .select('expires_at')
      .eq('id', params.id)
      .maybeSingle()

    if (readError) return fail(`Could not read the license: ${readError.message}`)
    if (!current) return fail('License not found.', 404)

    let newExpiry: Date
    if (body?.expires_at) {
      const parsed = new Date(body.expires_at)
      if (Number.isNaN(parsed.getTime())) return fail('Expiry date is not a valid date.')
      newExpiry = parsed
    } else {
      const days = Number(body?.days)
      if (!Number.isFinite(days) || days <= 0) {
        return fail('Provide either a positive "days" count or an exact "expires_at" date.')
      }
      const base =
        current.expires_at && new Date(current.expires_at).getTime() > Date.now()
          ? new Date(current.expires_at)
          : new Date()
      newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
    }

    const { data, error } = await (supabaseServer as any)
      .from('licenses')
      .update({ expires_at: newExpiry.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()

    if (error) return fail(`Could not extend the license: ${error.message}`)
    if (!data || data.length === 0) return fail('License not found.', 404)
    return NextResponse.json({
      success: true,
      message: `Expiry extended to ${newExpiry.toISOString().slice(0, 10)}.`,
      license: data[0],
    })
  }

  return fail('Action must be "activate", "deactivate", "extend" or "set_lifetime".')
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const { data, error } = await (supabaseServer as any)
    .from('licenses')
    .delete()
    .eq('id', params.id)
    .select()

  if (error) {
    return NextResponse.json(
      { success: false, error: `Could not delete the license: ${error.message}` },
      { status: 400 }
    )
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'License not found.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'License deleted.' })
}
