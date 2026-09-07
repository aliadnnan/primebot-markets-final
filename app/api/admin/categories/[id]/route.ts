import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

// PUT - update a category's name and/or description.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: Record<string, any> = {}

    if (body?.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) {
        return NextResponse.json({ success: false, error: 'Category name cannot be empty' }, { status: 400 })
      }
      updateData.name = name
    }

    if (body?.description !== undefined) {
      updateData.description =
        typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await (supabaseServer as any)
      .from('video_categories')
      .update(updateData)
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('Error updating category:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A category with that name already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: data[0],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}

/**
 * DELETE - remove a category.
 *
 * videos.category_id is declared `REFERENCES video_categories(id) ON DELETE
 * CASCADE`, so deleting a category that still has videos would silently delete
 * those videos too. We therefore refuse the deletion and report how many videos
 * are attached, unless the caller explicitly passes ?force=true after being
 * warned in the UI.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const force = request.nextUrl.searchParams.get('force') === 'true'

    const { data: attachedVideos, error: countError } = await (supabaseServer as any)
      .from('videos')
      .select('id')
      .eq('category_id', params.id)

    if (countError) {
      console.error('Error checking attached videos:', countError)
      return NextResponse.json({ success: false, error: countError.message }, { status: 400 })
    }

    const videoCount = attachedVideos?.length || 0

    if (videoCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error: `This category still has ${videoCount} video${videoCount === 1 ? '' : 's'}. Move or delete them first, or confirm deletion of the videos as well.`,
          videoCount,
          requiresForce: true,
        },
        { status: 409 }
      )
    }

    const { error: deleteError } = await (supabaseServer as any)
      .from('video_categories')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message:
        videoCount > 0
          ? `Category and ${videoCount} attached video${videoCount === 1 ? '' : 's'} deleted`
          : 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
