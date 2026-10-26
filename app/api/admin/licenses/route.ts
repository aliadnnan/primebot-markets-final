import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseServer, getAdminUserFromRequest } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const TABLE_MISSING_HINT =
  'The licenses table does not exist yet. Run sql/14_licenses.sql in Supabase first.'

function isTableMissing(error: any): boolean {
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    /relation "?(public\.)?licenses"? does not exist/i.test(error?.message || '') ||
    /licenses/.test(`${error?.message || ''}`) && /does not exist/i.test(`${error?.message || ''}`)
  )
}

/** PB-XXXXXX-XXXXXX-XXXXXX - unguessable, easy to dictate over WhatsApp. */
function generateLicenseKey(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(18)
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return `PB-${chars.slice(0, 6)}-${chars.slice(6, 12)}-${chars.slice(12, 18)}`
}

/**
 * Admin: list licenses, newest first. ?search= matches account, key,
 * bot name, buyer email or buyer name.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const search = (new URL(request.url).searchParams.get('search') || '').trim()

  let query = (supabaseServer as any)
    .from('licenses')
    .select('id, license_key, mt5_account, bot_name, buyer_email, buyer_name, status, expires_at, notes, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (search) {
    const term = search.replace(/[%_,]/g, ' ').trim()
    if (term) {
      query = query.or(
        `mt5_account.ilike.%${term}%,license_key.ilike.%${term}%,bot_name.ilike.%${term}%,buyer_email.ilike.%${term}%,buyer_name.ilike.%${term}%`
      )
    }
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: isTableMissing(error) ? TABLE_MISSING_HINT : `Could not load licenses: ${error.message}`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, licenses: data || [] })
}

/**
 * Admin: create a license. license_key is optional - one is generated when
 * omitted. expires_at null = lifetime.
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const mt5Account = typeof body?.mt5_account === 'string' ? body.mt5_account.trim() : ''
  const licenseKey =
    typeof body?.license_key === 'string' && body.license_key.trim()
      ? body.license_key.trim().toUpperCase()
      : generateLicenseKey()
  const botName = typeof body?.bot_name === 'string' ? body.bot_name.trim() || null : null
  const buyerEmail = typeof body?.buyer_email === 'string' ? body.buyer_email.trim() || null : null
  const buyerName = typeof body?.buyer_name === 'string' ? body.buyer_name.trim() || null : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  let expiresAt: string | null = null
  if (body?.expires_at) {
    const parsed = new Date(body.expires_at)
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Expiry date is not a valid date.' },
        { status: 400 }
      )
    }
    expiresAt = parsed.toISOString()
  }

  if (!mt5Account) {
    return NextResponse.json(
      { success: false, error: 'The MT5 account number is required.' },
      { status: 400 }
    )
  }
  if (!/^\d+$/.test(mt5Account)) {
    return NextResponse.json(
      { success: false, error: 'The MT5 account number must be digits only.' },
      { status: 400 }
    )
  }

  const { data, error } = await (supabaseServer as any)
    .from('licenses')
    .insert([
      {
        license_key: licenseKey,
        mt5_account: mt5Account,
        bot_name: botName,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        status: 'active',
        expires_at: expiresAt,
        notes,
      },
    ])
    .select()
    .single()

  if (error) {
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { success: false, error: 'That license key already exists. Generate a new one.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: isTableMissing(error) ? TABLE_MISSING_HINT : `Could not create the license: ${error.message}`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, message: 'License created.', license: data })
}
