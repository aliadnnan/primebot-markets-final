import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/supabase/server'
import { runSupabaseDiagnostics } from '@/lib/supabase-diagnostics'

/**
 * Admin-only connection diagnostics.
 *
 * Reports which Supabase project the running deployment is actually connected
 * to, whether the URL / anon key / service role key all belong to that same
 * project, whether the configured video and thumbnail buckets exist in
 * it, and whether the required tables are reachable.
 *
 * No key material is ever returned - only the project ref (already public in
 * NEXT_PUBLIC_SUPABASE_URL) and each key's role claim.
 */
// Reads request headers for authorization, so it can never be static.
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const result = await runSupabaseDiagnostics()

    const failures = result.checks.filter((c) => c.status === 'fail')

    return NextResponse.json({
      success: true,
      projectRef: result.projectRef,
      buckets: result.buckets,
      checks: result.checks,
      summary: failures.length
        ? `${failures.length} problem${failures.length === 1 ? '' : 's'} found: ${failures
            .map((f) => f.name)
            .join('; ')}`
        : 'All checks passed.',
    })
  } catch (error) {
    console.error('Diagnostics failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Diagnostics failed unexpectedly',
      },
      { status: 500 }
    )
  }
}
