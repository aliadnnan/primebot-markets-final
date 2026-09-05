import type { Metadata } from 'next'
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
