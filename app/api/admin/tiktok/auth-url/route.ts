import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/supabase/server'
import { buildAuthorizeUrl, isTikTokConfigured } from '@/lib/tiktok'
import { randomUUID } from 'crypto'

/**
 * GET /api/admin/tiktok/auth-url
 * Admin only. Starts the TikTok Login Kit flow: creates a CSRF state token
 * (httpOnly cookie, verified by the callback), and returns the TikTok
 * authorization URL for the browser to visit.
 */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request)
  if (gate) return gate

  if (!isTikTokConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          'TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are not set. Add them in Vercel project settings (from the TikTok developer portal Credentials tab), redeploy, and try again.',
      },
      { status: 500 }
    )
  }

  const state = randomUUID()
  const url = buildAuthorizeUrl(state)

  const res = NextResponse.json({ success: true, url })
  res.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    path: '/',
  })
  return res
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
