'use client'

import Link from 'next/link'
import { CONTACT_INFO, getWhatsAppLink, SUPPORT_EMAIL } from '@/lib/constants'

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
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-slate-400 hover:text-blue-500 transition-colors">
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

        {/* More Information - contact details */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h4 className="text-white font-semibold text-lg mb-1">More Information</h4>
            <p className="text-slate-400 text-sm mb-6">
              Talk to our team directly. We usually reply within a few hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Call Us */}
              <a
                href={`tel:${CONTACT_INFO.callLink}`}
                className="group flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                aria-label={`Call us on ${CONTACT_INFO.callDisplay}`}
              >
                <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
                    />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-slate-500">Call Us</span>
                  <span className="block text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
                    {CONTACT_INFO.callDisplay}
                  </span>
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-green-500 transition-colors"
                aria-label={`Message us on WhatsApp at ${CONTACT_INFO.whatsappDisplay}`}
              >
                <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-green-500/15 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.13h-.01a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.22 8.22 0 01-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.69 8.21-8.24 8.21zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.78.97-.14.17-.29.19-.53.07-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.46-.29z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-slate-500">WhatsApp</span>
                  <span className="block text-white font-semibold text-lg group-hover:text-green-400 transition-colors">
                    {CONTACT_INFO.whatsappDisplay}
                  </span>
                </span>
              </a>
            </div>
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
