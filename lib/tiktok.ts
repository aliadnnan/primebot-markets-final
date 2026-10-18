/**
 * TikTok Login Kit + Content Posting API helpers (owner order 2026-10-18).
 *
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started/
 *
 * Design notes (kept deliberately small):
 * - Client key/secret come ONLY from Vercel env vars (TIKTOK_CLIENT_KEY,
 *   TIKTOK_CLIENT_SECRET). They are never stored in the repo or the DB.
 * - OAuth tokens live in the `tiktok_connections` table (sql/13) and are
 *   touched only with the service-role key. Access tokens last 24h; the
 *   refresh token lasts 365 days and is used to mint new access tokens.
 * - Video bytes NEVER pass through our server (Vercel Hobby caps request
 *   bodies at ~4.5MB). We call /video/init/ to get TikTok's upload_url and
 *   the browser PUTs the file straight to TikTok chunk by chunk.
 */

import { createClient } from '@supabase/supabase-js'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://primebot-markets-final.vercel.app'
).replace(/\/$/, '')

/** Must match the Redirect URI registered in the TikTok developer portal. */
export const TIKTOK_REDIRECT_URI = `${SITE_URL}/api/auth/tiktok/callback`

/** Scopes the app requests. Matches the portal checklist given to the owner. */
export const TIKTOK_SCOPES = 'user.info.basic,video.upload,video.publish'

const AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const REVOKE_URL = 'https://open.tiktokapis.com/v2/oauth/revoke/'
const VIDEO_INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/video/init/'
const PUBLISH_STATUS_URL = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/'

export interface TikTokTokenSet {
  access_token: string
  refresh_token: string
  open_id: string
  scope: string
  expires_in: number // seconds (access token lifetime, normally 86400)
}

export interface TikTokConnection {
  id: string
  open_id: string
  access_token: string
  refresh_token: string
  scope: string
  expires_at: string
}

function clientKey(): string {
  return process.env.TIKTOK_CLIENT_KEY || ''
}

function clientSecret(): string {
  return process.env.TIKTOK_CLIENT_SECRET || ''
}

export function isTikTokConfigured(): boolean {
  return Boolean(clientKey() && clientSecret())
}

/** Build the TikTok authorization URL for the Login Kit flow. */
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: clientKey(),
    scope: TIKTOK_SCOPES,
    response_type: 'code',
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

async function postForm(url: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (data as any).error) {
    const msg =
      (data as any)?.error_description || (data as any)?.error || `HTTP ${res.status}`
    throw new Error(`TikTok OAuth failed: ${msg}`)
  }
  return data
}

/** Exchange the authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens(code: string): Promise<TikTokTokenSet> {
  const data = await postForm(TOKEN_URL, {
    client_key: clientKey(),
    client_secret: clientSecret(),
    code,
    grant_type: 'authorization_code',
    redirect_uri: TIKTOK_REDIRECT_URI,
  })
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    open_id: data.open_id,
    scope: data.scope || '',
    expires_in: Number(data.expires_in) || 86400,
  }
}

/** Mint a fresh access token from a refresh token. */
export async function refreshAccessToken(refreshToken: string): Promise<TikTokTokenSet> {
  const data = await postForm(TOKEN_URL, {
    client_key: clientKey(),
    client_secret: clientSecret(),
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    open_id: data.open_id,
    scope: data.scope || '',
    expires_in: Number(data.expires_in) || 86400,
  }
}

/** Revoke a token (used on disconnect). Best-effort; never throws. */
export async function revokeToken(token: string): Promise<void> {
  try {
    await postForm(REVOKE_URL, {
      client_key: clientKey(),
      client_secret: clientSecret(),
      token,
    })
  } catch {
    /* ignore - the row is deleted locally either way */
  }
}

// ---------------------------------------------------------------------------
// Token storage (service-role only; see sql/13_tiktok_connections.sql)
// ---------------------------------------------------------------------------

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) throw new Error('Supabase server configuration missing')
  return createClient(url, key)
}

/** Upsert the owner's connection after a successful OAuth callback. */
export async function saveConnection(tokens: TikTokTokenSet): Promise<void> {
  const supabase = serviceClient()
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  const { error } = await supabase.from('tiktok_connections').upsert(
    {
      open_id: tokens.open_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'open_id' }
  )
  if (error) throw new Error(`Could not save TikTok connection: ${error.message}`)
}

/** Newest stored connection (the owner's account), or null. */
export async function getStoredConnection(): Promise<TikTokConnection | null> {
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('tiktok_connections')
    .select('id, open_id, access_token, refresh_token, scope, expires_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`Could not read TikTok connection: ${error.message}`)
  return (data as TikTokConnection | null) || null
}

export async function deleteConnection(): Promise<void> {
  const supabase = serviceClient()
  const { error } = await supabase.from('tiktok_connections').delete().not('id', 'is', null)
  if (error) throw new Error(`Could not delete TikTok connection: ${error.message}`)
}

/**
 * A working access token for the owner's account. Refreshes automatically
 * when the stored token is expired or expires within 5 minutes.
 */
export async function getValidAccessToken(): Promise<{ access_token: string; open_id: string }> {
  const conn = await getStoredConnection()
  if (!conn) throw new Error('TikTok is not connected. Open /admin/tiktok and connect first.')
  const expiresInMs = new Date(conn.expires_at).getTime() - Date.now()
  if (expiresInMs > 5 * 60 * 1000) {
    return { access_token: conn.access_token, open_id: conn.open_id }
  }
  const fresh = await refreshAccessToken(conn.refresh_token)
  await saveConnection({ ...fresh, open_id: fresh.open_id || conn.open_id })
  return { access_token: fresh.access_token, open_id: fresh.open_id || conn.open_id }
}

// ---------------------------------------------------------------------------
// Content Posting API
// ---------------------------------------------------------------------------

export type TikTokPrivacyLevel =
  | 'PUBLIC_TO_EVERYONE'
  | 'MUTUAL_FOLLOW_FRIENDS'
  | 'FOLLOWER_OF_CREATOR'
  | 'SELF_ONLY'

export interface VideoInitResult {
  publish_id: string
  upload_url: string
  chunk_size: number
  total_chunk_count: number
}

async function tiktokPost(url: string, accessToken: string, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  const err = (data as any)?.error
  if (!res.ok || (err && err.code !== 'ok')) {
    throw new Error(
      `TikTok API error: ${err?.message || err?.code || `HTTP ${res.status}`}`
    )
  }
  return (data as any).data
}

/**
 * Initialize a video upload. Returns TikTok's upload_url; the CALLER (the
 * browser) PUTs the file bytes there in chunks, so big videos never touch
 * our serverless functions.
 *
 * mode 'draft'  -> video lands in the TikTok app's drafts (video.upload scope)
 * mode 'direct' -> publishes straight to the profile (needs video.publish
 *                  scope + Direct Post enabled + audit approval)
 */
export async function initVideoUpload(
  accessToken: string,
  opts: {
    title: string
    videoSize: number
    privacyLevel: TikTokPrivacyLevel
    mode: 'draft' | 'direct'
  }
): Promise<VideoInitResult> {
  if (!opts.title || opts.title.length > 2200) {
    throw new Error('Caption is required (max 2200 characters).')
  }
  if (!opts.videoSize || opts.videoSize <= 0) {
    throw new Error('videoSize must be a positive number of bytes.')
  }
  // 10MB chunks; single chunk for small files.
  const chunkSize = Math.min(opts.videoSize, 10 * 1024 * 1024)
  const totalChunks = Math.max(1, Math.ceil(opts.videoSize / chunkSize))

  const body: Record<string, unknown> = {
    post_info: {
      title: opts.title,
      privacy_level: opts.privacyLevel,
      disable_comment: false,
      disable_duet: false,
      disable_stitch: false,
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: opts.videoSize,
      chunk_size: chunkSize,
      total_chunk_count: totalChunks,
    },
  }
  if (opts.mode === 'direct') {
    body.post_mode = 'DIRECT_POST'
  }

  const data = await tiktokPost(VIDEO_INIT_URL, accessToken, body)
  return {
    publish_id: data.publish_id,
    upload_url: data.upload_url,
    chunk_size: chunkSize,
    total_chunk_count: totalChunks,
  }
}

/** Poll the publish status of an initialized upload. */
export async function fetchPublishStatus(
  accessToken: string,
  publishId: string
): Promise<any> {
  return tiktokPost(PUBLISH_STATUS_URL, accessToken, { publish_id: publishId })
}
