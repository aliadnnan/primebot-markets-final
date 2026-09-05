'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/bots', label: 'Trading Bots' },
    { href: '/performance', label: 'Performance' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/support', label: 'Support' },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      setUserMenuOpen(false)
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800/50 backdrop-blur-md border-b border-slate-700">
      <nav className="container-custom flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:inline">PrimeBot</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-blue-500 transition-colors duration-300 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side - Auth & CTA */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-slate-300 hidden lg:inline text-sm max-w-[150px] truncate">
                  {user.email}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition text-sm border-b border-slate-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition text-sm border-b border-slate-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/payment"
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition text-sm border-b border-slate-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Buy Bot
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition text-sm"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-slate-300 hover:text-blue-500 transition font-medium">
                Log In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="container-custom py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-slate-300 hover:text-blue-500 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-slate-700 pt-4 space-y-2">
              {loading ? (
                <div className="h-10 bg-slate-700 rounded animate-pulse" />
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/dashboard" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                  <Link href="/payment" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
                    Buy Bot
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link href="/auth/signup" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
