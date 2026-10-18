import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/supabase/server'
import { getStoredConnection, revokeToken, deleteConnection } from '@/lib/tiktok'

/**
 * POST /api/admin/tiktok/disconnect
 * Admin only. Revokes the TikTok tokens and deletes the stored connection.
 */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request)
  if (gate) return gate

  try {
    const conn = await getStoredConnection()
    if (conn) {
      await revokeToken(conn.access_token)
      await revokeToken(conn.refresh_token)
    }
    await deleteConnection()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Disconnect failed' },
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
