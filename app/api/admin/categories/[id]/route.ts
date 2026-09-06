import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdminAccess(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const authHeader = request.headers.get('Authorization')

  if (!supabaseUrl || !supabaseServiceKey) {
    return { authorized: false, error: 'Server configuration error' }
  }

  if (!authHeader) {
    return { authorized: false, error: 'Unauthorized' }
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
    return { authorized: false, error: 'Unauthorized' }
  }

  const userId = userData.user.id

  // Check if user is admin
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profileError || !userProfile?.is_admin) {
    return { authorized: false, error: 'Admin access required' }
  }

  return { authorized: true, supabaseAdmin }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id
    const adminCheck = await checkAdminAccess(request)

    if (!adminCheck.authorized) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: 401 })
    }

    const supabaseAdmin = adminCheck.supabaseAdmin!

    // Parse request body
    const body = await request.json()
    const { name, description } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Update category
    const { data: category, error: updateError } = await supabaseAdmin
      .from('video_categories')
      .update({
        name: name.trim(),
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select()

    if (updateError) {
      console.error('Error updating category:', updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 400 })
    }

    if (!category || category.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: category[0],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id
    const adminCheck = await checkAdminAccess(request)

    if (!adminCheck.authorized) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: 401 })
    }

    const supabaseAdmin = adminCheck.supabaseAdmin!

    // Delete category
    const { error: deleteError } = await supabaseAdmin
      .from('video_categories')
      .delete()
      .eq('id', categoryId)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
