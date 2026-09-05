'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    // Check if user has a valid session (came from email link)
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setValidSession(!!session)
    }

    checkSession()
  }, [])

  const validateForm = () => {
    const newErrors: {
      password?: string
      confirmPassword?: string
    } = {}

    if (!password || password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await updatePassword(password)
      toast.success('Password reset successful!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Reset error:', error)
      toast.error(error?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!validSession) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
            <p className="text-slate-400 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/auth/forgot-password" className="btn-primary inline-block">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="container-custom max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400 mb-8">Enter your new password below</p>

          <form onSubmit={handleReset} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 rounded-lg bg-slate-700 border ${
                  errors.password ? 'border-red-500' : 'border-slate-600'
                } text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 rounded-lg bg-slate-700 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                } text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-slate-400 mt-6">
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
