import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Risk Disclaimer | PrimeBot Markets',
  description: 'Risk disclaimer for PrimeBot Markets trading bots. Please read before trading.',
}

export default function RiskDisclaimerPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Risk Disclaimer</h1>
        <p className="text-slate-400 mb-8">Last updated: September 2026</p>

        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-12">
          <p className="text-red-300 font-semibold text-lg">
            ⚠️ CRITICAL: Please read this entire disclaimer carefully before using any trading products.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Financial Risk */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Financial Risk Warning</h2>
            <p className="text-slate-300 font-semibold">
              Trading in financial markets carries a high degree of risk. You may lose some or all of your investment capital.
            </p>
            <p className="text-slate-300">
              PrimeBot Markets' automated trading Expert Advisors (EAs) are tools designed to assist in trading decisions. They do not guarantee profits, specific returns, or protection against losses.
            </p>
            <p className="text-slate-300">
              Only trade with money you can afford to lose completely. Never invest borrowed funds or money intended for essential expenses.
            </p>
          </section>

          {/* No Guarantees */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. No Profit Guarantees</h2>
            <p className="text-slate-300">
              PrimeBot Markets DOES NOT guarantee:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Any specific level of profit</li>
              <li>Any minimum return on investment</li>
              <li>Protection against financial loss</li>
              <li>Consistent performance over time</li>
              <li>Future success based on past results</li>
            </ul>
            <p className="text-slate-300 font-semibold mt-4">
              Anyone claiming to guarantee profits in trading is misleading you.
            </p>
          </section>

          {/* Past Performance */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Past Performance</h2>
            <p className="text-slate-300">
              Past performance results are NOT indicative of future results. Historical trading data and backtesting results do not guarantee that similar results will occur in live trading or with real market conditions.
            </p>
            <p className="text-slate-300">
              Market conditions change constantly. Strategies that performed well in the past may not perform well in the future. External economic factors, geopolitical events, and market volatility can significantly affect trading outcomes.
            </p>
          </section>

          {/* Market Volatility */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Market Volatility and Risk</h2>
            <p className="text-slate-300">
              Financial markets are inherently volatile and unpredictable. The following factors can cause significant losses:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Sudden market gaps and price fluctuations</li>
              <li>Unexpected economic announcements and news events</li>
              <li>Geopolitical events and political instability</li>
              <li>Broker platform failures or technical issues</li>
              <li>Slippage and requotes on trade execution</li>
              <li>Changes in trading regulations</li>
              <li>Currency fluctuations and exchange rate changes</li>
            </ul>
          </section>

          {/* Strategy Risk */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Strategy-Specific Risks</h2>
            <p className="text-slate-300">
              Our trading strategies involve specific risks:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Scalping strategies may face slippage on rapid trade executions</li>
              <li>Hedging strategies involve multiple positions with potential for losses on all sides</li>
              <li>AI algorithms make predictions based on historical data that may not predict future performance</li>
              <li>Stop-loss orders may execute at unfavorable prices during volatility</li>
              <li>Leverage amplifies both gains and losses</li>
            </ul>
          </section>

          {/* Broker Risk */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Broker and Platform Risk</h2>
            <p className="text-slate-300">
              Our EAs work with MetaTrader 4 and MetaTrader 5 platforms. Risks include:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Your chosen broker may reject or requote your orders</li>
              <li>Platform technical failures or outages</li>
              <li>Broker liquidity issues affecting trade execution</li>
              <li>Broker spreads and commissions reducing profits</li>
              <li>Broker account limitations or restrictions</li>
              <li>Account closure by your broker</li>
            </ul>
          </section>

          {/* Technical Risk */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Technical and Software Risks</h2>
            <p className="text-slate-300">
              Like all software, our EAs may have limitations and risks:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Software bugs or unexpected behavior</li>
              <li>Compatibility issues with certain brokers or platforms</li>
              <li>Parameter configuration errors</li>
              <li>Network connectivity issues</li>
              <li>Errors in trade execution or order placement</li>
              <li>Unintended behavior under extreme market conditions</li>
            </ul>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. User Responsibility</h2>
            <p className="text-slate-300">
              You are solely responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Understanding the products you purchase</li>
              <li>Making informed trading decisions</li>
              <li>Testing strategies on demo accounts first</li>
              <li>Proper risk management and position sizing</li>
              <li>Monitoring your account regularly</li>
              <li>Keeping your account credentials secure</li>
              <li>Following proper installation and configuration procedures</li>
              <li>All trading decisions and outcomes</li>
            </ul>
          </section>

          {/* Demo Testing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Demo Testing Requirement</h2>
            <p className="text-slate-300">
              We strongly recommend that you:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Test all EAs on a demo account before live trading</li>
              <li>Run at least 2-4 weeks of demo testing</li>
              <li>Observe the EA's behavior under different market conditions</li>
              <li>Test with your intended trading parameters</li>
              <li>Only proceed to live trading if you fully understand the risks</li>
            </ul>
            <p className="text-slate-300">
              Demo testing results do not guarantee live trading results.
            </p>
          </section>

          {/* Emotional Trading */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Emotional Trading Risk</h2>
            <p className="text-slate-300">
              Even with automated trading:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>You may be tempted to override automated decisions</li>
              <li>Fear and greed can lead to poor decision-making</li>
              <li>Emotion-driven actions often increase losses</li>
              <li>You must follow your trading plan consistently</li>
            </ul>
          </section>

          {/* Leverage Risk */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Leverage and Margin Risk</h2>
            <p className="text-slate-300">
              If your trading strategy uses leverage:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Leverage amplifies both profits AND losses</li>
              <li>High leverage can wipe out your account quickly</li>
              <li>Margin calls can force position closure at unfavorable prices</li>
              <li>Small price movements can result in complete account loss</li>
              <li>Always use appropriate position sizing and risk management</li>
            </ul>
          </section>

          {/* Regulatory Risk */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Regulatory and Legal Risk</h2>
            <p className="text-slate-300">
              Trading regulations vary by country and jurisdiction:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Automated trading may be restricted in your jurisdiction</li>
              <li>Certain brokers may not be regulated in your country</li>
              <li>Tax implications vary by location</li>
              <li>You are responsible for compliance with local laws</li>
              <li>Regulations can change at any time</li>
            </ul>
            <p className="text-slate-300">
              Consult with a legal professional regarding trading regulations in your country.
            </p>
          </section>

          {/* No Investment Advice */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Not Investment Advice</h2>
            <p className="text-slate-300">
              PrimeBot Markets is NOT providing investment, financial, or trading advice. Our products are tools to assist in trading, not recommendations to trade or invest.
            </p>
            <p className="text-slate-300">
              This disclaimer does not constitute investment advice, and we do not advise individuals on their personal trading decisions. Consult with a qualified financial advisor before trading.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Limitation of Liability</h2>
            <p className="text-slate-300">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRIMEBOT MARKETS SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Any trading losses or financial losses</li>
              <li>Lost profits or lost opportunity</li>
              <li>Indirect, incidental, or consequential damages</li>
              <li>System failures or technical issues</li>
              <li>Broker-related failures or issues</li>
              <li>Any damages arising from use of our products</li>
            </ul>
          </section>

          {/* Acknowledgment */}
          <section className="bg-red-900/20 border border-red-700 rounded-lg p-6 mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">15. Acknowledgment and Agreement</h2>
            <p className="text-red-300 font-semibold">
              By using PrimeBot Markets products, you acknowledge that:
            </p>
            <ul className="list-disc list-inside text-red-300 space-y-2 ml-4">
              <li>You have read and understood this entire disclaimer</li>
              <li>You understand the significant risks involved in trading</li>
              <li>You will only trade with money you can afford to lose</li>
              <li>You assume all risk of trading losses</li>
              <li>You will not hold PrimeBot Markets liable for losses</li>
              <li>You will follow proper risk management practices</li>
              <li>You take full responsibility for your trading decisions</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p className="text-slate-300">
              If you have questions about this Risk Disclaimer, please contact us at:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
