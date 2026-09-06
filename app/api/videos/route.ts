import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

<<<<<<< HEAD
<<<<<<< HEAD
=======
export const dynamic = 'force-dynamic'

>>>>>>> e4fd7c8e2a29c66297856b19d6ac185f4eca72f8
=======
export const dynamic = 'force-dynamic'

>>>>>>> e4fd7c8e2a29c66297856b19d6ac185f4eca72f8
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    const adminOnly = searchParams.get('admin') === 'true'

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
      .order('created_at', { ascending: false })

    // Filter for published videos if not admin
    if (!adminOnly) {
      query = query.eq('published', true)
    }

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      videos: data || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
