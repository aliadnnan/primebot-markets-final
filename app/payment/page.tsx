'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BOTS, PAYMENT_METHODS } from '@/lib/constants'
import { uploadPaymentProofDirect } from '@/lib/payment-proof-upload'
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
  const { user, loading: authLoading, getAccessToken } = useAuth()
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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitStage, setSubmitStage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Bots and payment methods come from the database so an admin can change
  // prices and account numbers without a code change. lib/constants.ts is the
  // fallback only. The PRICE CHARGED is always re-read on the server in
  // /api/orders/create, so what is shown here can never be used to underpay.
  const [bots, setBots] = useState(BOTS)
  const [methods, setMethods] = useState(PAYMENT_METHODS)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [botRes, methodRes] = await Promise.all([
          fetch('/api/bots'),
          fetch('/api/payment-methods'),
        ])
        const botData = await botRes.json().catch(() => null)
        const methodData = await methodRes.json().catch(() => null)
        if (!active) return
        if (botData?.success && Array.isArray(botData.bots) && botData.bots.length) {
          setBots(botData.bots)
        }
        if (methodData?.success && Array.isArray(methodData.methods) && methodData.methods.length) {
          setMethods(methodData.methods)
        }
      } catch (error) {
        // Constants remain in place - checkout stays usable.
        console.error('[checkout] Could not load live bots/payment methods:', error)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const selected = selectedBot ? bots.find((b: any) => b.id === selectedBot) : null
  const paymentSelected = selectedPayment
    ? methods.find((p: any) => p.id === selectedPayment)
    : null

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
    setSubmitError(null)

    try {
      const accessToken = await getAccessToken()
      if (!accessToken) {
        throw new Error('Your session has expired. Please sign in again and retry.')
      }

      trackPaymentProofSubmitted(paymentSelected.name, selected.name, selected.price)

      // ---- 1. Create the order, ONCE, on the server -------------------
      //
      // Only IDs are sent. The server resolves the user from the token and
      // reads the authoritative bot price from the database, so nothing that
      // affects money is taken from the browser.
      //
      // If a previous attempt already created the order and only the proof
      // upload failed, that order ID is reused - creating a second order on
      // retry is what produced duplicates.
      let currentOrderId = orderId

      if (!currentOrderId) {
        setSubmitStage('Creating your order')

        const createResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            botId: selected.id,
            paymentMethodId: paymentSelected.id,
            transactionId: transactionId.trim(),
            fullName,
          }),
        })

        const createData = await createResponse.json().catch(() => null)

        if (!createResponse.ok || !createData?.success) {
          throw new Error(
            createData?.error || `Could not create your order (HTTP ${createResponse.status})`
          )
        }

        currentOrderId = createData.orderId as string
        setOrderId(currentOrderId)
        trackOrderCreated(currentOrderId, selected.name, selected.price, paymentSelected.name)
      }

      // ---- 2. Upload the payment proof --------------------------------
      //
      // Browser -> signed URL -> Supabase Storage -> server finalize.
      // The File never crosses a Server Action boundary (the cause of the
      // "Only plain objects... can be passed to Server Actions" error) and
      // never passes through a Vercel serverless request body.
      if (!paymentFile) {
        throw new Error('Please select your payment proof file before submitting.')
      }

      await uploadPaymentProofDirect({
        orderId: currentOrderId,
        file: paymentFile,
        fullName,
        getToken: getAccessToken,
        onStage: setSubmitStage,
        onProgress: setUploadProgress,
      })

      // Only now is the order genuinely complete.
      toast.success('Order submitted and payment proof attached.')
      setSubmitStage('')
      setUploadProgress(0)
      setTimeout(() => handleNext(), 800)
    } catch (error: any) {
      const message = error?.message || 'Failed to submit order. Please try again.'
      console.error('[checkout] Order submission failed:', error)

      // Deliberately: no step advance, no file clearing, no orderId reset.
      setSubmitError(message)
      setSubmitStage('')
      setUploadProgress(0)
      toast.error(message, { duration: 9000 })
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
              {bots.map((bot) => (
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
              {methods.map((method) => (
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

            {/* Real failure detail - shown instead of silently continuing */}
            {submitError && (
              <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-5">
                <p className="text-red-400 font-semibold mb-1">Your order was not completed</p>
                <p className="text-sm text-red-300/90 break-words">{submitError}</p>
                {orderId && (
                  <p className="text-xs text-slate-300 mt-3">
                    Your order has already been created (ID{' '}
                    <span className="font-mono text-slate-200">{orderId}</span>). Pressing Submit
                    again will attach the payment proof to that same order — it will
                    <strong> not</strong> create a duplicate order.
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Nothing was cleared. Your details and selected file have been kept.
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? `${submitStage || 'Submitting'}...`
                  : submitError
                  ? orderId
                    ? 'Retry Payment Proof Upload'
                    : 'Try Again'
                  : 'Submit Order'}
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
