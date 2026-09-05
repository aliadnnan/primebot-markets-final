'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import { trackCustomerLogin } from '@/lib/analytics'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await signIn(email, password)
      // Track login with email as identifier (user.id will be set in auth context)
      // Using email as a temporary ID since signIn doesn't return the user object
      trackCustomerLogin(email, email)
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error?.message || 'Failed to log in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="container-custom max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 mb-8">Sign in to your PrimeBot account</p>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  errors.email ? 'border-red-500' : 'border-slate-600'
                } text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
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
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
