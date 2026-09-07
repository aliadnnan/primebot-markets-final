import { Bot, PaymentMethod } from '@/types'

export const BOTS: Bot[] = [
  {
    id: 'scalper',
    name: 'PRIME SCALPER EA',
    type: 'Scalping Trading EA',
    price: 200,
    description: 'Fast and efficient scalping-focused trading with automated execution',
    features: [
      'Automated trade execution',
      'Scalping-focused trading approach',
      'Adjustable trading settings',
      'Automated position management',
      'Lifetime license',
      'EA/Bot file included',
    ],
    image: '/images/scalper.svg',
  },
  {
    id: 'hedge',
    name: 'PRIME HEDGE EA',
    type: 'Hedge-Based Trading EA',
    price: 400,
    description: 'Advanced hedge-based trading logic with sophisticated risk management',
    features: [
      'Hedge-based trading logic',
      'Automated position management',
      'Configurable risk parameters',
      'Advanced trading controls',
      'Lifetime license',
      'EA/Bot file included',
    ],
    image: '/images/hedge.svg',
  },
  {
    id: 'ai',
    name: 'PRIME AI ALGORITHM EA',
    type: 'Custom AI Algorithm EA',
    price: 600,
    description: 'Next-generation AI-powered trading with custom algorithm logic',
    features: [
      'Custom algorithm-based trading logic',
      'Automated market analysis',
      'Configurable trading parameters',
      'Automated trade execution',
      'Advanced automation features',
      'Lifetime license',
      'EA/Bot file included',
    ],
    image: '/images/ai.svg',
  },
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    description: 'Mobile payment through JazzCash (Pakistan)',
    accountNumber: '03004587593',
    accountType: 'Phone Number',
    instructions: 'Send payment to the JazzCash number. Use the transaction ID from your confirmation as reference.',
  },
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    description: 'Easypaisa mobile account transfer',
    accountNumber: '03004587593',
    accountType: 'Phone Number',
    instructions: 'Send payment to the Easypaisa number. Use the transaction ID from your confirmation as reference.',
  },
  {
    id: 'binance',
    name: 'Binance Pay',
    description: 'Crypto payment via Binance',
    accountNumber: '107948393',
    accountType: 'Binance Pay ID',
    instructions: 'Send payment using Binance Pay ID. Use the transaction hash from your confirmation as reference.',
  },
  {
    id: 'bybit',
    name: 'Bybit Pay',
    description: 'Crypto payment via Bybit',
    accountNumber: '436007452',
    accountType: 'Bybit UID',
    instructions: 'Send payment to Bybit UID. Use the transaction hash from your confirmation as reference.',
  },
]

export const PERFORMANCE_DATA = [
  { month: 'Jan', winRate: 68, profit: 1200, drawdown: 3.2 },
  { month: 'Feb', winRate: 72, profit: 1850, drawdown: 2.8 },
  { month: 'Mar', winRate: 65, profit: 950, drawdown: 4.1 },
  { month: 'Apr', winRate: 75, profit: 2100, drawdown: 2.5 },
  { month: 'May', winRate: 70, profit: 1650, drawdown: 3.5 },
  { month: 'Jun', winRate: 73, profit: 1900, drawdown: 2.9 },
]

export const BACKTEST_RESULTS = [
  {
    name: 'PRIME SCALPER EA',
    winRate: 68,
    profitFactor: 1.85,
    maxDrawdown: 4.2,
    totalTrades: 2847,
  },
  {
    name: 'PRIME HEDGE EA',
    winRate: 71,
    profitFactor: 2.12,
    maxDrawdown: 3.8,
    totalTrades: 1563,
  },
  {
    name: 'PRIME AI ALGORITHM EA',
    winRate: 74,
    profitFactor: 2.35,
    maxDrawdown: 3.5,
    totalTrades: 1892,
  },
]

export const SUPPORT_EMAIL = 'chadnan76@gmail.com'

/**
 * Single source of truth for public contact details.
 *
 * Note on formats: wa.me and tel: links need the number in international
 * format WITHOUT the leading zero. Pakistan's country code is 92, so the local
 * number 03014879047 becomes 923014879047. The previous links used the local
 * format directly (wa.me/03014879047), which WhatsApp rejects as an invalid
 * number - that is why the WhatsApp button did not open a chat.
 */
export const CONTACT_INFO = {
  /** Voice line, as customers know it. */
  callDisplay: '03004587593',
  /** tel: target in international format. */
  callLink: '+923004587593',
  /** WhatsApp line, as customers know it. */
  whatsappDisplay: '03014879047',
  /** wa.me target: country code + number, digits only, no leading zero. */
  whatsappNumber: '923014879047',
  defaultWhatsAppMessage:
    'Hi! I need support with my PrimeBot Markets account and trading bots.',
}

/** Builds a wa.me link with an optional pre-filled message. */
export function getWhatsAppLink(message: string = CONTACT_INFO.defaultWhatsAppMessage) {
  return `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`
}
