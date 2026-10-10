import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Admin: moderate one review.
 * PUT { action: 'approve' } -> is_approved = true (goes public)
 * PUT { action: 'reject' }  -> deletes the review
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body?.action === 'reject' ? 'reject' : body?.action === 'approve' ? 'approve' : ''

  if (!action) {
    return NextResponse.json(
      { success: false, error: 'Action must be "approve" or "reject".' },
      { status: 400 }
    )
  }

  if (action === 'reject') {
    const { error } = await (supabaseServer as any).from('reviews').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { success: false, error: `Could not delete the review: ${error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true, message: 'Review rejected and removed.' })
  }

  const { data, error } = await (supabaseServer as any)
    .from('reviews')
    .update({ is_approved: true })
    .eq('id', params.id)
    .select()

  if (error) {
    return NextResponse.json(
      { success: false, error: `Could not approve the review: ${error.message}` },
      { status: 400 }
    )
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'Review approved and now public.', review: data[0] })
}
