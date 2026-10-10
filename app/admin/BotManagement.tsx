'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'

interface BotRow {
  id: string
  name: string
  type: string
  price: number
  description?: string | null
  features?: string[] | null
  is_active?: boolean
  available_for_purchase?: boolean
  display_order?: number
  delivery_file_name?: string | null
  delivery_file_path?: string | null
}

const emptyBot = {
  id: '',
  name: '',
  type: '',
  price: '',
  description: '',
  features: '',
}

export default function BotManagement() {
  const { getAccessToken } = useAuth()
  const [bots, setBots] = useState<BotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newBot, setNewBot] = useState({ ...emptyBot })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ ...emptyBot })

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
      const response = await adminFetch('/api/admin/bots')
      const data = await response.json().catch(() => null)
      if (response.ok && data?.success) {
        setBots(data.bots || [])
        if (data.warning) setWarning(data.warning)
      } else {
        setLoadError(data?.error || `Could not load bots (HTTP ${response.status})`)
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load bots')
    } finally {
      setLoading(false)
    }
  }, [adminFetch])

  useEffect(() => {
    load()
  }, [load])

  const parseFeatures = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

  const handleCreate = async () => {
    if (!newBot.id || !newBot.name || !newBot.type || !newBot.price) {
      toast.error('ID, name, type and price are required')
      return
    }
    setSaving(true)
    try {
      const response = await adminFetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBot,
          price: Number(newBot.price),
          features: parseFeatures(newBot.features),
        }),
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success('Bot created')
        setNewBot({ ...emptyBot })
        setShowAdd(false)
        load()
      } else {
        toast.error(data?.error || 'Could not create the bot')
      }
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (bot: BotRow) => {
    setEditingId(bot.id)
    setEditValues({
      id: bot.id,
      name: bot.name,
      type: bot.type,
      price: String(bot.price),
      description: bot.description || '',
      features: (bot.features || []).join('\n'),
    })
  }

  const handleUpdate = async (botId: string) => {
    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/bots/${botId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValues.name,
          type: editValues.type,
          price: Number(editValues.price),
          description: editValues.description,
          features: parseFeatures(editValues.features),
        }),
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success('Bot updated. Existing orders keep their original price.')
        setEditingId(null)
        load()
      } else {
        toast.error(data?.error || 'Could not update the bot')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (bot: BotRow, field: 'is_active' | 'available_for_purchase') => {
    const next = field === 'is_active' ? bot.is_active === false : bot.available_for_purchase === false
    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/bots/${bot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: next }),
      })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success(
          field === 'is_active'
            ? next
              ? 'Bot shown on the website'
              : 'Bot hidden from the website'
            : next
            ? 'Bot available for purchase'
            : 'Bot closed for purchase'
        )
        load()
      } else {
        toast.error(data?.error || 'Could not update the bot')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bot: BotRow) => {
    if (!confirm(`Delete "${bot.name}"? Disabling is usually safer.`)) return
    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/bots/${bot.id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => null)
      if (data?.success) {
        toast.success('Bot deleted')
        load()
      } else {
        toast.error(data?.error || 'Could not delete the bot', { duration: 9000 })
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
          <h2 className="text-2xl font-bold text-white">Bot Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Prices here are authoritative — checkout always charges the price stored in the database.
            Existing orders keep the name and price they were placed at.
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
            {showAdd ? 'Close' : '+ Add Bot'}
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
          <h3 className="text-lg font-semibold text-white">Add New Bot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="ID (lowercase, e.g. gold-scalper)"
              value={newBot.id}
              onChange={(e) => setNewBot({ ...newBot, id: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Name (e.g. PRIME GOLD EA)"
              value={newBot.name}
              onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Type (e.g. Scalping Trading EA)"
              value={newBot.type}
              onChange={(e) => setNewBot({ ...newBot, type: e.target.value })}
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Price (USD)"
              value={newBot.price}
              onChange={(e) => setNewBot({ ...newBot, price: e.target.value })}
            />
          </div>
          <textarea
            className={inputClass}
            rows={2}
            placeholder="Description"
            value={newBot.description}
            onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
          />
          <textarea
            className={inputClass}
            rows={4}
            placeholder="Features — one per line"
            value={newBot.features}
            onChange={(e) => setNewBot({ ...newBot, features: e.target.value })}
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Create Bot'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-center py-12">Loading bots...</p>
      ) : loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-1">Could not load bots</p>
          <p className="text-sm text-red-300/90 mb-4 break-words">{loadError}</p>
          <button
            onClick={load}
            className="px-4 py-2 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/10 transition text-sm"
          >
            Try again
          </button>
        </div>
      ) : bots.length === 0 ? (
        <p className="text-slate-400 text-center py-12">No bots found in the database.</p>
      ) : (
        <div className="space-y-3">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
            >
              {editingId === bot.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      className={inputClass}
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editValues.type}
                      onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      type="number"
                      value={editValues.price}
                      onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                    />
                  </div>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  />
                  <textarea
                    className={inputClass}
                    rows={5}
                    value={editValues.features}
                    onChange={(e) => setEditValues({ ...editValues, features: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(bot.id)}
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
                      <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                      <span className="text-green-400 font-semibold">${bot.price}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          bot.is_active === false
                            ? 'bg-slate-500/20 text-slate-300'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {bot.is_active === false ? 'Hidden' : 'Visible'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          bot.available_for_purchase === false
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {bot.available_for_purchase === false ? 'Not purchasable' : 'Purchasable'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{bot.type}</p>
                    {bot.description && (
                      <p className="text-xs text-slate-500 mt-1">{bot.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      ID: <span className="font-mono">{bot.id}</span> ·{' '}
                      {(bot.features || []).length} feature(s)
                    </p>
                    {/* Per-bot delivery file: attached ONCE per bot, emailed
                        automatically to every verified buyer. */}
                    <BotDeliveryFile bot={bot} onAttached={load} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => startEdit(bot)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggle(bot, 'is_active')}
                      disabled={saving}
                      className="text-slate-300 hover:text-white disabled:opacity-50 text-sm font-medium"
                    >
                      {bot.is_active === false ? 'Show' : 'Hide'}
                    </button>
                    <button
                      onClick={() => toggle(bot, 'available_for_purchase')}
                      disabled={saving}
                      className="text-green-400 hover:text-green-300 disabled:opacity-50 text-sm font-medium"
                    >
                      {bot.available_for_purchase === false ? 'Open sales' : 'Close sales'}
                    </button>
                    <button
                      onClick={() => handleDelete(bot)}
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

/**
 * Per-bot delivery file attach: the EA file the admin attaches ONCE per bot.
 * When a buyer's payment is verified, the server emails them this file
 * automatically (7-day signed link) - no per-order admin attach needed.
 */
function BotDeliveryFile({
  bot,
  onAttached,
}: {
  bot: BotRow
  onAttached: () => void
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-slate-500">Delivery file:</span>
      {bot.delivery_file_name ? (
        <span className="text-green-400 font-medium truncate max-w-[220px]" title={bot.delivery_file_path || undefined}>
          ✓ {bot.delivery_file_name}
        </span>
      ) : (
        <span className="text-amber-400/90">not attached - verified buyers get no auto email</span>
      )}
      <BotDeliveryFileInput botId={bot.id} onDone={onAttached} />
    </div>
  )
}

function BotDeliveryFileInput({ botId, onDone }: { botId: string; onDone: () => void }) {
  const { getAccessToken } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Admin session not found')
      const headers = { Authorization: `Bearer ${token}` }

      // 1. Signed upload URL from the server.
      const initRes = await fetch(`/api/admin/bots/${botId}/delivery-file`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      })
      const initData = await initRes.json().catch(() => null)
      if (!initRes.ok || !initData?.success) {
        throw new Error(initData?.error || `Could not start upload (HTTP ${initRes.status})`)
      }

      // 2. Upload the file direct to the private bucket.
      const putRes = await fetch(initData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!putRes.ok) throw new Error(`Upload failed (HTTP ${putRes.status})`)

      // 3. Record the path on the bot.
      const doneRes = await fetch(`/api/admin/bots/${botId}/delivery-file`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: initData.path, filename: file.name }),
      })
      const doneData = await doneRes.json().catch(() => null)
      if (!doneRes.ok || !doneData?.success) {
        throw new Error(doneData?.error || `Could not attach file (HTTP ${doneRes.status})`)
      }

      toast.success('Delivery file attached - verified buyers now get it by email automatically')
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <label className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium">
      {busy ? 'Uploading...' : 'Attach file'}
      <input
        type="file"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void handleFile(f)
        }}
      />
      {error && <span className="text-red-400 ml-2">{error}</span>}
    </label>
  )
}
