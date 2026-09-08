'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Keep the last successful admin result during token refreshes so a temporary
  // network/API failure does not unmount the admin dashboard and clear forms.
  const checkAdminStatus = async (userId: string, preserveOnFailure = false) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        if (!preserveOnFailure) setIsAdmin(false)
        return false
      }

      const response = await fetch('/api/auth/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (!preserveOnFailure) setIsAdmin(false)
        return false
      }

      const data = await response.json()
      const nextIsAdmin = data.isAdmin === true
      setIsAdmin(nextIsAdmin)
      try { sessionStorage.setItem(`primebot-admin-${userId}`, nextIsAdmin ? 'true' : 'false') } catch {}
      return nextIsAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      if (!preserveOnFailure) setIsAdmin(false)
      return false
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          // Keep a successful admin result for this browser tab. After an admin
          // has already been verified, do not re-run verification during normal
          // token refreshes or tab switches, because that can unmount the admin
          // UI and cancel an in-progress upload form.
          let hasCachedAdmin = false
          try {
            hasCachedAdmin = sessionStorage.getItem(`primebot-admin-${currentUser.id}`) === 'true'
          } catch {}

          if (hasCachedAdmin) {
            setIsAdmin(true)
          } else {
            await checkAdminStatus(currentUser.id, false)
          }
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user || null
      setUser(nextUser)

      if (!nextUser) {
        setIsAdmin(false)
        return
      }

      // Do not re-verify on TOKEN_REFRESHED or when the browser tab regains focus.
      // Server-side admin APIs still validate every protected request, so access
      // remains protected without resetting the client-side admin dashboard.
      if (event === 'SIGNED_OUT') {
        try { sessionStorage.removeItem(`primebot-admin-${nextUser?.id || ''}`) } catch {}
        setIsAdmin(false)
      } else if (event === 'SIGNED_IN') {
        void checkAdminStatus(nextUser.id, false)
      } else if (event === 'USER_UPDATED') {
        // Keep the existing verified state for the current tab. A fresh page load
        // or explicit sign-out/sign-in will perform a new verification.
      } else if (event === 'TOKEN_REFRESHED') {
        // Intentionally do nothing: refreshing a token must not reset an active upload.
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    if (data.user) {
      await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email, fullName }),
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setIsAdmin(false)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  const getAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut, resetPassword, updatePassword, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
