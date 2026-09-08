import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isMissingColumnError } from '@/lib/video-columns'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    // Public endpoint: never expose private, draft or restricted videos.
    // `published` controls draft vs live, `is_public` controls visitor access.
    const buildQuery = (includeVisibility: boolean) => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          video_categories (
            id,
            name,
            description
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (includeVisibility) {
        query = query.eq('is_public', true)
      }

      // Filter by category if provided
      if (category && category !== 'all') {
        query = query.eq('category_id', category)
      }

      return query
    }

    let { data, error } = await buildQuery(true)

    // The is_public column is added by sql/01_video_visibility_and_autoplay.sql.
    // Until that has been run, fall back to filtering on `published` only.
    if (error && isMissingColumnError(error)) {
      const fallback = await buildQuery(false)
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    const videos = await Promise.all((data || []).map(async (video: any) => {
      const { created_by: _createdBy, ...result } = video as any
      if (typeof result.video_url === 'string' && !/^https?:\/\//i.test(result.video_url)) {
        const { data: signed } = await supabase.storage
          .from('videos-content')
          .createSignedUrl(result.video_url, 3600)
        if (signed?.signedUrl) result.video_url = signed.signedUrl
      }
      if (typeof result.thumbnail_url === 'string' && !/^https?:\/\//i.test(result.thumbnail_url)) {
        const { data: signed } = await supabase.storage
          .from('video-thumbnails')
          .createSignedUrl(result.thumbnail_url, 3600)
        if (signed?.signedUrl) result.thumbnail_url = signed.signedUrl
      }
      return result
    }))

    return NextResponse.json({
      success: true,
      videos,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
