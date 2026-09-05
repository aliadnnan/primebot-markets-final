import { supabaseServer } from './supabase/server'

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()
  return user
}

export async function createUserProfile(userId: string, email: string, fullName: string) {
  const { error } = await (supabaseServer as any).from('users').insert([
    {
      id: userId,
      email,
      full_name: fullName,
    },
  ])

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is unique constraint violation, which means user already exists
    throw error
  }

  return true
}

export async function getUserProfile(userId: string) {
  const { data, error } = await (supabaseServer as any)
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // User profile doesn't exist yet
    return null
  }

  if (error) {
    throw error
  }

  return data
}

export async function updateUserProfile(userId: string, fullName: string) {
  const { error } = await (supabaseServer as any)
    .from('users')
    .update({ full_name: fullName })
    .eq('id', userId)

  if (error) {
    throw error
  }

  return true
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await (supabaseServer as any)
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error) {
    return false
  }

  return data?.is_admin ?? false
}

export async function makeUserAdmin(userId: string) {
  const { error } = await (supabaseServer as any)
    .from('users')
    .update({ is_admin: true })
    .eq('id', userId)

  if (error) {
    throw error
  }

  return true
}

export async function removeUserAdmin(userId: string) {
  const { error } = await (supabaseServer as any)
    .from('users')
    .update({ is_admin: false })
    .eq('id', userId)

  if (error) {
    throw error
  }

  return true
}
