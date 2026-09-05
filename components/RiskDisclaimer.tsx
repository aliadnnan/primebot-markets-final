export default function RiskDisclaimer() {
  return (
    <div id="disclaimer" className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 my-8">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-yellow-500 font-semibold mb-2">Important Risk Disclaimer</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Trading involves significant financial risk. Past performance does not guarantee future results. 
            PrimeBot Markets does not guarantee profits or specific returns. All trading carries risk of loss. 
            Users are responsible for their own trading decisions and risk management. No trading strategy, including 
            automated trading, can guarantee profits. Trading bots operate based on programmed parameters and market conditions, 
            and may not perform as expected in all market environments. Always conduct your own research and understand the risks 
            before using any trading bot.
          </p>
        </div>
      </div>
    </div>
  )
}
