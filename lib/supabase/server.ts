import { createClient } from '@supabase/supabase-js'
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

  const { data: authData, error: authError } = await supabaseServer.auth.getUser(token)
  if (authError || !authData.user) return null

  const { data: profile, error: profileError } = await (supabaseServer as any)
    .from('users')
    .select('id, is_admin')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile?.is_admin) return null
  return authData.user
}

// Helper to check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await (supabaseServer as any)
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data?.is_admin ?? false
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
export const PAYMENT_PROOF_BUCKET = 'payment-proofs'

/**
 * Private bucket holding the purchasable EA/bot files delivered to customers.
 * Must be created once in the Supabase Dashboard - see sql/05_future_proof_setup.sql.
 * Never served publicly: downloads go through /api/orders/[id]/download, which
 * verifies ownership and mints a short-lived signed URL.
 */
export const BOT_DELIVERY_BUCKET = 'bot-deliveries'

// Helper to upload payment proof
// Returns the file PATH (not URL) - payment-proofs bucket is PRIVATE
export async function uploadPaymentProof(
  userId: string,
  orderId: string,
  file: File
): Promise<string> {
  // The original name is sanitised: storage object keys reject some characters,
  // and an odd filename would otherwise fail the upload for a reason the user
  // could never work out.
  const safeName =
    file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(-80) || 'proof'

  const fileName = `${userId}/${orderId}/${Date.now()}-${safeName}`

  const { error } = await supabaseServer.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(fileName, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

  if (error) {
    // Previously this returned null, which discarded the real reason and left
    // the caller with a generic "Failed to upload payment proof". The actual
    // Supabase Storage message is now propagated.
    console.error('[orders] Error uploading payment proof:', {
      bucket: PAYMENT_PROOF_BUCKET,
      path: fileName,
      error,
    })

    const message = error.message || 'unknown error'
    const lower = message.toLowerCase()

    if (lower.includes('bucket not found') || lower.includes('related resource does not exist')) {
      throw new Error(
        `Payment proof upload failed: the storage bucket "${PAYMENT_PROOF_BUCKET}" does not exist in the connected Supabase project. Raw error: ${message}`
      )
    }
    if (lower.includes('exceeded') || lower.includes('too large')) {
      throw new Error(
        `Payment proof upload failed: the file is larger than the limit set on the "${PAYMENT_PROOF_BUCKET}" bucket. Raw error: ${message}`
      )
    }
    if (lower.includes('mime') || lower.includes('content type')) {
      throw new Error(
        `Payment proof upload failed: the "${PAYMENT_PROOF_BUCKET}" bucket does not allow this file type (${file.type || 'unknown'}). Raw error: ${message}`
      )
    }
    if (lower.includes('row-level security') || lower.includes('denied') || lower.includes('unauthorized')) {
      throw new Error(
        `Payment proof upload failed: storage policies on "${PAYMENT_PROOF_BUCKET}" denied the upload. Raw error: ${message}`
      )
    }

    throw new Error(`Payment proof upload failed: ${message}`)
  }

  // Return the file PATH (not URL)
  // The bucket is PRIVATE - signed URLs are generated on-demand in API routes
  return fileName
}

// Helper to get signed URL for payment proof (for secure, time-limited access)
// Used by admin endpoints to generate temporary access URLs
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
