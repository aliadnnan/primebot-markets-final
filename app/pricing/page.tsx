import { Metadata } from 'next'
import Link from 'next/link'
import PricingCard from '@/components/PricingCard'
import RiskDisclaimer from '@/components/RiskDisclaimer'
import { BOTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Pricing Plans | PrimeBot Markets',
  description: 'Affordable trading bot pricing. One-time payment. Lifetime access. No hidden fees. Choose PRIME SCALPER EA, PRIME HEDGE EA, or PRIME AI ALGORITHM EA.',
  openGraph: {
    title: 'Pricing Plans | PrimeBot Markets',
    description: 'Professional trading bot pricing with lifetime access',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            One-time payment. Lifetime access. No hidden fees. Cancel anytime.
          </p>
          <div className="inline-block glass px-6 py-3 rounded-lg border border-blue-500/30">
            <span className="text-slate-300">
              30-day <span className="text-green-400 font-semibold">money-back guarantee</span> on all packages
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {BOTS.map((bot, index) => (
              <PricingCard key={bot.id} bot={bot} featured={index === 2} />
            ))}
          </div>

          {/* What's Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">What You Get</h3>
              <ul className="space-y-4">
                {[
                  'Expert Advisor (EA) file for MT4/MT5',
                  'Complete setup and installation guide',
                  'Access to our knowledge base',
                  'Email support from our team',
                  'Free future updates',
                  'Unlimited trading accounts',
                  'Lifetime license - no renewal fees',
                  '30-day money-back guarantee',
                ].map((item, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Not Included</h3>
              <ul className="space-y-4">
                {[
                  'Source code access',
                  'Private coaching sessions',
                  'Custom modifications',
                  'Trading account funding',
                  'Guaranteed profits',
                  'Live trading results',
                  'Direct phone support',
                  'Dedicated account manager',
                ].map((item, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Accepted <span className="gradient-text">Payment Methods</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { name: 'JazzCash', icon: '💳', description: 'Mobile payment (Pakistan)' },
              { name: 'Easypaisa', icon: '📱', description: 'Mobile wallet transfer' },
              { name: 'Binance', icon: '🪙', description: 'Cryptocurrency payment' },
              { name: 'Bybit', icon: '⚡', description: 'Crypto exchange transfer' },
            ].map((method, index) => (
              <div key={index} className="card text-center">
                <div className="text-4xl mb-3">{method.icon}</div>
                <h3 className="text-white font-semibold mb-1">{method.name}</h3>
                <p className="text-slate-400 text-sm">{method.description}</p>
              </div>
            ))}
          </div>

          <div className="glass border border-blue-500/30 rounded-lg p-8">
            <p className="text-slate-300 text-center">
              <span className="text-yellow-500 font-semibold">💡 Tip:</span> Choose the payment method most convenient for you. 
              Each method is secure and processed instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Package <span className="gradient-text">Comparison</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-700">
                  <th className="text-left py-4 px-6 text-white font-bold">Feature</th>
                  <th className="text-center py-4 px-6 text-white font-bold">SCALPER<br/><span className="text-blue-400 text-lg">$200</span></th>
                  <th className="text-center py-4 px-6 text-white font-bold">HEDGE<br/><span className="text-blue-400 text-lg">$400</span></th>
                  <th className="text-center py-4 px-6 text-white font-bold">AI<br/><span className="text-blue-400 text-lg">$600</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Automated Trading',
                  'Position Management',
                  'Risk Configuration',
                  'Real-Time Alerts',
                  'Trading Analytics',
                  'Lifetime License',
                  'Updates Included',
                  'Email Support',
                  'Knowledge Base Access',
                  'Scalping Focus',
                  'Hedge Strategy',
                  'AI Algorithm',
                  'Advanced Features',
                ].map((feature, index) => {
                  const isAdvanced = ['Scalping Focus', 'Hedge Strategy', 'AI Algorithm', 'Advanced Features'].includes(feature);
                  const isAIOnly = ['AI Algorithm', 'Advanced Features'].includes(feature);
                  
                  return (
                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-slate-300">{feature}</td>
                      <td className="py-4 px-6 text-center text-green-400">✓</td>
                      <td className="py-4 px-6 text-center text-green-400">✓</td>
                      <td className="py-4 px-6 text-center">
                        {isAIOnly ? <span className="text-green-400">✓</span> : (isAdvanced ? <span className="text-slate-500">○</span> : <span className="text-green-400">✓</span>)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Why Our Pricing <span className="gradient-text">Is Fair</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '💰',
                title: 'One-Time Payment',
                description: 'No recurring subscriptions or hidden fees. Pay once and trade forever.',
              },
              {
                icon: '♾️',
                title: 'Lifetime Access',
                description: 'Your license never expires. Keep trading as long as you want.',
              },
              {
                icon: '🚀',
                title: 'Free Updates',
                description: 'Receive all future improvements and features at no additional cost.',
              },
              {
                icon: '✅',
                title: 'Money-Back Guarantee',
                description: '30 days to try risk-free. Full refund if not satisfied.',
              },
              {
                icon: '🛡️',
                title: 'Proven Strategies',
                description: 'Based on years of research and backtesting by trading professionals.',
              },
              {
                icon: '📞',
                title: 'Expert Support',
                description: 'Get help from our experienced team whenever you need it.',
              },
            ].map((item, index) => (
              <div key={index} className="card">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <div className="glass border-2 border-blue-500/50 rounded-xl p-12 mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Trading Strategy</h2>
            <p className="text-lg text-slate-300 mb-8">
              Pick the EA that matches your trading goals and get started today
            </p>
            <Link href="/payment" className="btn-primary inline-block">
              Proceed to Payment
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOTS.map((bot) => (
              <Link
                key={bot.id}
                href="/payment"
                className="glass p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <p className="text-white font-semibold">{bot.name}</p>
                <p className="text-blue-400 text-2xl font-bold mt-2">${bot.price}</p>
              </Link>
            ))}
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
