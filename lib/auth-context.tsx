'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  /**
   * True once the admin check for the current session has finished.
   * Consumers MUST wait for this before deciding a user is "not an admin",
   * otherwise they act on the initial `isAdmin === false` default and
   * incorrectly reject real administrators.
   */
  adminChecked: boolean
  adminCheckFailed: boolean
  refreshAdminStatus: () => Promise<void>
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
  const [adminChecked, setAdminChecked] = useState(false)
  const [adminCheckFailed, setAdminCheckFailed] = useState(false)

  // Guards against out-of-order async resolution when several auth events
  // arrive close together (e.g. INITIAL_SESSION followed by SIGNED_IN).
  const resolutionRef = useRef(0)

  /**
   * The last user id whose admin status we actually resolved, plus the result.
   *
   * This is the fix for the Admin Panel re-running verification every time the
   * administrator came back to the tab. supabase-js attaches a
   * `visibilitychange` listener and, on every hidden -> visible transition,
   * runs `_recoverAndRefresh()`, which emits a fresh `SIGNED_IN` event even
   * though nothing about the session changed. It also emits `TOKEN_REFRESHED`
   * on each auto-refresh and mirrors both across browser tabs.
   *
   * Previously every one of those events ran the full blocking check and set
   * `adminChecked` back to false, which made /admin fall back to its
   * "Verifying admin access..." screen and UNMOUNT the whole panel - throwing
   * away the video upload form, its state and the selected File object.
   *
   * Now a repeat event for the SAME already-verified administrator is a no-op
   * as far as React state is concerned.
   */
  const verifiedRef = useRef<{ userId: string; isAdmin: boolean } | null>(null)
  const lastVerifiedAtRef = useRef(0)
  const pendingUserIdRef = useRef<string | null>(null)

  // How stale a verified result may get before we quietly re-check it in the
  // background. Revalidation never blocks the UI and never unmounts anything.
  const REVALIDATE_AFTER_MS = 10 * 60 * 1000

  // Ask the server whether the signed-in user is an administrator.
  // Returns the resolved flag so callers can sequence state updates safely.
  const fetchAdminStatus = async (): Promise<{ isAdmin: boolean; failed: boolean }> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return { isAdmin: false, failed: false }

      const response = await fetch('/api/auth/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      // 401 means "not a valid session" -> definitively not an admin.
      // 5xx means the check itself broke -> do NOT treat that as "not admin".
      if (response.status >= 500) {
        console.error('Admin check failed with server error:', response.status)
        return { isAdmin: false, failed: true }
      }

      const data = await response.json()
      return { isAdmin: data.isAdmin === true, failed: false }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return { isAdmin: false, failed: true }
    }
  }

  /**
   * Re-checks admin status WITHOUT touching `adminChecked` or `loading`, so no
   * consumer re-renders into a loading state and nothing unmounts.
   * A transient failure is ignored - we keep the answer we already trust.
   * Only a definitive change (genuine grant or revocation) updates state.
   */
  const revalidateAdminStatusSilently = async (userId: string) => {
    const result = await fetchAdminStatus()
    if (result.failed) return
    if (verifiedRef.current?.userId !== userId) return

    lastVerifiedAtRef.current = Date.now()
    if (verifiedRef.current.isAdmin !== result.isAdmin) {
      verifiedRef.current = { userId, isAdmin: result.isAdmin }
      setIsAdmin(result.isAdmin)
    }
  }

  // Applies a session to context state. `loading` and `adminChecked` stay
  // false/true in the correct order so that no consumer ever sees
  // "signed in, not loading, not admin" while the check is still in flight.
  const applySession = async (nextUser: User | null) => {
    // Signed out (or no session at all).
    if (!nextUser) {
      ++resolutionRef.current
      verifiedRef.current = null
      pendingUserIdRef.current = null
      setUser(null)
      setIsAdmin(false)
      setAdminCheckFailed(false)
      setAdminChecked(true)
      setLoading(false)
      return
    }

    // Repeat event for an administrator we have already verified: token
    // refresh, tab regaining focus, cross-tab broadcast. Deliberately does not
    // touch `user`, `adminChecked` or `isAdmin`, so the Admin Panel and the
    // upload form stay mounted exactly as they were.
    if (verifiedRef.current?.userId === nextUser.id) {
      setLoading(false)
      if (Date.now() - lastVerifiedAtRef.current > REVALIDATE_AFTER_MS) {
        void revalidateAdminStatusSilently(nextUser.id)
      }
      return
    }

    // A blocking check for this same user is already in flight.
    if (pendingUserIdRef.current === nextUser.id) return

    const token = ++resolutionRef.current
    pendingUserIdRef.current = nextUser.id

    setUser(nextUser)
    setAdminChecked(false)

    const result = await fetchAdminStatus()

    // A newer auth event superseded this one - discard the stale result.
    if (token !== resolutionRef.current) {
      if (pendingUserIdRef.current === nextUser.id) pendingUserIdRef.current = null
      return
    }

    pendingUserIdRef.current = null

    // Only remember a result we actually trust. A failed check is not cached,
    // so the retry button re-checks for real.
    if (!result.failed) {
      verifiedRef.current = { userId: nextUser.id, isAdmin: result.isAdmin }
      lastVerifiedAtRef.current = Date.now()
    }

    setIsAdmin(result.isAdmin)
    setAdminCheckFailed(result.failed)
    setAdminChecked(true)
    setLoading(false)
  }

  const refreshAdminStatus = async () => {
    const currentUser = user
    if (!currentUser) return
    setAdminChecked(false)
    const token = ++resolutionRef.current
    const result = await fetchAdminStatus()
    if (token !== resolutionRef.current) return
    if (!result.failed) {
      verifiedRef.current = { userId: currentUser.id, isAdmin: result.isAdmin }
      lastVerifiedAtRef.current = Date.now()
    }
    setIsAdmin(result.isAdmin)
    setAdminCheckFailed(result.failed)
    setAdminChecked(true)
  }

  useEffect(() => {
    let active = true

    // An earlier attempt at this fix cached the admin flag in sessionStorage as
    // `primebot-admin-<userId>`. That is a client-writable authorization cache:
    // any signed-in user could set it to 'true' in devtools and be shown the
    // Admin Panel UI. Server-side checks still blocked the data, but presenting
    // a fake admin panel is not acceptable. The verified result now lives only
    // in memory (verifiedRef), and any stale keys are removed here.
    try {
      if (typeof window !== 'undefined') {
        const stale = Object.keys(window.sessionStorage).filter((key) =>
          key.startsWith('primebot-admin-')
        )
        stale.forEach((key) => window.sessionStorage.removeItem(key))
      }
    } catch {
      // Ignore - private browsing modes can throw on storage access.
    }

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!active) return
        await applySession(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
        if (!active) return
        setAdminChecked(true)
        setLoading(false)
      }
    }

    getSession()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      // Deliberately not awaited: onAuthStateChange callbacks must return
      // quickly, and applySession sequences its own state updates.
      void applySession(session?.user || null)
    })

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email,
            fullName,
          }),
        })
      }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      verifiedRef.current = null
      pendingUserIdRef.current = null
      setUser(null)
      setIsAdmin(false)
      setAdminCheckFailed(false)
      setAdminChecked(true)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        adminChecked,
        adminCheckFailed,
        refreshAdminStatus,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
