'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getWhatsAppLink } from '@/lib/constants'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'what-are-bots',
    question: 'What are the trading bots?',
    answer:
      'Our trading bots are Expert Advisors (EAs) - automated trading programs that run on MetaTrader 4 and MetaTrader 5 platforms. They analyze market conditions and execute trades automatically according to predefined strategies. PRIME SCALPER EA focuses on quick scalping trades, PRIME HEDGE EA uses hedging strategies, and PRIME AI ALGORITHM EA uses artificial intelligence for decision-making. These are tools designed to assist traders; they do not guarantee profits.',
  },
  {
    id: 'mt4-mt5-compatible',
    question: 'Are your bots compatible with MT4 and MT5?',
    answer:
      'Yes, our Expert Advisors are designed to work with both MetaTrader 4 (MT4) and MetaTrader 5 (MT5) platforms. However, not all features may work identically on both platforms due to technical differences. We recommend testing on your specific platform and broker setup before live trading. Some brokers may have restrictions on EAs, so please verify with your broker first.',
  },
  {
    id: 'how-purchase',
    question: 'How do I purchase a bot?',
    answer:
      'Purchasing is easy: 1) Create an account on our website, 2) Go to the Pricing page and select your desired bot, 3) Click "Buy Now" and proceed to checkout, 4) Select your preferred payment method, 5) Send the required payment, 6) Submit payment proof, 7) Wait for admin verification and approval, 8) Receive your bot files via email or dashboard. The entire process typically takes 24-48 hours after payment submission.',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept the following payment methods: JazzCash (03004587593), Easypaisa (03004587593), Binance Pay (Pay ID: 107948393), and Bybit Pay (UID: 436007452). Payment details are provided during checkout. All payments must be sent to the specified accounts. Please note: We do not accept credit cards directly; only the listed digital payment methods.',
  },
  {
    id: 'payment-verification',
    question: 'How long does payment verification take?',
    answer:
      'Payment verification typically takes 24-48 hours after you submit your payment proof. Our admin team manually reviews each payment to ensure it matches your order details. You will receive an email notification once your payment is verified and approved. If your payment takes longer to verify, it may be due to payment provider processing times or incomplete payment information. Contact support if you have questions.',
  },
  {
    id: 'delivery-process',
    question: 'What is the bot delivery process?',
    answer:
      'After your payment is approved: 1) The order status changes to "Verified" in your dashboard, 2) Admin prepares your bot files and delivery materials, 3) You receive an email with download link or file access, 4) You can download and install the bot on your MetaTrader platform, 5) Admin marks order as "Delivered" in your account, 6) You have lifetime access to your purchased bot.',
  },
  {
    id: 'dashboard-access',
    question: 'How do I access my customer dashboard and orders?',
    answer:
      'After creating your account and logging in, you\'ll see your Dashboard automatically. Your dashboard shows: Your purchased bots and their delivery status, Active orders and payment status, Download links for your bots, Order history and transaction details, Support options. You can access your dashboard anytime by clicking "Dashboard" in the header menu after logging in.',
  },
  {
    id: 'installation',
    question: 'How do I install the bot?',
    answer:
      'Installation steps: 1) Download your bot files from your dashboard or email link, 2) Extract the files if necessary, 3) Open MetaTrader 4 or MT5, 4) Click File → Open Data Folder, 5) Navigate to MQL4/Experts (for MT4) or MQL5/Experts (for MT5), 6) Copy the EA file (.ex4 or .ex5) into the Experts folder, 7) Restart MetaTrader, 8) The EA will appear in your Navigator panel, 9) Drag the EA onto your desired chart to attach it. Always test on a demo account first before using on a live account.',
  },
  {
    id: 'refund-policy',
    question: 'What is your refund policy?',
    answer:
      'We offer refunds within 30 days of purchase if: The product does not work as described, There are compatibility issues with your platform/broker, You experience technical issues with installation, or there are payment errors. Refunds do NOT apply to trading losses, changes of mind, or if the bot has been actively used for trading. See our full Refund Policy for complete details. Trading losses are never refundable.',
  },
  {
    id: 'trading-losses',
    question: 'Are you responsible for my trading losses?',
    answer:
      'No. PrimeBot Markets is not responsible for any trading losses. Our bots are tools to assist in trading; they do not guarantee profits or protect against losses. You are solely responsible for all trading decisions and outcomes. Always test on a demo account, use appropriate risk management, only trade with capital you can afford to lose, and never invest borrowed money. Past performance does not guarantee future results.',
  },
  {
    id: 'demo-account',
    question: 'Should I test on a demo account first?',
    answer:
      'Yes, absolutely! We strongly recommend testing on a demo account for at least 2-4 weeks before using the bot on a live account. Demo testing allows you to: Understand how the bot works, Verify compatibility with your broker, Test your settings and parameters, Observe the bot in different market conditions, Build confidence before risking real money. Demo testing results do not guarantee live trading results, but it is still the best way to prepare.',
  },
  {
    id: 'support-contact',
    question: 'How can I get support?',
    answer:
      'Support options: Email: chadnan76@gmail.com (response within 24 hours), WhatsApp: Click the floating WhatsApp button on any page, Support Page: Visit /support for FAQs and contact form. For account-related issues, log in to your dashboard and use the support option. For urgent issues, WhatsApp is the fastest way to reach us.',
  },
  {
    id: 'security',
    question: 'Is my account and payment information secure?',
    answer:
      'Yes. We use Supabase for secure authentication and database management, payment information is handled securely and never stored unnecessarily, your password is encrypted and never shared, and our website uses industry-standard security protocols. Never share your login credentials with anyone. Always access the website through our official domain. If you suspect account compromise, contact support immediately.',
  },
  {
    id: 'lifetime-access',
    question: 'What does lifetime access mean?',
    answer:
      'Lifetime access means you own the bot forever and have permanent rights to use it. You will always have access to download your bot files, updates and improvements are provided for life, your account and purchases do not expire, and you can use the bot on multiple accounts (based on your license terms). This is a one-time payment with no recurring fees or subscriptions.',
  },
  {
    id: 'multiple-purchase',
    question: 'Can I purchase multiple bots?',
    answer:
      'Yes, you can purchase multiple bots. Each purchase is separate and builds on your account. You can own PRIME SCALPER EA, PRIME HEDGE EA, and PRIME AI ALGORITHM EA simultaneously if desired. Each bot is managed separately in your dashboard. Combining strategies may increase your chances of trading success, but also increases your risk. Always test combinations on demo accounts first.',
  },
  {
    id: 'broker-compatibility',
    question: 'Will the bot work with my broker?',
    answer:
      'Most brokers are compatible, but some have restrictions or limitations on EAs. Compatibility factors include: Your broker uses MT4 or MT5, your broker allows EAs on their platform, your broker doesn\'t restrict the trading strategy, your account type allows automated trading. Contact your broker to confirm they support EAs before purchasing. If you experience issues, we\'ll work with you to troubleshoot or may offer a refund if incompatibility is confirmed.',
  },
  {
    id: 'performance-guarantees',
    question: 'Are profits guaranteed?',
    answer:
      'No. We do NOT guarantee any profits, specific returns, or protection against losses. Trading always involves risk. Past performance shown in backtests does not guarantee future results. Market conditions change constantly, and strategies that worked in the past may not work in the future. Always assume you could lose money. Only trade with capital you can afford to lose.',
  },
]

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Find answers to common questions about our trading bots, purchase process, and support
          </p>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="border border-slate-700 rounded-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                  <span
                    className={`text-blue-400 text-2xl transition-transform duration-300 ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {expandedId === item.id && (
                  <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
                    <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-16 bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Didn't find your answer?</h2>
            <p className="text-slate-400 mb-6">
              Our support team is here to help. Contact us through any of these methods:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Contact Support
              </Link>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Links to Policies */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/legal/refund"
              className="p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Refund Policy</h3>
              <p className="text-slate-400 text-sm">
                Learn about our 30-day refund policy and guarantee
              </p>
            </Link>

            <Link
              href="/legal/risk-disclaimer"
              className="p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Risk Disclaimer</h3>
              <p className="text-slate-400 text-sm">
                Important information about trading risks and guarantees
              </p>
            </Link>

            <Link
              href="/legal/terms"
              className="p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Terms & Conditions</h3>
              <p className="text-slate-400 text-sm">
                Read our full terms of service and user agreements
              </p>
            </Link>

            <Link
              href="/legal/privacy"
              className="p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Privacy Policy</h3>
              <p className="text-slate-400 text-sm">
                How we collect, use, and protect your personal data
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
