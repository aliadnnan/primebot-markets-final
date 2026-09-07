import { getAdminUserFromRequest, supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update order status to delivered
    const { error: updateError } = await (supabaseServer as any)
      .from('orders')
      .update({
        status: 'delivered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error marking delivered:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
