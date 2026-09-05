'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BOTS, PAYMENT_METHODS } from '@/lib/constants'
import { createNewOrder } from '@/app/actions/orders'
import { uploadPaymentProofFile } from '@/app/actions/orders'
import toast from 'react-hot-toast'
import {
  trackCheckoutStarted,
  trackBotSelection,
  trackPaymentMethodSelected,
  trackPaymentProofSubmitted,
  trackOrderCreated,
} from '@/lib/analytics'

export default function PaymentPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('')
  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [transactionId, setTransactionId] = useState('')
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    fullName?: string
    transactionId?: string
    paymentFile?: string
  }>({})
  const [orderId, setOrderId] = useState<string | null>(null)

  const selected = selectedBot ? BOTS.find((b) => b.id === selectedBot) : null
  const paymentSelected = selectedPayment ? PAYMENT_METHODS.find((p) => p.id === selectedPayment) : null

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container-custom max-w-md text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-slate-400 mb-8">Please log in to purchase a trading bot.</p>
          <Link href="/auth/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLabel(label)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedLabel(null), 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          paymentFile: 'File size must be less than 10MB',
        }))
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          paymentFile: 'Only images (JPG, PNG, GIF, WebP) and PDF are allowed',
        }))
        return
      }

      setPaymentFile(file)
      setFileName(file.name)
      setErrors((prev) => ({ ...prev, paymentFile: undefined }))
    }
  }

  const handleNext = () => {
    if (step < 5) {
      setStep((step + 1) as any)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as any)
    }
  }

  const validateStep4 = () => {
    const newErrors: {
      fullName?: string
      transactionId?: string
      paymentFile?: string
    } = {}

    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name'
    }

    if (!transactionId || transactionId.trim().length < 3) {
      newErrors.transactionId = 'Please enter transaction ID or hash'
    }

    if (!paymentFile) {
      newErrors.paymentFile = 'Please upload payment proof screenshot'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = async () => {
    if (!validateStep4() || !user || !selected || !paymentSelected) return

    setLoading(true)
    try {
      // Track payment proof submission
      trackPaymentProofSubmitted(paymentSelected.name, selected.name, selected.price)

      // 1. Create order
      const orderResult = await createNewOrder(
        user.id,
        selected.id,
        selected.name,
        selected.price,
        paymentSelected.name,
        transactionId,
        user.email || '',
        fullName
      )

      if (!orderResult.orderId) throw new Error('Failed to create order')

      setOrderId(orderResult.orderId)

      // Track order creation
      trackOrderCreated(orderResult.orderId, selected.name, selected.price, paymentSelected.name)

      // 2. Upload payment proof
      if (paymentFile) {
        try {
          await uploadPaymentProofFile(user.id, orderResult.orderId, paymentFile, user.email || '', fullName)
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          // Continue even if upload fails - order is created
        }
      }

      toast.success('Order submitted! Moving to confirmation...')
      setTimeout(() => handleNext(), 1000)
    } catch (error: any) {
      console.error('Order submission error:', error)
      toast.error(error?.message || 'Failed to submit order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container-custom">
          <p className="text-center text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Step {step} of 5</span>
            <span className="text-blue-400">
              {
                [
                  'Select EA',
                  'Choose Payment',
                  'Payment Details',
                  'Enter Transaction',
                  'Confirm Order',
                ][step - 1]
              }
            </span>
          </div>
        </div>

        {/* Step 1: Select EA */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Choose Your Trading Bot</h1>
            <p className="text-slate-400 mb-8">Select the Expert Advisor that matches your trading style</p>

            <div className="space-y-4 mb-12">
              {BOTS.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => {
                    setSelectedBot(bot.id)
                    trackBotSelection(bot.id, bot.name, bot.price)
                  }}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                    selectedBot === bot.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{bot.name}</h3>
                      <p className="text-slate-400 text-sm">{bot.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-400">${bot.price}</p>
                      <p className="text-xs text-slate-500">One-time</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{bot.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (selected) {
                  trackCheckoutStarted(selected.name, selected.price)
                }
                handleNext()
              }}
              disabled={!selectedBot}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment Method
            </button>
          </div>
        )}

        {/* Step 2: Choose Payment Method */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Select Payment Method</h1>
            <p className="text-slate-400 mb-8">Choose how you want to pay for {selected?.name}</p>

            <div className="space-y-4 mb-12">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedPayment(method.id)
                    if (selected) {
                      trackPaymentMethodSelected(method.name, selected.price)
                    }
                  }}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                    selectedPayment === method.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-1">{method.name}</h3>
                  <p className="text-slate-400 text-sm">{method.description}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedPayment}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Payment Details</h1>
            <p className="text-slate-400 mb-8">Send payment to the account below</p>

            {paymentSelected && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-12">
                <div className="mb-6">
                  <p className="text-slate-400 text-sm mb-2">Account Type:</p>
                  <p className="text-white text-lg font-medium">{paymentSelected.accountType}</p>
                </div>

                <div className="mb-8 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-2">Account Number:</p>
                  <div className="flex items-center justify-between">
                    <p className="text-white text-3xl font-bold font-mono">{paymentSelected.accountNumber}</p>
                    <button
                      onClick={() => copyToClipboard(paymentSelected.accountNumber, paymentSelected.id)}
                      className={`px-4 py-2 rounded-lg transition ${
                        copiedLabel === paymentSelected.id
                          ? 'bg-green-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {copiedLabel === paymentSelected.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-slate-300 text-sm">{paymentSelected.instructions}</p>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ <strong>Important:</strong> Keep your transaction ID/receipt safe. You'll need it in the next step.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button onClick={handleNext} className="flex-1 btn-primary">
                Confirm & Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Enter Transaction Details */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Submit Payment Proof</h1>
            <p className="text-slate-400 mb-8">Provide your transaction ID and upload payment screenshot</p>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 mb-12">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border ${
                    errors.fullName ? 'border-red-500' : 'border-slate-600'
                  } text-white focus:outline-none focus:border-blue-500 transition`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {paymentSelected?.id === 'binance' || paymentSelected?.id === 'bybit'
                    ? 'Transaction Hash'
                    : 'Transaction ID'}
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={`Enter your transaction ${paymentSelected?.id === 'binance' || paymentSelected?.id === 'bybit' ? 'hash' : 'ID'}`}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border ${
                    errors.transactionId ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                />
                {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Proof Screenshot
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    paymentFile
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <p className="text-slate-400 text-sm mb-2">
                    {fileName ? `✓ ${fileName}` : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Images (JPG, PNG, GIF, WebP) or PDF, max 10MB
                  </p>
                </div>
                {errors.paymentFile && <p className="text-red-500 text-xs mt-1">{errors.paymentFile}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">✓</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Order Submitted!</h1>
              <p className="text-slate-400 mb-8 text-lg">
                Your order has been received and is pending payment verification.
              </p>

              <div className="bg-slate-700/50 rounded-lg p-6 text-left mb-8 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-white font-mono">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product:</span>
                  <span className="text-white">{selected?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white">${selected?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-yellow-400">Pending Verification</span>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-8">
                <p className="text-blue-400 text-sm">
                  ℹ️ Our team will verify your payment within 24 hours. Check your email for updates.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1 btn-primary">
                  View Order in Dashboard
                </Link>
                <Link href="/" className="flex-1 px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
