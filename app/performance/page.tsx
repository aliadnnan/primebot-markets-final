import RiskDisclaimer from '@/components/RiskDisclaimer'
import { BACKTEST_RESULTS, PERFORMANCE_DATA } from '@/lib/constants'

export default function PerformancePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Trading <span className="gradient-text">Performance</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Real backtest results and verified trading data from our Expert Advisors
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="bg-blue-600/20 border-2 border-blue-500 rounded-lg p-8 mb-12">
            <h3 className="text-blue-400 font-bold text-lg mb-2">📊 About Our Performance Data</h3>
            <p className="text-slate-300">
              All performance data shown below is based on <span className="font-semibold">backtesting results</span> and 
              <span className="font-semibold"> verified live trading data</span>. Past performance does not guarantee future results. 
              Actual results may vary based on market conditions, broker settings, account size, and trading parameters.
            </p>
          </div>
        </div>
      </section>

      {/* Backtest Results */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Backtest <span className="gradient-text">Results</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BACKTEST_RESULTS.map((result, index) => (
              <div key={index} className="card">
                <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-700">
                  {result.name}
                </h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Win Rate</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-green-400">{result.winRate}%</span>
                      <div className="flex-1 bg-slate-700 rounded h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${result.winRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Profit Factor</p>
                    <div className="text-3xl font-bold text-blue-400">{result.profitFactor.toFixed(2)}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Gross profit / Gross loss ratio
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Max Drawdown</p>
                    <div className="text-3xl font-bold text-orange-400">{result.maxDrawdown}%</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Largest peak-to-trough decline
                    </p>
                  </div>

                  <div className="border-t border-slate-700 pt-6">
                    <p className="text-slate-400 text-sm mb-2">Total Trades</p>
                    <div className="text-2xl font-bold text-white">{result.totalTrades.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Performance Chart */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Monthly <span className="gradient-text">Performance</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Win Rate Chart */}
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-6">Monthly Win Rate</h3>
              <div className="space-y-4">
                {PERFORMANCE_DATA.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">{data.month}</span>
                      <span className="text-green-400 font-bold">{data.winRate}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full"
                        style={{ width: `${data.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profit Chart */}
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-6">Monthly Profit (USD)</h3>
              <div className="space-y-4">
                {PERFORMANCE_DATA.map((data, index) => {
                  const maxProfit = Math.max(...PERFORMANCE_DATA.map(d => d.profit))
                  const percentage = (data.profit / maxProfit) * 100
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300">{data.month}</span>
                        <span className="text-blue-400 font-bold">${data.profit}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Drawdown Chart */}
          <div className="card mt-12">
            <h3 className="text-xl font-bold text-white mb-6">Monthly Drawdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {PERFORMANCE_DATA.map((data, index) => (
                <div key={index} className="text-center">
                  <div className="flex flex-col items-center justify-end h-32 mb-3">
                    <div
                      className="w-8 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                      style={{
                        height: `${(data.drawdown / 5) * 100}%`,
                      }}
                      title={`${data.drawdown}%`}
                    ></div>
                  </div>
                  <p className="text-slate-300 font-semibold text-sm">{data.month}</p>
                  <p className="text-orange-400 text-sm">{data.drawdown}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Key <span className="gradient-text">Metrics</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Average Monthly Return',
                value: '14.2%',
                icon: '📈',
                description: 'Based on backtest data',
              },
              {
                label: 'Win Rate Average',
                value: '71%',
                icon: '🎯',
                description: 'Across all EAs',
              },
              {
                label: 'Risk-to-Reward Ratio',
                value: '1:3.5',
                icon: '⚖️',
                description: 'Average per trade',
              },
              {
                label: 'Sharpe Ratio',
                value: '2.12',
                icon: '📊',
                description: 'Risk-adjusted returns',
              },
            ].map((metric, index) => (
              <div key={index} className="card text-center">
                <div className="text-4xl mb-4">{metric.icon}</div>
                <p className="text-slate-400 text-sm mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-blue-400 mb-2">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live vs Backtest */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Live Trading vs <span className="gradient-text">Backtest</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Backtest Results
              </h3>
              <p className="text-slate-400 mb-6">
                Comprehensive historical analysis on 5+ years of data
              </p>
              <ul className="space-y-3">
                {[
                  'Tested on multiple market conditions',
                  'Controlled environment',
                  'Complete data set',
                  'No slippage or commission impact',
                  'Shows potential performance',
                ].map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>💹</span> Live Trading Results
              </h3>
              <p className="text-slate-400 mb-6">
                Real market conditions with actual trading parameters
              </p>
              <ul className="space-y-3">
                {[
                  'Real market slippage',
                  'Actual spreads & commissions',
                  'Real-time price movements',
                  'Variable market conditions',
                  'Confirms EA effectiveness',
                ].map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 glass border border-blue-500/30 p-8 rounded-lg">
            <p className="text-slate-300 leading-relaxed">
              Both backtest and live trading results are important. Backtests show what the EA 
              <span className="text-blue-400 font-semibold"> could have done</span> under historical conditions, 
              while live trading results show<span className="text-blue-400 font-semibold"> actual current performance</span>. 
              We monitor both metrics continuously to ensure our EAs perform as expected in real market conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom max-w-4xl">
          <RiskDisclaimer />
          
          <div className="mt-8 glass border border-yellow-500/30 bg-yellow-500/10 p-8 rounded-lg">
            <h3 className="text-yellow-500 font-bold text-lg mb-4">⚠️ Performance Disclaimer</h3>
            <p className="text-slate-300 mb-4">
              The performance data displayed on this page is provided for informational purposes only. 
              It represents historical results or simulation outcomes which do not guarantee future results. 
              Various factors can affect trading outcomes, including:
            </p>
            <ul className="space-y-2 text-slate-300 ml-4">
              <li>• Market conditions and volatility changes</li>
              <li>• Broker-specific settings and spreads</li>
              <li>• Account size and leverage settings</li>
              <li>• Trading hours and liquidity conditions</li>
              <li>• Economic events and news releases</li>
              <li>• Individual configuration and parameters</li>
            </ul>
            <p className="text-slate-300 mt-4">
              Past performance is not indicative of future results. All trading carries risk of loss. 
              Always use proper risk management and never risk more than you can afford to lose.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <div className="glass border-2 border-blue-500/50 rounded-xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>
            <p className="text-lg text-slate-300 mb-8">
              Join traders using PrimeBot Markets for automated trading
            </p>
            <a href="/pricing" className="btn-primary inline-block">
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
