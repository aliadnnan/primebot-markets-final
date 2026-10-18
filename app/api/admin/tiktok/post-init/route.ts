import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/supabase/server'
import {
  getValidAccessToken,
  initVideoUpload,
  type TikTokPrivacyLevel,
} from '@/lib/tiktok'

const PRIVACY_LEVELS: TikTokPrivacyLevel[] = [
  'PUBLIC_TO_EVERYONE',
  'MUTUAL_FOLLOW_FRIENDS',
  'FOLLOWER_OF_CREATOR',
  'SELF_ONLY',
]

/**
 * POST /api/admin/tiktok/post-init
 * Admin only. Body: { title, video_size, privacy_level, mode: 'draft'|'direct' }.
 * Initializes a Content Posting API upload and returns TikTok's upload_url.
 * The browser then PUTs the video bytes straight to that URL (chunked), so
 * large videos never pass through our serverless functions.
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

  const title = String(body.title || '').trim()
  const videoSize = Number(body.video_size)
  const privacyLevel = String(body.privacy_level || 'PUBLIC_TO_EVERYONE') as TikTokPrivacyLevel
  const mode = body.mode === 'direct' ? 'direct' : 'draft'

  if (!title) {
    return NextResponse.json(
      { success: false, error: 'Caption (title) is required.' },
      { status: 400 }
    )
  }
  if (!Number.isFinite(videoSize) || videoSize <= 0) {
    return NextResponse.json(
      { success: false, error: 'video_size must be the file size in bytes.' },
      { status: 400 }
    )
  }
  if (!PRIVACY_LEVELS.includes(privacyLevel)) {
    return NextResponse.json(
      { success: false, error: `privacy_level must be one of: ${PRIVACY_LEVELS.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const { access_token } = await getValidAccessToken()
    const init = await initVideoUpload(access_token, {
      title,
      videoSize,
      privacyLevel,
      mode,
    })
    return NextResponse.json({ success: true, ...init, mode })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'TikTok upload init failed' },
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
