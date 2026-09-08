import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization') || ''
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
    if (!token) return NextResponse.json({ isAdmin: false }, { status: 401 })

    const { data: authData, error: authError } = await supabaseServer.auth.getUser(token)
    if (authError || !authData.user) return NextResponse.json({ isAdmin: false }, { status: 401 })

    const { data, error } = await (supabaseServer as any)
      .from('users')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single()

    if (error) return NextResponse.json({ isAdmin: false }, { status: 200 })
    return NextResponse.json({ isAdmin: data?.is_admin === true }, { status: 200 })
  } catch (error) {
    console.error('Error in check-admin:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
