import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/supabase/server'
import { getStoredConnection, isTikTokConfigured } from '@/lib/tiktok'

/**
 * GET /api/admin/tiktok/status
 * Admin only. Reports whether a TikTok account is connected and when the
 * access token expires. Never returns the tokens themselves.
 */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request)
  if (gate) return gate

  if (!isTikTokConfigured()) {
    return NextResponse.json({
      success: true,
      connected: false,
      configured: false,
      error:
        'TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are not set in Vercel project settings.',
    })
  }

  try {
    const conn = await getStoredConnection()
    if (!conn) {
      return NextResponse.json({ success: true, connected: false, configured: true })
    }
    return NextResponse.json({
      success: true,
      connected: true,
      configured: true,
      open_id: conn.open_id,
      scope: conn.scope,
      expires_at: conn.expires_at,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Could not read connection' },
      { status: 500 }
    )
  }
}

async function requireAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    )
  }
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await supabaseUser.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await isUserAdmin(userData.user.id))) {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    )
  }
  return null
}
