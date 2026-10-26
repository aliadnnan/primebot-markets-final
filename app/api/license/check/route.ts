import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * PUBLIC license check for EAs (no login - MT5 WebRequest cannot sign in;
 * middleware.ts opens /api/license to anonymous traffic for this route).
 *
 *   GET /api/license/check?account=<mt5 account>&key=<license key>
 *
 * Replies are deliberately minimal and never expose buyer data:
 *   { "ok": true,  "active": true,  "expires_at": "<iso>" | null }
 *   { "ok": false, "reason": "not_found" | "disabled" | "expired" }
 *
 * A license counts as active only when the row exists for BOTH the account
 * and the key, its status is 'active', and it has not passed expires_at
 * (a null expires_at means lifetime).
 *
 * The response is never cached: the admin's on/off switch and expiry edits
 * must reach every running EA on its next check.
 */
export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' }

  if (!isSupabaseServerConfigured) {
    return NextResponse.json(
      { ok: false, reason: 'server_error' },
      { status: 503, headers }
    )
  }

  const params = new URL(request.url).searchParams
  const account = (params.get('account') || '').trim()
  const key = (params.get('key') || '').trim()

  if (!account || !key) {
    return NextResponse.json({ ok: false, reason: 'not_found' }, { headers })
  }

  const { data, error } = await (supabaseServer as any)
    .from('licenses')
    .select('status, expires_at')
    .eq('mt5_account', account)
    .eq('license_key', key)
    .maybeSingle()

  if (error) {
    // Table missing (sql/14 not run yet) is indistinguishable from
    // "no such license" for the EA - answer not_found, not a 500.
    const tableMissing =
      (error as any).code === '42P01' ||
      (error as any).code === 'PGRST205' ||
      /licenses/.test(`${error.message || ''}`)
    if (!tableMissing) {
      console.error('[license/check] lookup failed:', error)
    }
    return NextResponse.json({ ok: false, reason: 'not_found' }, { headers })
  }

  if (!data) {
    return NextResponse.json({ ok: false, reason: 'not_found' }, { headers })
  }

  if (data.status !== 'active') {
    return NextResponse.json({ ok: false, reason: 'disabled' }, { headers })
  }

  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, reason: 'expired' }, { headers })
  }

  return NextResponse.json(
    { ok: true, active: true, expires_at: data.expires_at ?? null },
    { headers }
  )
}
