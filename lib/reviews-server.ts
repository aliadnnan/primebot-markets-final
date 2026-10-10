import { createClient } from '@supabase/supabase-js'

export interface ReviewRow {
  id: string
  bot_id: string
  reviewer_name: string
  rating: number
  review_text: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
}

export interface ReviewSummary {
  botId: string
  average: number
  count: number
}

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Average rating + count per bot, from APPROVED reviews only.
 * Returns an empty map when the reviews table does not exist yet (sql/12 not
 * run) or the database is unreachable - the public site then simply shows no
 * ratings instead of breaking.
 */
export async function getBotReviewSummaries(): Promise<Record<string, ReviewSummary>> {
  const supabase = serverClient()
  if (!supabase) return {}
  try {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .select('bot_id, rating')
      .eq('is_approved', true)
    if (error || !data) return {}
    const agg: Record<string, { total: number; count: number }> = {}
    for (const row of data as Array<{ bot_id: string; rating: number }>) {
      const entry = agg[row.bot_id] || { total: 0, count: 0 }
      entry.total += Number(row.rating) || 0
      entry.count += 1
      agg[row.bot_id] = entry
    }
    const out: Record<string, ReviewSummary> = {}
    for (const [botId, { total, count }] of Object.entries(agg)) {
      out[botId] = { botId, average: count ? total / count : 0, count }
    }
    return out
  } catch {
    return {}
  }
}

/**
 * Approved reviews for one bot, newest first. NEVER returns unapproved rows.
 */
export async function getApprovedReviews(botId: string, limit = 20): Promise<ReviewRow[]> {
  const supabase = serverClient()
  if (!supabase) return []
  try {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .select('id, bot_id, reviewer_name, rating, review_text, is_verified_purchase, is_approved, created_at')
      .eq('bot_id', botId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return data as ReviewRow[]
  } catch {
    return []
  }
}
