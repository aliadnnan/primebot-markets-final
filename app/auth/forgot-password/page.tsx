'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return false
    }
    return true
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail()) return

    setLoading(true)
    try {
      await resetPassword(email)
      setSubmitted(true)
      toast.success('Check your email for password reset instructions!')
    } catch (error: any) {
      console.error('Reset error:', error)
      toast.error(error?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email Sent!</h1>
            <p className="text-slate-400 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>. Check your email
              and follow the link to reset your password.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </p>
            <Link href="/auth/login" className="btn-primary inline-block">
              Back to Login
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
          <p className="text-slate-400 mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleReset} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-2 rounded-lg bg-slate-700 border ${
                  error ? 'border-red-500' : 'border-slate-600'
                } text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-slate-400 mt-6">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
