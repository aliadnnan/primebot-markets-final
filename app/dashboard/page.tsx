'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface Order {
  id: string
  bot_name: string
  bot_price: number
  payment_method: string
  transaction_id: string
  status: 'pending_verification' | 'verified' | 'rejected' | 'delivered'
  rejection_reason?: string
  created_at: string
  updated_at: string
  payment_proof_url?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      if (data.success) {
        setOrders(data.orders || [])
      } else {
        toast.error(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'verified':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'Pending Verification'
      case 'verified':
        return 'Payment Verified'
      case 'delivered':
        return 'Delivered'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-slate-400">Track your trading bot purchases and payment status</p>
          </div>
          <Link href="/payment" className="btn-primary">
            Buy New Bot
          </Link>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Orders Yet</h2>
            <p className="text-slate-400 mb-8">You haven't purchased any trading bots yet.</p>
            <Link href="/payment" className="btn-primary inline-block">
              Purchase Your First Bot
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{order.bot_name}</h3>
                    <p className="text-slate-400 text-sm">Order ID: {order.id}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-slate-500 text-xs">Amount</p>
                    <p className="text-white font-semibold">${order.bot_price}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Payment Method</p>
                    <p className="text-white font-semibold">{order.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Date</p>
                    <p className="text-white font-semibold">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs">Click to view details</p>
              </button>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Order Information</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="text-white font-mono text-sm">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Product:</span>
                      <span className="text-white font-semibold">{selectedOrder.bot_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price:</span>
                      <span className="text-white font-semibold">${selectedOrder.bot_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-white">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Payment Information</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Method:</span>
                      <span className="text-white font-semibold">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="text-white font-mono text-sm">{selectedOrder.transaction_id}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Status:</span>
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Rejection Reason</h3>
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400">{selectedOrder.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {selectedOrder.status === 'pending_verification' && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      ℹ️ Your payment is being verified. You'll receive an email once it's been reviewed.
                      This usually takes up to 24 hours.
                    </p>
                  </div>
                )}

                {selectedOrder.status === 'verified' && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm">
                      ✓ Your payment has been verified! Check your email for download instructions.
                    </p>
                  </div>
                )}

                {selectedOrder.status === 'delivered' && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm">
                      ✓ Order complete! Your trading bot is ready to use. Check your email for setup instructions.
                    </p>
                  </div>
                )}

                {selectedOrder.status === 'rejected' && (
                  <div className="flex gap-4">
                    <Link href="/payment" className="flex-1 btn-primary text-center">
                      Place New Order
                    </Link>
                    <Link href="/support" className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition text-center">
                      Contact Support
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
