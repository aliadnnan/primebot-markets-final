import { supabaseServer, getSignedPaymentProofUrl } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await (supabaseServer as any)
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all orders with user data
    const { data, error } = (await supabaseServer
      .from('orders')
      .select(`
        *,
        users:user_id(id, email, full_name)
      `)
      .order('created_at', { ascending: false })) as any

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Generate signed URLs for payment proofs
    const ordersWithSignedUrls = await Promise.all(
      (data || []).map(async (order: any) => {
        if (order.payment_proof_url) {
          // payment_proof_url is the file PATH, generate a signed URL for access
          const signedUrl = await getSignedPaymentProofUrl(order.payment_proof_url, 3600)
          return {
            ...order,
            payment_proof_url: signedUrl || order.payment_proof_url, // fallback to path if signing fails
          }
        }
        return order
      })
    )

    return NextResponse.json(
      {
        success: true,
        orders: ordersWithSignedUrls || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
