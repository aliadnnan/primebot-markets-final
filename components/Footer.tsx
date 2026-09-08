'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="container-custom px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">PrimeBot Markets</h3>
            <p className="text-slate-400 text-sm">
              Smart Trading. Powered by Automation.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/bots" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Trading Bots
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/performance" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Performance
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:chadnan76@gmail.com" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/risk-disclaimer" className="text-slate-400 hover:text-blue-500 transition-colors">
                  Risk Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-yellow-500 font-semibold mb-2">Risk Disclaimer</h4>
            <p className="text-slate-400 text-sm">
              Trading involves significant financial risk. Past performance does not guarantee future results. 
              PrimeBot Markets does not guarantee profits or specific returns. Users are responsible for their own 
              trading decisions and risk management.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-400 text-sm">
            &copy; {currentYear} PrimeBot Markets. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
              Twitter
            </a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
              Telegram
            </a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
