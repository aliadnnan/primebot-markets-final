import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { isUserAdmin } from './lib/supabase/server'

/**
 * SITE-WIDE LOGIN GATE (owner order 2026-10-10).
 *
 * PrimeBot Markets is an application, not a public website: every page and
 * every content-bearing API route requires a signed-in account. Unauthenticated
 * visitors land on /auth/login; signed-in non-admin users are kept out of
 * /admin/** (admin and client accounts are separate).
 *
 * This only works because the browser client (lib/supabase/client.ts) stores
 * the Supabase session in COOKIES via @supabase/auth-helpers-nextjs. A
 * localStorage-only session would be invisible here and would bounce every
 * signed-in user straight back to the login page.
 *
 * Fail-closed notes:
 * - /api/* without a session answers 401 JSON (no redirect loops for fetch()).
 * - /admin/** additionally verifies admin via isUserAdmin(), the same single
 *   definition the API routes use (admin_users table, users.is_admin fallback).
 * - If Supabase env vars are missing entirely we cannot verify anyone, so we
 *   let the request through rather than 500 every page; the app itself then
 *   reports the misconfiguration (same philosophy as lib/supabase/*).
 */

/** Paths an unauthenticated visitor may reach. Everything else is gated. */
function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/auth')) return true // login, signup, forgot/reset
  if (pathname.startsWith('/api/auth')) return true // sign-in support routes
  if (pathname === '/manifest.webmanifest') return true // PWA manifest
  if (pathname === '/robots.txt') return true
  if (pathname === '/sitemap.xml') return true
  if (pathname.startsWith('/icons/')) return true // PWA icons
  if (pathname.startsWith('/images/')) return true // static product art
  if (pathname.startsWith('/legal/')) return true // public Terms/Privacy pages (required for TikTok URL verification)
  if (pathname.startsWith('/blog')) return true // Trading Blog — public for readers, Google indexing and AdSense review (owner order 2026-10-20)
  if (pathname.startsWith('/sales-blog')) return true // PrimeBot Sales Blog — public, same reason
  if (pathname.startsWith('/tiktok') && pathname.endsWith('.txt')) return true // TikTok domain-verification files
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    // No backend configured - nothing can be verified. Do not break the site;
    // the existing in-app diagnostics surface the missing variables.
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.search = ''
    // Remember where they were headed so login can send them back there.
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Signed in. Admin area (pages AND /api/admin/* routes) is admins only.
  // The API routes re-verify with their own Bearer-token checks as well; this
  // gate stops non-admin sessions from reaching them at all.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const admin = await isUserAdmin(session.user.id)
    if (!admin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const homeUrl = req.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.search = ''
      return NextResponse.redirect(homeUrl)
    }
  }

  // Return `res` (not a fresh response) so refreshed session cookies persist.
  return res
}

export const config = {
  // Everything except Next.js internals and the favicon. Public-path
  // exclusions themselves are handled in isPublicPath() above.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
