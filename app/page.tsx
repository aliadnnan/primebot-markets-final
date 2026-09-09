import { Metadata } from 'next'
import Link from 'next/link'
import PricingCard from '@/components/PricingCard'
import RiskDisclaimer from '@/components/RiskDisclaimer'
import { getActiveBots } from '@/lib/bots-server'

export const metadata: Metadata = {
  title: 'PrimeBot Markets - Smart Trading. Powered by Automation.',
  description: 'Automated Trading Expert Advisors with Lifetime Licenses. Trade smarter with PRIME SCALPER EA, PRIME HEDGE EA, and PRIME AI ALGORITHM EA. Best price guaranteed.',
  keywords: 'trading bot, expert advisor, EA, forex trading, automated trading, MetaTrader, scalping bot, hedge trading',
  openGraph: {
    title: 'PrimeBot Markets - Smart Trading. Powered by Automation.',
    description: 'Professional automated trading Expert Advisors for MetaTrader platforms',
    url: 'https://primebot-markets.com',
    type: 'website',
    images: [
      {
        url: 'https://primebot-markets.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PrimeBot Markets',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrimeBot Markets - Smart Trading. Powered by Automation.',
    description: 'Professional automated trading Expert Advisors',
  },
}

export default async function Home() {
  const BOTS = await getActiveBots()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden section-padding">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl -top-48 -left-48"></div>
          <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-3xl bottom-0 right-0"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Smart Trading.{' '}
                <span className="gradient-text">Powered by Automation.</span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Trade like a professional with our advanced automated trading Expert Advisors. 
                Perfect for traders of all experience levels.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/pricing" className="btn-primary text-center">
                  View Packages
                </Link>
                <Link href="/bots" className="btn-outline text-center">
                  Learn More
                </Link>
              </div>

              <div className="flex gap-8 pt-8 border-t border-slate-700">
                <div>
                  <div className="text-2xl font-bold text-blue-400">3</div>
                  <p className="text-slate-400 text-sm">Trading Bots</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">∞</div>
                  <p className="text-slate-400 text-sm">Lifetime Access</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">24/7</div>
                  <p className="text-slate-400 text-sm">Automated Trading</p>
                </div>
              </div>
            </div>

            {/* Right Side - Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
                <p className="text-slate-400 text-sm">Execute trades in milliseconds with high-frequency algorithms</p>
              </div>

              <div className="glass p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Fully Customizable</h3>
                <p className="text-slate-400 text-sm">Adjust parameters to match your trading style and strategy</p>
              </div>

              <div className="glass p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Risk Management</h3>
                <p className="text-slate-400 text-sm">Advanced algorithms to minimize losses and protect capital</p>
              </div>

              <div className="glass p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Lifetime Value</h3>
                <p className="text-slate-400 text-sm">One-time payment with unlimited lifetime access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">PrimeBot Markets</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We provide professional-grade trading automation tools designed for serious traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Proven Strategies',
                description: 'Strategies tested and optimized through extensive backtesting and live trading.',
              },
              {
                icon: '⚡',
                title: 'Real-Time Execution',
                description: 'Execute trades instantly based on market conditions without emotional decisions.',
              },
              {
                icon: '📊',
                title: 'Detailed Analytics',
                description: 'Access comprehensive performance reports and trading statistics anytime.',
              },
              {
                icon: '🔒',
                title: 'Security First',
                description: 'Your data is protected with industry-standard security measures and encryption.',
              },
              {
                icon: '💪',
                title: 'Expert Support',
                description: 'Get help from our experienced team whenever you need assistance.',
              },
              {
                icon: '🚀',
                title: 'Continuous Updates',
                description: 'Regular improvements and new features to keep you ahead of the market.',
              },
            ].map((item, index) => (
              <div key={index} className="card group cursor-pointer">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Getting started with automated trading is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Choose Your Bot',
                description: 'Select from our three trading strategies that best fits your goals.',
              },
              {
                step: '2',
                title: 'Complete Payment',
                description: 'Make a one-time payment using your preferred payment method.',
              },
              {
                step: '3',
                title: 'Receive EA File',
                description: 'Get the Expert Advisor file via email with full setup instructions.',
              },
              {
                step: '4',
                title: 'Start Trading',
                description: 'Install on your MT4/MT5 and begin automated trading 24/7.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card h-full">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/4 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Trading <span className="gradient-text">Bots</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Professional-grade automated trading systems for every trader
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {BOTS.map((bot) => (
              <PricingCard key={bot.id} bot={bot} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/pricing" className="btn-primary inline-block">
              View All Packages & Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="glass border-2 border-blue-500/50 rounded-xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Automate Your Trading?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who are already using PrimeBot Markets to automate their trading
            </p>
            <Link href="/pricing" className="btn-primary inline-block">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <RiskDisclaimer />
        </div>
      </section>
    </div>
  )
}
