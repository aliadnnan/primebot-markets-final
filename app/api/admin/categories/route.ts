import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

/**
 * Admin video category management.
 *
 * Authorization reuses the existing `getAdminUserFromRequest` helper in
 * lib/supabase/server.ts so there is a single server-side definition of
 * "is this caller an administrator".
 */

// GET - list every category with the number of videos attached to it.
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { data: categories, error } = await (supabaseServer as any)
      .from('video_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Attach video counts so the admin can see what a deletion would affect.
    const { data: videoRows, error: videoError } = await (supabaseServer as any)
      .from('videos')
      .select('category_id')

    if (videoError) {
      console.error('Error counting videos per category:', videoError)
    }

    const counts = new Map<string, number>()
    for (const row of videoRows || []) {
      if (!row?.category_id) continue
      counts.set(row.category_id, (counts.get(row.category_id) || 0) + 1)
    }

    const withCounts = (categories || []).map((category: any) => ({
      ...category,
      video_count: counts.get(category.id) || 0,
    }))

    return NextResponse.json({ success: true, categories: withCounts })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}

// POST - create a new category.
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const description =
      typeof body?.description === 'string' && body.description.trim() ? body.description.trim() : null

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const { data, error } = await (supabaseServer as any)
      .from('video_categories')
      .insert([{ name, description }])
      .select()

    if (error) {
      console.error('Error creating category:', error)
      // 23505 is the Postgres unique-violation code (name is UNIQUE).
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A category with that name already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: data?.[0] ? { ...data[0], video_count: 0 } : null,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
