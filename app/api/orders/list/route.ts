import { supabaseServer } from '@/lib/supabase/server'
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

    // Get user's orders
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        orders: data || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in list orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
