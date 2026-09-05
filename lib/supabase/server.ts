import { createClient } from '@supabase/supabase-js'
import type { Database } from './client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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
  const { data, error } = await (supabaseServer as any).from('orders').insert([
    {
      user_id: userId,
      bot_id: botId,
      bot_name: botName,
      bot_price: botPrice,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      payment_proof_url: paymentProofUrl,
      status: 'pending_verification',
    },
  ])

  if (error) {
    console.error('Error creating order:', error)
    throw error
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

// Helper to upload payment proof
// Returns the file PATH (not URL) - payment-proofs bucket is PRIVATE
export async function uploadPaymentProof(
  userId: string,
  orderId: string,
  file: File
): Promise<string | null> {
  const fileName = `${userId}/${orderId}/${Date.now()}-${file.name}`

  const { data, error } = await supabaseServer.storage
    .from('payment-proofs')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading payment proof:', error)
    return null
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
      .from('payment-proofs')
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
