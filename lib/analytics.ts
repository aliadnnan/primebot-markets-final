/**
 * Google Analytics 4 Event Tracking
 * Provides reusable functions for tracking events throughout the application
 */

// Check if GA is properly initialized
export const isGAEnabled = (): boolean => {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) && typeof window !== 'undefined' && window.gtag
}

// Track page view
export const trackPageView = (path: string, title?: string) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  })
}

// Track bot page view
export const trackBotPageView = (botId: string, botName: string) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'bot_page_view', {
    bot_id: botId,
    bot_name: botName,
  })
}

// Track bot selection for purchase
export const trackBotSelection = (botId: string, botName: string, price: number) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'bot_selected', {
    bot_id: botId,
    bot_name: botName,
    bot_price: price,
  })
}

// Track "Buy Bot" button click
export const trackBuyBotClick = (botId: string, botName: string, price: number) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'buy_bot_clicked', {
    bot_id: botId,
    bot_name: botName,
    bot_price: price,
  })
}

// Track checkout/payment page start
export const trackCheckoutStarted = (botName: string, price: number) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'checkout_started', {
    bot_name: botName,
    amount: price,
  })
}

// Track payment method selection
export const trackPaymentMethodSelected = (method: string, amount: number) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'payment_method_selected', {
    payment_method: method,
    amount: amount,
  })
}

// Track payment proof submission
export const trackPaymentProofSubmitted = (paymentMethod: string, botName: string, amount: number) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'payment_proof_submitted', {
    payment_method: paymentMethod,
    bot_name: botName,
    amount: amount,
  })
}

// Track order creation
export const trackOrderCreated = (orderId: string, botName: string, price: number, paymentMethod: string) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'order_created', {
    order_id: orderId,
    bot_name: botName,
    amount: price,
    payment_method: paymentMethod,
  })
}

// Track payment approval (admin action)
export const trackPaymentApproved = (orderId: string, botName: string, amount: number) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'payment_approved', {
    order_id: orderId,
    bot_name: botName,
    amount: amount,
  })
}

// Track customer login
export const trackCustomerLogin = (userId: string, email: string) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'customer_login', {
    user_id: userId,
    email: email,
  })
}

// Track customer signup
export const trackCustomerSignup = (userId: string, email: string) => {
  if (!isGAEnabled()) return

  window.gtag('event', 'customer_signup', {
    user_id: userId,
    email: email,
  })
}

// Track custom event (generic)
export const trackCustomEvent = (eventName: string, eventData?: Record<string, string | number | boolean>) => {
  if (!isGAEnabled()) return

  window.gtag('event', eventName, eventData || {})
}

// Set user ID for tracking (after login)
export const setGAUserId = (userId: string) => {
  if (!isGAEnabled()) return

  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    user_id: userId,
  })
}

// Clear user ID (on logout)
export const clearGAUserId = () => {
  if (!isGAEnabled()) return

  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    user_id: undefined,
  })
}
