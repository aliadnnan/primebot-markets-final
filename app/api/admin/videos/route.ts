import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/supabase/server'
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

    // Admin authorization: ONE shared definition, in lib/supabase/server.ts,
    // backed by the locked-down admin_users table. Previously each of these
    // routes carried its own copy of this check against users.is_admin, so a
    // change in one place could silently leave the others behind.
    if (!(await isUserAdmin(userId))) {
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

    const saved = video?.[0]

    if (!saved) {
      // Should not happen: .select() returned nothing despite no error.
      return NextResponse.json(
        {
          success: false,
          error:
            'The insert reported no error but returned no row, so the video record cannot be confirmed. Check public.videos before retrying.',
          stage: 'insert-no-row',
        },
        { status: 500 }
      )
    }

    console.log('[admin/videos] Video row created.', {
      id: saved.id,
      published: saved.published,
      is_public: saved.is_public,
      category_id: saved.category_id,
    })

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      warning: migrationPending ? MIGRATION_HINT : undefined,
      // Echoed back so the UI can confirm what the DATABASE actually stored,
      // rather than what the form believed it sent.
      saved: {
        id: saved.id,
        published: saved.published === true,
        is_public: saved.is_public,
        autoplay: saved.autoplay,
        category_id: saved.category_id,
      },
      video: saved,
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

    // Admin authorization: ONE shared definition, in lib/supabase/server.ts,
    // backed by the locked-down admin_users table. Previously each of these
    // routes carried its own copy of this check against users.is_admin, so a
    // change in one place could silently leave the others behind.
    if (!(await isUserAdmin(userId))) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get ALL videos - no published/is_public filter. The Admin Panel must show
    // published, draft, public and private videos alike.
    //
    // The embedded `video_categories (...)` join depends on PostgREST resolving
    // the foreign key through its schema cache. If that resolution fails, the
    // WHOLE query errors and every video disappears from the Admin Panel - a
    // category relationship problem must never be able to hide all videos. So
    // the join is attempted first and, on any failure, the videos are fetched
    // without it and category names are attached from a second query.
    let videos: any[] | null = null
    let joinWarning: string | undefined

    const withJoin = await supabaseAdmin
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

    if (withJoin.error) {
      console.error(
        '[admin/videos] Category join query failed, falling back to a join-free query:',
        withJoin.error
      )

      const withoutJoin = await supabaseAdmin
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (withoutJoin.error) {
        console.error('[admin/videos] Join-free query also failed:', withoutJoin.error)
        return NextResponse.json(
          {
            success: false,
            error: `Could not read the videos table: ${withoutJoin.error.message} (code ${
              (withoutJoin.error as any).code ?? 'none'
            })`,
            stage: 'videos-select',
          },
          { status: 400 }
        )
      }

      // Attach category info separately so the UI still shows names.
      const { data: categories } = await supabaseAdmin
        .from('video_categories')
        .select('id, name, description')

      const byId = new Map((categories || []).map((c: any) => [c.id, c]))
      videos = (withoutJoin.data || []).map((video: any) => ({
        ...video,
        video_categories: byId.get(video.category_id) || null,
      }))

      joinWarning = `The category relationship query failed (${withJoin.error.message}). Videos are listed without it; category names were attached separately.`
    } else {
      videos = withJoin.data
    }

    // Signing is best-effort and isolated per video: a single missing storage
    // object must not throw and wipe out the entire listing.
    const videosWithUrls = await Promise.all(
      (videos || []).map(async (video: any) => {
        const result = { ...video }

        if (typeof result.video_url === 'string' && !/^https?:\/\//i.test(result.video_url)) {
          try {
            const { data: signed, error: signError } = await supabaseAdmin.storage
              .from(VIDEO_BUCKET)
              .createSignedUrl(result.video_url, 3600)
            if (signed?.signedUrl) result.video_url = signed.signedUrl
            else if (signError) {
              result.storage_warning = `Could not sign the video URL from bucket "${VIDEO_BUCKET}": ${signError.message}`
            }
          } catch (error) {
            result.storage_warning = `Could not sign the video URL: ${
              error instanceof Error ? error.message : String(error)
            }`
          }
        }

        if (typeof result.thumbnail_url === 'string' && !/^https?:\/\//i.test(result.thumbnail_url)) {
          try {
            const { data: signed } = await supabaseAdmin.storage
              .from(THUMBNAIL_BUCKET)
              .createSignedUrl(result.thumbnail_url, 3600)
            if (signed?.signedUrl) result.thumbnail_url = signed.signedUrl
          } catch {
            // A missing thumbnail is cosmetic - leave the raw path.
          }
        }

        return result
      })
    )

    return NextResponse.json({
      success: true,
      count: videosWithUrls.length,
      warning: joinWarning,
      videos: videosWithUrls,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
