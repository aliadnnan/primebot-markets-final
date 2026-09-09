import { getAdminUserFromRequest, supabaseServer, getSignedPaymentProofUrl } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
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

    // Generate signed URLs for payment proofs.
    //
    // The stored value is a storage PATH, not a URL. The previous version fell
    // back to that raw path in `payment_proof_url` when signing failed, and the
    // Admin Panel put it straight into an href - producing a broken relative
    // link (e.g. /admin/<uuid>/<uuid>/proof.png) with nothing to explain why.
    // The path and the signed URL are now reported as separate fields so the UI
    // can tell the difference.
    const ordersWithSignedUrls = await Promise.all(
      (data || []).map(async (order: any) => {
        if (!order.payment_proof_url) return order

        const storedPath: string = order.payment_proof_url

        // Already a full URL (legacy rows stored public URLs) - pass through.
        if (/^https?:\/\//i.test(storedPath)) {
          return { ...order, payment_proof_path: storedPath, payment_proof_signed: true }
        }

        try {
          const signedUrl = await getSignedPaymentProofUrl(storedPath, 3600)
          if (signedUrl) {
            return {
              ...order,
              payment_proof_url: signedUrl,
              payment_proof_path: storedPath,
              payment_proof_signed: true,
            }
          }

          console.error('[admin/orders] Could not sign payment proof:', { path: storedPath })
          return {
            ...order,
            payment_proof_url: null,
            payment_proof_path: storedPath,
            payment_proof_signed: false,
            payment_proof_error:
              'The proof file could not be signed for viewing. It may be missing from the payment-proofs bucket.',
          }
        } catch (signError) {
          console.error('[admin/orders] Signing threw:', signError)
          return {
            ...order,
            payment_proof_url: null,
            payment_proof_path: storedPath,
            payment_proof_signed: false,
            payment_proof_error:
              signError instanceof Error ? signError.message : 'Could not sign the proof file.',
          }
        }
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
