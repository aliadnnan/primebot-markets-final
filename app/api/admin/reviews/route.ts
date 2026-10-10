import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Admin: list reviews. ?status=pending (default) | approved | all
 * Newest first.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const status = new URL(request.url).searchParams.get('status') || 'pending'
  let query = (supabaseServer as any)
    .from('reviews')
    .select('id, bot_id, reviewer_name, rating, review_text, is_verified_purchase, is_approved, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status === 'pending') query = query.eq('is_approved', false)
  else if (status === 'approved') query = query.eq('is_approved', true)

  const { data, error } = await query
  if (error) {
    const missing = /relation "?(public\.)?reviews"? does not exist/i.test(error.message || '')
    return NextResponse.json(
      {
        success: false,
        error: missing
          ? 'The reviews table does not exist yet. Run sql/12_bot_reviews.sql in Supabase first.'
          : `Could not load reviews: ${error.message}`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, reviews: data || [] })
}
