import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Public list of video categories.
 *
 * Used by the public Video Tutorials page (category filters) and by the admin
 * Video Upload form (category dropdown).
 *
 * Previously this route required SUPABASE_SERVICE_ROLE_KEY and returned a 500
 * when it was absent, which made the Category dropdown silently render empty.
 * video_categories is readable by everyone under RLS ("Everyone can see video
 * categories"), so the anon key is a valid fallback.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const key = supabaseServiceKey || supabaseAnonKey

    if (!supabaseUrl || !key) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).',
          categories: [],
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, key)

    const { data, error } = await supabase
      .from('video_categories')
      .select('id, name, description, created_at, updated_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { success: false, error: error.message, categories: [] },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      categories: data || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred', categories: [] },
      { status: 500 }
    )
  }
}
