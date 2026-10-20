'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

// Inline stroke icons (gold/dark theme via currentColor) - no icon dependency.
function NavSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const navIcons: Record<string, ReactNode> = {
  home: (
    <NavSvg>
      <path d="M3 10.75 12 3l9 7.75" />
      <path d="M5.5 9.25V21h13V9.25" />
      <path d="M9.5 21v-6h5v6" />
    </NavSvg>
  ),
  bots: (
    <NavSvg>
      <rect x="4.5" y="9" width="15" height="10.5" rx="2.5" />
      <path d="M12 9V5" />
      <circle cx="12" cy="3.8" r="1.1" />
      <circle cx="9.3" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="14" r="1" fill="currentColor" stroke="none" />
      <path d="M9.8 17h4.4" />
    </NavSvg>
  ),
  videos: (
    <NavSvg>
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="M10.25 9.75v4.5L14.5 12z" fill="currentColor" stroke="none" />
    </NavSvg>
  ),
  performance: (
    <NavSvg>
      <path d="M3.5 3.5v17h17" />
      <path d="M8.5 16.5v-5" />
      <path d="M12.5 16.5v-9" />
      <path d="M16.5 16.5v-3.5" />
    </NavSvg>
  ),
  pricing: (
    <NavSvg>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.2" />
    </NavSvg>
  ),
  faq: (
    <NavSvg>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </NavSvg>
  ),
  support: (
    <NavSvg>
      <path d="M4 14.5v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.8" y="13.8" width="4" height="6.4" rx="1.8" />
      <rect x="17.2" y="13.8" width="4" height="6.4" rx="1.8" />
      <path d="M19.5 19.8A4.5 4.5 0 0 1 15 22.5h-2.5" />
    </NavSvg>
  ),
}

export default function Header() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home', icon: navIcons.home },
    { href: '/bots', label: 'Trading Bots', icon: navIcons.bots },
    { href: '/video-tutorials', label: 'Video Tutorials', icon: navIcons.videos },
    { href: '/performance', label: 'Performance', icon: navIcons.performance },
    { href: '/blog', label: 'Trading Blog', icon: navIcons.performance },
    { href: '/sales-blog', label: 'Sales Blog', icon: navIcons.pricing },
    { href: '/pricing', label: 'Pricing', icon: navIcons.pricing },
    { href: '/faq', label: 'FAQ', icon: navIcons.faq },
    { href: '/support', label: 'Support', icon: navIcons.support },
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
    <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-950 to-slate-900/80 backdrop-blur-md border-b border-amber-500/25">
      <nav className="container-custom flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 font-medium transition-colors duration-300 ${
                pathname === link.href
                  ? 'text-amber-400'
                  : 'text-slate-300 hover:text-amber-400'
              }`}
            >
              <span className="text-amber-500 [&>svg]:w-[18px] [&>svg]:h-[18px]">{link.icon}</span>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center">
                  <span className="text-slate-950 text-sm font-bold">
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
          <div className="container-custom py-4 space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-amber-500/10 text-amber-300'
                    : 'text-slate-200 hover:bg-slate-700/60 hover:text-amber-300'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-amber-400">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="!mt-4 border-t border-slate-700 pt-4 space-y-2">
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
