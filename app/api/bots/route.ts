import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOTS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

/**
 * Public list of bots, read from the `bots` table so prices can be managed
 * from the Admin Panel instead of edited in source.
 *
 * `lib/constants.ts` BOTS is retained as a FALLBACK only, so the public pages
 * keep rendering if the database is unreachable. It is never used to price an
 * order - /api/orders/create always reads the authoritative price from the
 * database.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    return NextResponse.json({ success: true, bots: BOTS, source: 'fallback-constants' })
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })

    let { data, error } = await (supabase as any)
      .from('bots')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Before sql/05 runs, is_active / display_order do not exist.
    if (error) {
      const fallback = await (supabase as any).from('bots').select('*').order('price')
      data = fallback.data
      error = fallback.error
    }

    if (error || !data || data.length === 0) {
      if (error) console.error('[bots] Could not read bots, using constants:', error)
      return NextResponse.json({ success: true, bots: BOTS, source: 'fallback-constants' })
    }

    return NextResponse.json({ success: true, bots: data, source: 'database' })
  } catch (error) {
    console.error('[bots] Unexpected error, using constants:', error)
    return NextResponse.json({ success: true, bots: BOTS, source: 'fallback-constants' })
  }
}
