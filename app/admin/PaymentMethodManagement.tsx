'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'

interface MethodRow {
  id: string
  name: string
  description?: string | null
  account_number: string
  account_type: string
  instructions?: string | null
  account_holder_name?: string | null
  qr_code_url?: string | null
  is_active?: boolean
  display_order?: number
}

const emptyMethod = {
  id: '',
  name: '',
  description: '',
  account_number: '',
  account_type: '',
  instructions: '',
  account_holder_name: '',
  qr_code_url: '',
}

export default function PaymentMethodManagement() {
  const { getAccessToken } = useAuth()
  const [methods, setMethods] = useState<MethodRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newMethod, setNewMethod] = useState({ ...emptyMethod })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ ...emptyMethod })

  const adminFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token = await getAccessToken()
      if (!token) throw new Error('Admin session not found')
      const headers = new Headers(init.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return fetch(input, { ...init, headers })
    },
    [getAccessToken]
  )

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      setWarning(null)
      const response = await adminFetch('/api/admin/payment-methods')
      const data = await response.json().catch(() => null)
      if (response.ok && data?.success) {
        setMethods(data.methods || [])
        if (data.warning) setWarning(data.warning)
      } else {
        setLoadError(data?.error || `Could not load payment methods (HTTP ${response.status})`)
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load payment methods')
    } finally {
      setLoading(false)
    }
  }, [adminFetch])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!newMethod.id || !newMethod.name || !newMethod.account_number || !newMethod.account_type) {
      toast.error('ID, name, account number and account type are required')
      return
    }
    setSaving(true)
    try {
      const response = await adminFetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMethod),
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success('Payment method created')
        setNewMethod({ ...emptyMethod })
        setShowAdd(false)
        load()
      } else {
        toast.error(data?.error || 'Could not create the payment method')
      }
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (method: MethodRow) => {
    setEditingId(method.id)
    setEditValues({
      id: method.id,
      name: method.name,
      description: method.description || '',
      account_number: method.account_number,
      account_type: method.account_type,
      instructions: method.instructions || '',
      account_holder_name: method.account_holder_name || '',
      qr_code_url: method.qr_code_url || '',
    })
  }

  const handleUpdate = async (id: string) => {
    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/payment-methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValues.name,
          description: editValues.description,
          account_number: editValues.account_number,
          account_type: editValues.account_type,
          instructions: editValues.instructions,
          account_holder_name: editValues.account_holder_name,
          qr_code_url: editValues.qr_code_url,
        }),
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success('Payment method updated')
        setEditingId(null)
        load()
      } else {
        toast.error(data?.error || 'Could not update the payment method')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (method: MethodRow) => {
    const next = method.is_active === false
    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success(next ? 'Payment method enabled' : 'Payment method disabled')
        load()
      } else {
        toast.error(data?.error || 'Could not update the payment method')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (method: MethodRow) => {
    if (!confirm(`Delete "${method.name}"? Disabling is usually safer.`)) return
    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success('Payment method deleted')
        load()
      } else {
        toast.error(data?.error || 'Could not delete the payment method')
      }
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm'

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
          <p className="text-sm text-slate-400 mt-1">
            Only enabled methods appear at checkout. Account numbers shown here are the ones
            customers will pay to.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showAdd ? 'Close' : '+ Add Method'}
          </button>
        </div>
      </div>

      {warning && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-300/90">{warning}</p>
        </div>
      )}

      {showAdd && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-5 mb-8 space-y-3">
          <h3 className="text-lg font-semibold text-white">Add Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="ID (lowercase, e.g. sadapay)"
              value={newMethod.id}
              onChange={(e) => setNewMethod({ ...newMethod, id: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Name (e.g. SadaPay)"
              value={newMethod.name}
              onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Account number / ID"
              value={newMethod.account_number}
              onChange={(e) => setNewMethod({ ...newMethod, account_number: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Label for the number (e.g. Phone Number, Binance Pay ID, Bybit UID)"
              value={newMethod.account_type}
              onChange={(e) => setNewMethod({ ...newMethod, account_type: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Account holder name"
              value={newMethod.account_holder_name}
              onChange={(e) =>
                setNewMethod({ ...newMethod, account_holder_name: e.target.value })
              }
            />
            <input
              className={inputClass}
              placeholder="QR code image URL (optional, must be publicly loadable)"
              value={newMethod.qr_code_url}
              onChange={(e) => setNewMethod({ ...newMethod, qr_code_url: e.target.value })}
            />
          </div>
          <input
            className={inputClass}
            placeholder="Short description"
            value={newMethod.description}
            onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
          />
          <textarea
            className={inputClass}
            rows={2}
            placeholder="Payment instructions shown to the customer"
            value={newMethod.instructions}
            onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Create Method'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-center py-12">Loading payment methods...</p>
      ) : loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-1">Could not load payment methods</p>
          <p className="text-sm text-red-300/90 mb-4 break-words">{loadError}</p>
          <button
            onClick={load}
            className="px-4 py-2 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/10 transition text-sm"
          >
            Try again
          </button>
        </div>
      ) : methods.length === 0 ? (
        <p className="text-slate-400 text-center py-12">No payment methods found.</p>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
            >
              {editingId === method.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className={inputClass}
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editValues.account_number}
                      onChange={(e) =>
                        setEditValues({ ...editValues, account_number: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      value={editValues.account_type}
                      onChange={(e) =>
                        setEditValues({ ...editValues, account_type: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      value={editValues.description}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="Account holder name"
                      value={editValues.account_holder_name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, account_holder_name: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="QR code image URL (optional)"
                      value={editValues.qr_code_url}
                      onChange={(e) => setEditValues({ ...editValues, qr_code_url: e.target.value })}
                    />
                  </div>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={editValues.instructions}
                    onChange={(e) => setEditValues({ ...editValues, instructions: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(method.id)}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{method.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          method.is_active === false
                            ? 'bg-slate-500/20 text-slate-300'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {method.is_active === false ? 'Disabled' : 'Enabled'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 font-mono break-all">
                      {method.account_number || (
                        <span className="text-red-400 font-sans">No account number set</span>
                      )}
                    </p>
                    {method.account_holder_name ? (
                      <p className="text-xs text-slate-400 mt-1">
                        Holder: {method.account_holder_name}
                      </p>
                    ) : (
                      <p className="text-xs text-yellow-400 mt-1">
                        No account holder name set — customers will not see who to pay
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {method.account_type} · ID <span className="font-mono">{method.id}</span>
                      {method.qr_code_url ? ' · QR code set' : ''}
                    </p>
                    {method.instructions && (
                      <p className="text-xs text-slate-500 mt-1">{method.instructions}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => startEdit(method)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(method)}
                      disabled={saving}
                      className="text-slate-300 hover:text-white disabled:opacity-50 text-sm font-medium"
                    >
                      {method.is_active === false ? 'Enable' : 'Disable'}
                    </button>
                    <button
                      onClick={() => handleDelete(method)}
                      disabled={saving}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
