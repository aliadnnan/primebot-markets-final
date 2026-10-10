import { createClient } from '@supabase/supabase-js'
import { BOTS } from './constants'
import {
  normalisePaymentMethods,
  PAYMENT_METHOD_COLUMNS,
  PAYMENT_METHOD_COLUMNS_LEGACY,
} from './payment-methods'
import { VIDEO_BUCKET, THUMBNAIL_BUCKET } from './storage-buckets'
import type { Bot, PaymentMethod } from '@/types'

/**
 * Server-side reads of the admin-managed bots and payment methods.
 *
 * Used by server components (home, /bots, /pricing) so the public site shows
 * whatever the admin has configured instead of values baked into the source.
 *
 * `lib/constants.ts` is kept as a FALLBACK for database outages, so the site
 * never renders an empty product list. It is never used to price an order:
 * /api/orders/create always re-reads the authoritative price from the database.
 */
function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getActiveBots(): Promise<Bot[]> {
  const supabase = serverClient()
  if (!supabase) return BOTS

  try {
    let { data, error } = await (supabase as any)
      .from('bots')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // is_active / display_order are added by sql/05_future_proof_setup.sql.
    if (error) {
      const fallback = await (supabase as any).from('bots').select('*').order('price')
      data = fallback.data
      error = fallback.error
    }

    if (error || !data || data.length === 0) {
      if (error) console.error('[bots-server] Falling back to constants:', error.message)
      return BOTS
    }

    return data as Bot[]
  } catch (error) {
    console.error('[bots-server] Falling back to constants:', error)
    return BOTS
  }
}

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = serverClient()
  if (!supabase) return []

  try {
    let { data, error } = await (supabase as any)
      .from('payment_methods')
      .select(PAYMENT_METHOD_COLUMNS)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      const legacy = await (supabase as any)
        .from('payment_methods')
        .select(PAYMENT_METHOD_COLUMNS_LEGACY)
        .order('name')
      data = legacy.data
      error = legacy.error
    }

    if (error) {
      // Deliberately NOT falling back to hard-coded account numbers - a stale
      // number would send a customer's payment to the wrong account.
      console.error('[bots-server] Could not read payment methods:', error.message)
      return []
    }

    return normalisePaymentMethods(data)
  } catch (error) {
    console.error('[bots-server] Could not read payment methods:', error)
    return []
  }
}

export interface BotVideo {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  bot_id: string
}

/**
 * The video that plays on each bot's own card on the Bots page: the NEWEST
 * published, public video whose `bot_id` (sql/10_bot_videos.sql) is that bot.
 * A bot with no such video simply has no entry here, and its card renders
 * without a player.
 *
 * Uses the same visibility rules as the Video Tutorials page (published AND
 * is_public) and signs uploaded-file paths exactly like app/api/videos does.
 * Until sql/10 has been run, the bot_id column does not exist — the query
 * then errors and this returns an empty map, so the Bots page keeps working
 * unchanged. Signed URLs last one hour, matching the public videos endpoint;
 * this runs inside server components, so nothing is cached across requests.
 */
export async function getBotVideos(): Promise<Record<string, BotVideo>> {
  const supabase = serverClient()
  if (!supabase) return {}

  try {
    const buildQuery = (includeVisibility: boolean) => {
      let query = (supabase as any)
        .from('videos')
        .select('id, title, description, video_url, thumbnail_url, bot_id, created_at')
        .eq('published', true)
        .not('bot_id', 'is', null)
        .order('created_at', { ascending: false })

      if (includeVisibility) {
        query = query.eq('is_public', true)
      }

      return query
    }

    let { data, error } = await buildQuery(true)

    if (error) {
      const message = `${error.message || ''} ${error.details || ''}`
      const code = (error as any).code
      const missingColumn = code === '42703' || code === 'PGRST204'
      if (/bot_id/i.test(message)) {
        // sql/10 has not been run: no bot has a video slot yet. Handled by the
        // empty-map return below.
      } else if (missingColumn) {
        // is_public (sql/01) is the remaining optional column: retry on
        // `published` alone, exactly like the other reads in this codebase.
        const fallback = await buildQuery(false)
        data = fallback.data
        error = fallback.error
      }
    }

    if (error || !data) {
      // Most likely cause: bot_id does not exist yet (sql/10 not run). The
      // Bots page must still render, just without per-bot videos.
      if (error) console.error('[bots-server] Bot videos unavailable:', error.message)
      return {}
    }

    // Newest first (query order), so the first row seen per bot wins.
    const byBot: Record<string, BotVideo> = {}
    for (const video of data as any[]) {
      if (!video.bot_id || byBot[video.bot_id]) continue
      byBot[video.bot_id] = {
        id: video.id,
        title: video.title,
        description: video.description ?? null,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url ?? null,
        bot_id: video.bot_id,
      }
    }

    // Uploaded files are stored as bucket paths; sign them like the public
    // videos endpoint does. External links are already playable as-is.
    await Promise.all(
      Object.values(byBot).map(async (video) => {
        if (typeof video.video_url === 'string' && !/^https?:\/\//i.test(video.video_url)) {
          try {
            const { data: signed } = await supabase.storage
              .from(VIDEO_BUCKET)
              .createSignedUrl(video.video_url, 3600)
            if (signed?.signedUrl) video.video_url = signed.signedUrl
          } catch {
            // Keep the raw path; only this bot's player is affected.
          }
        }
        if (typeof video.thumbnail_url === 'string' && !/^https?:\/\//i.test(video.thumbnail_url)) {
          try {
            const { data: signed } = await supabase.storage
              .from(THUMBNAIL_BUCKET)
              .createSignedUrl(video.thumbnail_url, 3600)
            if (signed?.signedUrl) video.thumbnail_url = signed.signedUrl
          } catch {
            // Cosmetic only.
          }
        }
      })
    )

    return byBot
  } catch (error) {
    console.error('[bots-server] Bot videos failed:', error)
    return {}
  }
}
