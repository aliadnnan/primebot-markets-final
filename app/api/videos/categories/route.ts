import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('video_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      categories: data || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
