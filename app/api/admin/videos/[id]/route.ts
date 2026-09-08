import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isMissingColumnError, withoutOptionalColumns, MIGRATION_HINT } from '@/lib/video-columns'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const authHeader = request.headers.get('Authorization')
    const videoId = params.id

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

    // Parse request body
    const body = await request.json()
    const { title, description, category_id, video_url, thumbnail_url, published, is_public, autoplay } = body

    // Build update object with only provided fields
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category_id !== undefined) updateData.category_id = category_id
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (published !== undefined) updateData.published = published
    if (is_public !== undefined) updateData.is_public = is_public === true
    if (autoplay !== undefined) updateData.autoplay = autoplay === true

    // video_url is only written when a non-empty replacement is supplied.
    // GET returns signed (temporary) URLs for uploaded files, so blindly
    // echoing that value back would overwrite the stored storage path with a
    // URL that expires in an hour.
    if (typeof video_url === 'string' && video_url.trim()) {
      updateData.video_url = video_url.trim()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    // Update video, retrying without the optional visibility columns if the
    // videos table has not been migrated yet.
    let migrationPending = false
    let { data: video, error: updateError } = await supabaseAdmin
      .from('videos')
      .update(updateData)
      .eq('id', videoId)
      .select()

    if (updateError && isMissingColumnError(updateError)) {
      const reduced = withoutOptionalColumns(updateData)
      if (Object.keys(reduced).length === 0) {
        return NextResponse.json({ success: false, error: MIGRATION_HINT }, { status: 400 })
      }
      migrationPending = true
      const retry = await supabaseAdmin
        .from('videos')
        .update(reduced)
        .eq('id', videoId)
        .select()
      video = retry.data
      updateError = retry.error
    }

    if (updateError) {
      console.error('Error updating video:', updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 400 })
    }

    if (!video || video.length === 0) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      warning: migrationPending ? MIGRATION_HINT : undefined,
      video: video[0],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const authHeader = request.headers.get('Authorization')
    const videoId = params.id

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

    // Get video first to get file paths
    const { data: video, error: fetchError } = await supabaseAdmin
      .from('videos')
      .select('video_url, thumbnail_url')
      .eq('id', videoId)
      .single()

    if (fetchError || !video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 })
    }

    // Delete video files from storage if they exist.
    // Only stored file PATHS belong to our buckets - external links (YouTube,
    // TikTok, Facebook, ...) must never be sent to storage.remove().
    const isStoragePath = (value: unknown): value is string =>
      typeof value === 'string' && value.trim().length > 0 && !/^https?:\/\//i.test(value)

    if (isStoragePath(video.video_url)) {
      await supabaseAdmin.storage.from('videos-content').remove([video.video_url])
    }
    if (isStoragePath(video.thumbnail_url)) {
      await supabaseAdmin.storage.from('video-thumbnails').remove([video.thumbnail_url])
    }

    // Delete video record
    const { error: deleteError } = await supabaseAdmin.from('videos').delete().eq('id', videoId)

    if (deleteError) {
      console.error('Error deleting video:', deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
