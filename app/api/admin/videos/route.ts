import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
    const { title, description, category_id, video_url, thumbnail_url, published } = body

    // Validate required fields
    if (!title || !category_id || !video_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, category_id, video_url' },
        { status: 400 }
      )
    }

    // Create video
    const { data: video, error: createError } = await supabaseAdmin.from('videos').insert([
      {
        title,
        description: description || null,
        category_id,
        video_url,
        thumbnail_url: thumbnail_url || null,
        published: published || false,
        created_by: userId,
      },
    ])
    .select()

    if (createError) {
      console.error('Error creating video:', createError)
      return NextResponse.json({ success: false, error: createError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
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
        const { data: signed } = await supabaseAdmin.storage.from('videos-content').createSignedUrl(result.video_url, 3600)
        if (signed?.signedUrl) result.video_url = signed.signedUrl
      }
      if (typeof result.thumbnail_url === 'string' && !/^https?:\/\//i.test(result.thumbnail_url)) {
        const { data: signed } = await supabaseAdmin.storage.from('video-thumbnails').createSignedUrl(result.thumbnail_url, 3600)
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
