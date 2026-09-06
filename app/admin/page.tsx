'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import VideoManagement from './VideoManagement'
import CategoryManagement from './CategoryManagement'

interface AdminOrder {
  id: string
  user_id: string
  bot_name: string
  bot_price: number
  payment_method: string
  transaction_id: string
  payment_proof_url?: string
  status: 'pending_verification' | 'verified' | 'rejected' | 'delivered'
  rejection_reason?: string
  created_at: string
  updated_at: string
  users?: {
    id: string
    email: string
    full_name: string
  }
}

interface AdminStats {
  total: number
  pending: number
  verified: number
  rejected: number
  delivered: number
  totalRevenue?: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    delivered: 0,
  })
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  // Check admin access and load orders
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (!isAdmin) {
        toast.error('You do not have admin access')
        router.push('/')
        return
      }

      loadOrders()
      loadStats()
    }
  }, [user, authLoading, isAdmin])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders', {
        method: 'GET',
      })

      const data = await response.json()
      if (data.success) {
        setOrders(data.orders || [])
      } else {
        toast.error(data.error || 'Failed to load orders')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof order.users === 'object' && order.users && 'email' in order.users
        ? order.users.email.toLowerCase().includes(searchTerm.toLowerCase())
        : '') ||
      (typeof order.users === 'object' && order.users && 'full_name' in order.users
        ? order.users.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        : '') ||
      order.bot_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleApprove = async (orderId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Order approved!')
        setSelectedOrder(null)
        loadOrders()
        loadStats()
      } else {
        toast.error(data.error || 'Failed to approve order')
      }
    } catch (error) {
      console.error('Error approving order:', error)
      toast.error('Failed to approve order')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (orderId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason: rejectionReason }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Order rejected!')
        setSelectedOrder(null)
        setShowRejectForm(false)
        setRejectionReason('')
        loadOrders()
        loadStats()
      } else {
        toast.error(data.error || 'Failed to reject order')
      }
    } catch (error) {
      console.error('Error rejecting order:', error)
      toast.error('Failed to reject order')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkDelivered = async (orderId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/mark-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Order marked as delivered!')
        setSelectedOrder(null)
        loadOrders()
        loadStats()
      } else {
        toast.error(data.error || 'Failed to mark order as delivered')
      }
    } catch (error) {
      console.error('Error marking delivered:', error)
      toast.error('Failed to mark order as delivered')
    } finally {
      setActionLoading(false)
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
        return 'Verified'
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
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage customer orders and verify payments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Orders & Payments
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'videos'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Video Management
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Video Categories
          </button>
        </div>

        {/* Video Management Tab */}
        {activeTab === 'videos' && (
          <div>
            <VideoManagement />
          </div>
        )}

        {/* Categories Management Tab */}
        {activeTab === 'categories' && (
          <div>
            <CategoryManagement />
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm mb-1">Verified</p>
            <p className="text-3xl font-bold text-blue-400">{stats.verified}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 text-sm mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-400">{stats.delivered}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending_verification', 'verified', 'rejected', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {status === 'all' ? 'All Orders' : getStatusLabel(status)}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by Order ID, customer email, name, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order)
                  setShowRejectForm(false)
                  setRejectionReason('')
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{order.bot_name}</h3>
                    <p className="text-slate-400 text-sm">
                      {typeof order.users === 'object' && order.users && 'email' in order.users
                        ? `${order.users.full_name} (${order.users.email})`
                        : 'Unknown Customer'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Order ID</p>
                    <p className="text-white font-mono text-sm">{order.id.substring(0, 8)}</p>
                  </div>
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
                    <p className="text-white">{formatDate(order.created_at)}</p>
                  </div>
                </div>
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
              className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
                {/* Order & Customer Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Order Information</h3>
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Order ID:</span>
                        <span className="text-white font-mono">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Product:</span>
                        <span className="text-white">{selectedOrder.bot_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Amount:</span>
                        <span className="text-white">${selectedOrder.bot_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date:</span>
                        <span className="text-white">{formatDate(selectedOrder.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Customer Information</h3>
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="text-white">
                          {typeof selectedOrder.users === 'object' && selectedOrder.users && 'full_name' in selectedOrder.users
                            ? selectedOrder.users.full_name
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white text-xs">
                          {typeof selectedOrder.users === 'object' && selectedOrder.users && 'email' in selectedOrder.users
                            ? selectedOrder.users.email
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">User ID:</span>
                        <span className="text-white font-mono text-xs">{selectedOrder.user_id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Payment Information</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Method:</span>
                      <span className="text-white font-semibold">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="text-white font-mono text-sm">{selectedOrder.transaction_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Status:</span>
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedOrder.payment_proof_url && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Payment Proof</h3>
                    <a
                      href={selectedOrder.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 break-all text-sm"
                    >
                      View Screenshot
                    </a>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Rejection Reason</h3>
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 text-sm">{selectedOrder.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-slate-700 pt-6 space-y-4">
                  {selectedOrder.status === 'pending_verification' && (
                    <>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApprove(selectedOrder.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          {actionLoading ? 'Processing...' : '✓ Approve Payment'}
                        </button>
                        <button
                          onClick={() => setShowRejectForm(!showRejectForm)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          ✗ Reject Payment
                        </button>
                      </div>

                      {showRejectForm && (
                        <div className="space-y-2">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                            rows={3}
                          />
                          <button
                            onClick={() => handleReject(selectedOrder.id)}
                            disabled={actionLoading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                          >
                            {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {selectedOrder.status === 'verified' && (
                    <button
                      onClick={() => handleMarkDelivered(selectedOrder.id)}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {actionLoading ? 'Processing...' : '📦 Mark as Delivered'}
                    </button>
                  )}

                  {selectedOrder.status === 'delivered' && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                      <p className="text-green-400 font-semibold">✓ Order Delivered</p>
                    </div>
                  )}

                  {selectedOrder.status === 'rejected' && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                      <p className="text-red-400 font-semibold">✗ Order Rejected</p>
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
          </div>
        )}
            </div>
        )}
      </div>
    </div>
  )
}
