'use client'

import Link from 'next/link'
import { Bot } from '@/types'

interface PricingCardProps {
  bot: Bot
  featured?: boolean
}

export default function PricingCard({ bot, featured = false }: PricingCardProps) {
  return (
    <div
      className={`card-hover relative overflow-hidden ${
        featured ? 'ring-2 ring-blue-500 transform scale-105' : ''
      }`}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
          POPULAR
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{bot.name}</h3>
        <p className="text-blue-400 text-sm font-semibold">{bot.type}</p>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-white mb-2">
          ${bot.price}
          <span className="text-lg text-slate-400 ml-2">USD</span>
        </div>
        <p className="text-slate-400 text-sm">One-time payment • Lifetime license</p>
      </div>

      <div className="space-y-3 mb-8">
        {bot.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-slate-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <Link href="/payment" className="btn-primary w-full text-center block">
        Purchase Now
      </Link>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">
          30-day money-back guarantee
        </p>
      </div>
    </div>
  )
}
