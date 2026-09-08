import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isMissingColumnError } from '@/lib/video-columns'
import { VIDEO_BUCKET, THUMBNAIL_BUCKET } from '@/lib/storage-buckets'

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
    // `includeJoin` controls the embedded category relationship. If PostgREST
    // cannot resolve that relationship the whole query errors, which would
    // empty the public page even though matching videos exist - so it is
    // retried without the join and category names are attached separately.
    const buildQuery = (includeVisibility: boolean, includeJoin: boolean) => {
      let query = supabase
        .from('videos')
        .select(
          includeJoin
            ? `
          *,
          video_categories (
            id,
            name,
            description
          )
        `
            : '*'
        )
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

    let { data, error } = await buildQuery(true, true)

    // The is_public column is added by sql/01_video_visibility_and_autoplay.sql.
    // Until that has been run, fall back to filtering on `published` only.
    if (error && isMissingColumnError(error)) {
      console.warn('[videos] is_public column not present; filtering on published only.')
      const fallback = await buildQuery(false, true)
      data = fallback.data
      error = fallback.error
    }

    // Still failing: the category join is the remaining suspect. Drop it.
    let needsCategoryBackfill = false
    if (error) {
      console.error('[videos] Query with category join failed, retrying without it:', error)
      let retry = await buildQuery(true, false)
      if (retry.error && isMissingColumnError(retry.error)) {
        retry = await buildQuery(false, false)
      }
      if (!retry.error) {
        data = retry.data
        error = null
        needsCategoryBackfill = true
      } else {
        error = retry.error
      }
    }

    if (error) {
      console.error('[videos] Could not read videos:', error)
      return NextResponse.json(
        {
          success: false,
          error: `Could not read the videos table: ${error.message} (code ${
            (error as any).code ?? 'none'
          })`,
        },
        { status: 400 }
      )
    }

    // Attach category info if the join had to be dropped.
    if (needsCategoryBackfill && data && data.length) {
      const { data: categories } = await supabase
        .from('video_categories')
        .select('id, name, description')
      const byId = new Map((categories || []).map((c: any) => [c.id, c]))
      data = (data as any[]).map((video: any) => ({
        ...video,
        video_categories: byId.get(video.category_id) || null,
      })) as any
    }

    const videos = await Promise.all(
      ((data as any[]) || []).map(async (video: any) => {
        const { created_by: _createdBy, ...result } = video as any

        // Isolated per video: one missing storage object must not throw and
        // blank the whole page.
        if (typeof result.video_url === 'string' && !/^https?:\/\//i.test(result.video_url)) {
          try {
            const { data: signed, error: signError } = await supabase.storage
              .from(VIDEO_BUCKET)
              .createSignedUrl(result.video_url, 3600)
            if (signed?.signedUrl) result.video_url = signed.signedUrl
            else if (signError) {
              console.error('[videos] Could not sign video URL:', {
                bucket: VIDEO_BUCKET,
                path: result.video_url,
                error: signError.message,
              })
            }
          } catch (error) {
            console.error('[videos] Signing threw:', error)
          }
        }

        if (typeof result.thumbnail_url === 'string' && !/^https?:\/\//i.test(result.thumbnail_url)) {
          try {
            const { data: signed } = await supabase.storage
              .from(THUMBNAIL_BUCKET)
              .createSignedUrl(result.thumbnail_url, 3600)
            if (signed?.signedUrl) result.thumbnail_url = signed.signedUrl
          } catch {
            // Cosmetic only.
          }
        }

        return result
      })
    )

    return NextResponse.json({
      success: true,
      count: videos.length,
      videos,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
