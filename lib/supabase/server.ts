import { createClient } from '@supabase/supabase-js'
import { PAYMENT_PROOF_BUCKET, BOT_DELIVERY_BUCKET } from '../storage-buckets'
import type { Database } from './client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Whether the server-side Supabase credentials are actually present.
 *
 * This module used to `throw` at import time when the variables were missing.
 * Because API route modules are evaluated during `next build`, that turned a
 * missing environment variable into a hard build failure on Vercel rather than
 * a clear runtime error. We now construct the client with placeholders and let
 * callers report the misconfiguration, so the build always succeeds and the
 * failure surfaces as an explicit "Supabase is not configured" response.
 */
export const isSupabaseServerConfigured = Boolean(supabaseUrl && supabaseServiceKey)

if (!isSupabaseServerConfigured) {
  console.error(
    '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Server-side Supabase calls will fail until these are set.'
  )
}

export const supabaseServer = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseServiceKey || 'missing-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)


/**
 * Resolves the authenticated user from the request's Bearer token.
 *
 * This exists because `supabaseServer` is the SERVICE ROLE client, created with
 * `persistSession: false` and no user context. Calling
 * `supabaseServer.auth.getUser()` with no argument therefore always returns
 * null - which is exactly why /api/orders/list returned 401 for everyone.
 *
 * The token must be verified against Supabase rather than decoded locally, so
 * a forged token cannot impersonate a user. `getUser(token)` does that
 * server-side check.
 *
 * Returns null when there is no valid session. Never trust a user id sent in a
 * request body - always use the value returned here.
 */
export async function getUserFromRequest(
  request: Request
): Promise<{ id: string; email: string | null } | null> {
  if (!isSupabaseServerConfigured) return null

  const authorization = request.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!token) return null

  try {
    const { data, error } = await supabaseServer.auth.getUser(token)
    if (error || !data?.user) return null
    return { id: data.user.id, email: data.user.email ?? null }
  } catch (error) {
    console.error('[auth] Could not resolve user from request:', error)
    return null
  }
}

export async function getAdminUserFromRequest(request: Request) {
  if (!isSupabaseServerConfigured) return null

  const authorization = request.headers.get('authorization') || request.headers.get('Authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!token) return null

  // The token is verified against Supabase - never decoded locally - so a
  // forged or edited token cannot impersonate anyone.
  const { data: authData, error: authError } = await supabaseServer.auth.getUser(token)
  if (authError || !authData.user) return null

  const authorized = await isUserAdmin(authData.user.id)
  if (!authorized) return null

  return authData.user
}

/**
 * THE single definition of "is this user an administrator".
 *
 * Authoritative source: the `admin_users` table, created by
 * sql/06_admin_authorization.sql. That table has RLS enabled and NO policies,
 * so neither the anon key nor any signed-in user's key can read or write it -
 * only the service role, which exists solely on the server. A customer
 * therefore cannot grant themselves admin by editing localStorage,
 * sessionStorage, a client-side variable, a URL, or frontend JavaScript, and
 * cannot do it by calling any API directly either.
 *
 * `users.is_admin` is used ONLY as a fallback for the window before
 * sql/06 has been run, detected by the table-missing error code. Once
 * `admin_users` exists it is used exclusively - a stale `is_admin = true` on a
 * users row grants nothing. This ordering is deliberate: it makes the new
 * source authoritative without the possibility of locking the real admin out
 * before the migration is applied.
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseServerConfigured || !userId) return false

  const { data, error } = await (supabaseServer as any)
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!error) {
    return Boolean(data?.user_id)
  }

  // 42P01 = undefined_table, PGRST205 = table not found in schema cache.
  const tableMissing =
    (error as any).code === '42P01' ||
    (error as any).code === 'PGRST205' ||
    /admin_users/.test(`${error.message || ''}`)

  if (!tableMissing) {
    // A real failure (network, permissions) must FAIL CLOSED, not grant access.
    console.error('[auth] admin_users lookup failed; denying admin access:', error)
    return false
  }

  console.warn(
    '[auth] admin_users table not found - falling back to users.is_admin. ' +
      'Run sql/06_admin_authorization.sql to enable the separate admin authorization table.'
  )

  const { data: profile, error: profileError } = await (supabaseServer as any)
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('[auth] Fallback admin check failed; denying access:', profileError)
    return false
  }

  return profile?.is_admin === true
}

/** True when the separate admin_users table is present and in use. */
export async function isAdminTablePresent(): Promise<boolean> {
  if (!isSupabaseServerConfigured) return false
  const { error } = await (supabaseServer as any)
    .from('admin_users')
    .select('user_id', { head: true, count: 'exact' })
  return !error
}

// Helper to get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await (supabaseServer as any)
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return data
}

// Helper to create order
export async function createOrder(
  userId: string,
  botId: string,
  botName: string,
  botPrice: number,
  paymentMethod: string,
  transactionId: string,
  paymentProofUrl?: string
) {
  // `.select().single()` is REQUIRED here.
  //
  // supabase-js v2 returns `data: null` for a bare `.insert()` - the row is
  // written, but nothing comes back. This function previously ended with
  // `return data`, so callers always received null and could never read the new
  // order's id. `createNewOrder` treated that as failure and threw
  // "Failed to create order" on every single order.
  //
  // `.single()` also guarantees one object (not an array), so the id is
  // available immediately, before the payment proof is attached.
  const { data, error } = await (supabaseServer as any)
    .from('orders')
    .insert([
      {
        user_id: userId,
        bot_id: botId,
        bot_name: botName,
        bot_price: botPrice,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        payment_proof_url: paymentProofUrl ?? null,
        status: 'pending_verification',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[orders] Error creating order:', error)
    const code = (error as any).code
    if (code === '23503') {
      throw new Error(
        `Order could not be created: a referenced record does not exist (foreign key). ` +
          `Check that the user and bot ids are valid. Raw error: ${error.message}`
      )
    }
    if (code === '42501') {
      throw new Error(
        `Order could not be created: permission denied by row level security on the orders table. ` +
          `Raw error: ${error.message}`
      )
    }
    throw new Error(`Order could not be created: ${error.message}`)
  }

  if (!data?.id) {
    // Should be unreachable: no error but no row returned.
    throw new Error(
      'The order insert reported no error but returned no row, so the order id could not be read.'
    )
  }

  return data
}

// Helper to update order status
export async function updateOrderStatus(
  orderId: string,
  status: 'pending_verification' | 'verified' | 'rejected' | 'delivered',
  rejectionReason?: string
) {
  const updateData: any = { status, updated_at: new Date().toISOString() }
  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await (supabaseServer as any)
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()

  if (error) {
    console.error('Error updating order status:', error)
    throw error
  }

  return data
}

// Helper to get all orders (for admin)
export async function getAllOrders() {
  const { data, error } = await (supabaseServer as any)
    .from('orders')
    .select(`
      *,
      users:user_id(id, email, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting orders:', error)
    return []
  }

  return data || []
}

// Helper to get user orders
export async function getUserOrders(userId: string) {
  const { data, error } = await (supabaseServer as any)
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting user orders:', error)
    return []
  }

  return data || []
}

/**
 * Payment proof storage bucket - the EXISTING private bucket, unchanged.
 * Declared once so the upload helper and the signed-URL helper can never drift
 * apart. Unrelated to the video buckets in lib/storage-buckets.ts.
 */
// Bucket IDs live in lib/storage-buckets.ts (single source of truth).
// Imported so they are in scope here, and re-exported so existing imports of
// these names from this module keep working.
export { PAYMENT_PROOF_BUCKET, BOT_DELIVERY_BUCKET }


// Helper to upload payment proof
// Returns the file PATH (not URL) - payment-proofs bucket is PRIVATE
/*
 * REMOVED: uploadPaymentProof(userId, orderId, file: File)
 *
 * This was the last remaining obsolete payment-proof upload path. It streamed
 * the File through the server, which (a) duplicated the signed-upload flow and
 * (b) was the shape that produced "Only plain objects, and a few built-ins, can
 * be passed to Server Actions" when it was reachable from a 'use server'
 * module.
 *
 * There is now exactly ONE payment-proof upload flow:
 *   lib/payment-proof-upload.ts  (browser)
 *     -> POST /api/orders/payment-proof/signed-url
 *     -> PUT direct to Supabase Storage
 *     -> POST /api/orders/payment-proof/finalize
 *
 * Admin viewing still uses getSignedPaymentProofUrl() below.
 */

export async function getSignedPaymentProofUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabaseServer.storage
      .from(PAYMENT_PROOF_BUCKET)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    if (!data?.signedUrl) {
      console.error('No signed URL returned from storage')
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('Error creating signed URL:', err)
    return null
  }
}
