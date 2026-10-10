import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Public reviews API.
 *
 * GET  /api/reviews?bot_id=<id>   -> approved reviews + summary for one bot.
 *                                   NEVER returns unapproved reviews.
 * POST /api/reviews               -> submit a review. New reviews default to
 *                                   is_approved=FALSE and stay hidden until an
 *                                   admin approves them.
 *
 * Spam guards (best-effort): required fields, length limits, rating 1-5, and
 * an in-memory per-IP rate limit (3 submissions/hour). This is not a
 * substitute for CAPTCHA, but it stops casual abuse.
 */

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const rateLimit = new Map<string, number[]>()

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimit.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) return true
  hits.push(now)
  rateLimit.set(ip, hits)
  return false
}

function tableMissing(error: any): boolean {
  return /relation "?(public\.)?reviews"? does not exist|Could not find the table/i.test(
    error?.message || ''
  )
}

export async function GET(request: NextRequest) {
  const botId = new URL(request.url).searchParams.get('bot_id')?.trim() || ''
  if (!botId) {
    return NextResponse.json({ success: false, error: 'bot_id is required.' }, { status: 400 })
  }
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ success: true, reviews: [], average: 0, count: 0 })
  }
  const { data, error } = await (supabaseServer as any)
    .from('reviews')
    .select('id, reviewer_name, rating, review_text, is_verified_purchase, created_at')
    .eq('bot_id', botId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    if (tableMissing(error)) {
      // sql/12 not run yet: no reviews to show, not an error for the page.
      return NextResponse.json({ success: true, reviews: [], average: 0, count: 0 })
    }
    return NextResponse.json(
      { success: false, error: `Could not load reviews: ${error.message}` },
      { status: 400 }
    )
  }
  const reviews = data || []
  const count = reviews.length
  const average = count
    ? reviews.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0) / count
    : 0
  return NextResponse.json({ success: true, reviews, average, count })
}

export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json(
      { success: false, error: 'Server is not configured to reach Supabase.' },
      { status: 500 }
    )
  }

  const ip = clientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many reviews submitted. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const botId = typeof body?.bot_id === 'string' ? body.bot_id.trim() : ''
  const reviewerName = typeof body?.reviewer_name === 'string' ? body.reviewer_name.trim() : ''
  const reviewText = typeof body?.review_text === 'string' ? body.review_text.trim() : ''
  const rating = Number(body?.rating)

  if (!botId) {
    return NextResponse.json({ success: false, error: 'Please choose a bot to review.' }, { status: 400 })
  }
  if (reviewerName.length < 2 || reviewerName.length > 50) {
    return NextResponse.json(
      { success: false, error: 'Your name must be between 2 and 50 characters.' },
      { status: 400 }
    )
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { success: false, error: 'Rating must be between 1 and 5 stars.' },
      { status: 400 }
    )
  }
  if (reviewText.length < 10 || reviewText.length > 1000) {
    return NextResponse.json(
      { success: false, error: 'Your review must be between 10 and 1000 characters.' },
      { status: 400 }
    )
  }

  // The bot must exist, otherwise the FK would reject it with a raw error.
  const { data: bot, error: botError } = await (supabaseServer as any)
    .from('bots')
    .select('id')
    .eq('id', botId)
    .maybeSingle()
  if (botError || !bot) {
    return NextResponse.json(
      { success: false, error: 'That bot does not exist.' },
      { status: 400 }
    )
  }

  const { error } = await (supabaseServer as any).from('reviews').insert([
    {
      bot_id: botId,
      reviewer_name: reviewerName,
      rating,
      review_text: reviewText,
      is_verified_purchase: false,
      is_approved: false,
    },
  ])

  if (error) {
    if (tableMissing(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reviews are not set up yet. Please try again later.',
        },
        { status: 400 }
      )
    }
    console.error('[reviews] Insert failed:', error)
    return NextResponse.json(
      { success: false, error: 'Could not save your review. Please try again.' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Thank you! Your review was submitted and will appear after approval.',
  })
}
