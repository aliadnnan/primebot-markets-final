import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { AuthProvider } from '@/lib/auth-context'
import { GoogleAnalytics } from '@/lib/ga-init'

export const metadata: Metadata = {
  title: 'PrimeBot Markets - Smart Trading. Powered by Automation.',
  description: 'Automated Trading Expert Advisors with Lifetime Licenses. Trade smarter with PRIME SCALPER EA, PRIME HEDGE EA, and PRIME AI ALGORITHM EA.',
  keywords: 'trading bot, expert advisor, EA, forex trading, automated trading',
  // PWA: Next auto-links app/manifest.ts; icons declared here for browsers
  // and iOS (apple-touch-icon) that read them from the document head.
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  )
}
