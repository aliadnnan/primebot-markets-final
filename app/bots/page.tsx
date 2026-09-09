import Link from 'next/link'
import PricingCard from '@/components/PricingCard'
import RiskDisclaimer from '@/components/RiskDisclaimer'
import { getActiveBots } from '@/lib/bots-server'

export default async function BotsPage() {
  const BOTS = await getActiveBots()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Trading <span className="gradient-text">Expert Advisors</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Professional-grade automated trading systems designed for modern traders. 
            Choose the strategy that matches your trading style.
          </p>
        </div>
      </section>

      {/* Bots Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {BOTS.map((bot) => (
              <PricingCard key={bot.id} bot={bot} />
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Comparison */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Detailed <span className="gradient-text">Comparison</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-700">
                  <th className="text-left py-4 px-6 text-white font-bold">Feature</th>
                  <th className="text-center py-4 px-6 text-white font-bold">PRIME SCALPER</th>
                  <th className="text-center py-4 px-6 text-white font-bold">PRIME HEDGE</th>
                  <th className="text-center py-4 px-6 text-white font-bold">PRIME AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Automated Trade Execution', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'Position Management', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'Risk Management', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'Market Analysis', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'Configurable Parameters', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'Real-Time Alerts', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'Scalping Focus', scalper: '✓', hedge: '✗', ai: '✗' },
                  { feature: 'Hedge Strategy', scalper: '✗', hedge: '✓', ai: '✓' },
                  { feature: 'AI Algorithm', scalper: '✗', hedge: '✗', ai: '✓' },
                  { feature: 'Advanced Automation', scalper: '✗', hedge: '✗', ai: '✓' },
                  { feature: 'Lifetime License', scalper: '✓', hedge: '✓', ai: '✓' },
                  { feature: 'EA File Included', scalper: '✓', hedge: '✓', ai: '✓' },
                ].map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-300">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-full flex items-center justify-center ${
                          row.scalper === '✓'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-500'
                        }`}
                      >
                        {row.scalper}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-full flex items-center justify-center ${
                          row.hedge === '✓'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-500'
                        }`}
                      >
                        {row.hedge}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-full flex items-center justify-center ${
                          row.ai === '✓'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-500'
                        }`}
                      >
                        {row.ai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How Each Bot Works */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            How Each Bot <span className="gradient-text">Works</span>
          </h2>

          <div className="space-y-12">
            {/* Scalper */}
            <div className="glass p-8 rounded-xl border border-blue-500/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">PRIME SCALPER EA</h3>
                  <p className="text-slate-300 mb-6">
                    Our scalping specialist focuses on quick, multiple small trades throughout the day. 
                    This strategy profits from small price movements and high-frequency trading opportunities.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Fast entry and exit points</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Ideal for volatile markets</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Minimal overnight exposure</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <p className="text-slate-400">High-frequency trading strategy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hedge */}
            <div className="glass p-8 rounded-xl border border-blue-500/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-700/50 rounded-lg p-6 flex items-center justify-center order-2 md:order-1">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🛡️</div>
                    <p className="text-slate-400">Risk-balanced strategy</p>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-3xl font-bold text-white mb-4">PRIME HEDGE EA</h3>
                  <p className="text-slate-300 mb-6">
                    Advanced hedging strategy that balances long and short positions to minimize risk. 
                    Perfect for traders seeking consistent returns with controlled drawdowns.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Dual position management</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Reduced market risk</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Steady profit accumulation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI */}
            <div className="glass p-8 rounded-xl border border-blue-500/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">PRIME AI ALGORITHM EA</h3>
                  <p className="text-slate-300 mb-6">
                    Next-generation AI-powered trading that adapts to market conditions. Our most advanced 
                    system with machine learning capabilities for superior performance.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Custom AI algorithm</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Adaptive market analysis</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">→</span>
                      <span className="text-slate-300">Advanced automation features</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🤖</div>
                    <p className="text-slate-400">AI-powered strategy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'What is an Expert Advisor (EA)?',
                a: 'An Expert Advisor is an automated trading program that runs on MetaTrader 4/5 platforms. It executes trades based on pre-programmed algorithms without requiring manual intervention.',
              },
              {
                q: 'Is the source code included?',
                a: 'No, source code is not included. You receive the compiled EA/Bot file ready to use. This protects our proprietary trading strategies.',
              },
              {
                q: 'Do I need coding knowledge?',
                a: 'No coding knowledge is required. Our EAs are ready to use out of the box. You can customize parameters without any programming experience.',
              },
              {
                q: 'What platforms are supported?',
                a: 'Our Expert Advisors are compatible with MetaTrader 4 (MT4) and MetaTrader 5 (MT5) on Windows, Mac, and Linux.',
              },
              {
                q: 'Can I get a refund?',
                a: 'Yes, we offer a 30-day money-back guarantee if you are not satisfied with your purchase.',
              },
              {
                q: 'Is there support available?',
                a: 'Yes, our support team is available to help you with setup, configuration, and any questions you may have. Email us at chadnan76@gmail.com',
              },
            ].map((item, index) => (
              <details key={index} className="card group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-white hover:text-blue-400 transition-colors">
                  <span>{item.q}</span>
                  <svg
                    className="w-6 h-6 transform transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </summary>
                <p className="text-slate-400 mt-4 pt-4 border-t border-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <div className="glass border-2 border-blue-500/50 rounded-xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-slate-300 mb-8">
              Choose your trading strategy and begin automated trading today
            </p>
            <Link href="/pricing" className="btn-primary inline-block">
              View Pricing & Purchase
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
