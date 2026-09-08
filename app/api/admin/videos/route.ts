import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isMissingColumnError, withoutOptionalColumns, MIGRATION_HINT } from '@/lib/video-columns'
import { VIDEO_BUCKET, THUMBNAIL_BUCKET } from '@/lib/storage-buckets'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const authHeader = request.headers.get('Authorization')

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Create two Supabase clients - one with service role for checking admin, one with user token for creating
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get user ID from token
    const { data: userData, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userData.user.id

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { title, description, category_id, video_url, thumbnail_url, published, is_public, autoplay } = body

    // Validate required fields
    if (!title || !category_id || !video_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, category_id, video_url' },
        { status: 400 }
      )
    }

    const payload = {
      title,
      description: description || null,
      category_id,
      video_url,
      thumbnail_url: thumbnail_url || null,
      published: published || false,
      // Default to public so existing behaviour (published === visible) is preserved.
      is_public: is_public === undefined ? true : is_public === true,
      autoplay: autoplay === true,
      created_by: userId,
    }

    // Create video. Retry without the optional visibility columns if the
    // videos table has not been migrated yet.
    let migrationPending = false
    let { data: video, error: createError } = await supabaseAdmin
      .from('videos')
      .insert([payload])
      .select()

    if (createError && isMissingColumnError(createError)) {
      migrationPending = true
      const retry = await supabaseAdmin
        .from('videos')
        .insert([withoutOptionalColumns(payload)])
        .select()
      video = retry.data
      createError = retry.error
    }

    if (createError) {
      console.error('[videos] Database insert failed:', createError)

      // Name the exact database problem instead of passing through raw SQL text.
      const code = (createError as any).code
      let error = `Database insert failed: ${createError.message}`
      let stage = 'database-insert'

      if (code === '23503') {
        // foreign_key_violation - the referenced category row is gone.
        error =
          `Category reference failed: the selected category does not exist in public.video_categories ` +
          `(foreign key on videos.category_id). It may have been deleted in another tab. ` +
          `Open Video Categories, confirm the category exists, then reselect it. Raw error: ${createError.message}`
        stage = 'category-reference'
      } else if (code === '42P01') {
        // undefined_table
        error =
          `Database table missing: the videos table does not exist in the connected Supabase project. ` +
          `Run the video schema from DATABASE_SETUP.md in that project. Raw error: ${createError.message}`
        stage = 'table-missing'
      } else if (code === '23502') {
        // not_null_violation
        error = `A required field was empty: ${createError.message}`
        stage = 'missing-field'
      } else if (code === '42501') {
        error =
          `Database permission denied inserting into videos - check the RLS policies for this table. ` +
          `Raw error: ${createError.message}`
        stage = 'database-permission'
      }

      return NextResponse.json({ success: false, error, stage, code: code ?? null }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      warning: migrationPending ? MIGRATION_HINT : undefined,
      video: video?.[0],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const authHeader = request.headers.get('Authorization')

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get user ID from token
    const { data: userData, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userData.user.id

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get all videos with categories
    const { data: videos, error: fetchError } = await supabaseAdmin
      .from('videos')
      .select(`
        *,
        video_categories (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching videos:', fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 400 })
    }

    const videosWithUrls = await Promise.all((videos || []).map(async (video: any) => {
      const result = { ...video }
      if (typeof result.video_url === 'string' && !/^https?:\/\//i.test(result.video_url)) {
        const { data: signed } = await supabaseAdmin.storage.from(VIDEO_BUCKET).createSignedUrl(result.video_url, 3600)
        if (signed?.signedUrl) result.video_url = signed.signedUrl
      }
      if (typeof result.thumbnail_url === 'string' && !/^https?:\/\//i.test(result.thumbnail_url)) {
        const { data: signed } = await supabaseAdmin.storage.from(THUMBNAIL_BUCKET).createSignedUrl(result.thumbnail_url, 3600)
        if (signed?.signedUrl) result.thumbnail_url = signed.signedUrl
      }
      return result
    }))

    return NextResponse.json({
      success: true,
      videos: videosWithUrls,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
