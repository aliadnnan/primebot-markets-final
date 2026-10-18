import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveConnection, isTikTokConfigured } from '@/lib/tiktok'

/**
 * GET /api/auth/tiktok/callback
 * Public (TikTok redirects the user's browser here; /api/auth/* bypasses the
 * site-wide login gate in middleware.ts). Validates the CSRF state cookie,
 * exchanges the code for tokens, stores the connection, then sends the owner
 * back to the TikTok admin page.
 */
export async function GET(request: NextRequest) {
  const adminPage = new URL('/admin/tiktok', request.url)
  const fail = (msg: string) => {
    adminPage.searchParams.set('error', msg)
    const res = NextResponse.redirect(adminPage)
    res.cookies.delete('tiktok_oauth_state')
    return res
  }

  if (!isTikTokConfigured()) {
    return fail('TikTok app keys are not configured on the server.')
  }

  const params = request.nextUrl.searchParams
  const oauthError = params.get('error')
  if (oauthError) {
    return fail(`TikTok declined the authorization (${params.get('error_description') || oauthError}).`)
  }

  const code = params.get('code')
  const state = params.get('state')
  const expectedState = request.cookies.get('tiktok_oauth_state')?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail('Authorization state mismatch. Please start the Connect flow again.')
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    await saveConnection(tokens)
  } catch (e: any) {
    return fail(e?.message || 'Token exchange failed.')
  }

  adminPage.searchParams.set('connected', '1')
  const res = NextResponse.redirect(adminPage)
  res.cookies.delete('tiktok_oauth_state')
  return res
}
