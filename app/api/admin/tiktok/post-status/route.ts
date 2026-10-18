import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/supabase/server'
import { getValidAccessToken, fetchPublishStatus } from '@/lib/tiktok'

/**
 * POST /api/admin/tiktok/post-status
 * Admin only. Body: { publish_id }. Polls TikTok for the upload/publish
 * state after the browser finished PUT-ing the video bytes.
 */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request)
  if (gate) return gate

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const publishId = String(body.publish_id || '').trim()
  if (!publishId) {
    return NextResponse.json(
      { success: false, error: 'publish_id is required.' },
      { status: 400 }
    )
  }

  try {
    const { access_token } = await getValidAccessToken()
    const status = await fetchPublishStatus(access_token, publishId)
    return NextResponse.json({ success: true, status })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Status check failed' },
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
