import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create user profile in users table
    const { error } = await (supabaseServer as any).from('users').insert([
      {
        id: userId,
        email,
        full_name: fullName,
      },
    ])

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is unique violation, which means user already exists
      console.error('Error creating profile:', error)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error in create-profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
