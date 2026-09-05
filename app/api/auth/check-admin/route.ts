import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 400 })
    }

    const { data, error } = await (supabaseServer as any)
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    return NextResponse.json({ isAdmin: data?.is_admin ?? false }, { status: 200 })
  } catch (error) {
    console.error('Error in check-admin:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
