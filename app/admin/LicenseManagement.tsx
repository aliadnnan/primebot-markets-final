'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'

interface LicenseRow {
  id: string
  license_key: string
  mt5_account: string
  bot_name: string | null
  buyer_email: string | null
  buyer_name: string | null
  status: 'active' | 'disabled'
  expires_at: string | null
  notes: string | null
  created_at: string
}

function randomKey(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chars = Array.from({ length: 18 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('')
  return `PB-${chars.slice(0, 6)}-${chars.slice(6, 12)}-${chars.slice(12, 18)}`
}

function isExpired(row: LicenseRow): boolean {
  return Boolean(row.expires_at && new Date(row.expires_at).getTime() <= Date.now())
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Lifetime'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Admin license control (owner order 2026-10-26): one row per sold EA
 * license - MT5 account + key. The EA checks /api/license/check itself;
 * toggling or extending here reaches it on its next check, with no new
 * EA file to send. Requires sql/14_licenses.sql in Supabase.
 */
export default function LicenseManagement() {
  const { getAccessToken } = useAuth()
  const [licenses, setLicenses] = useState<LicenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    mt5_account: '',
    license_key: '',
    bot_name: '',
    buyer_name: '',
    buyer_email: '',
    expiry_date: '',
    lifetime: true,
    notes: '',
  })

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
    setLoading(true)
    setLoadError(null)
    try {
      const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
      const res = await adminFetch(`/api/admin/licenses${qs}`)
      const data = await res.json().catch(() => null)
      if (res.ok && data?.success) {
        setLicenses(data.licenses || [])
      } else {
        setLoadError(data?.error || `Could not load licenses (HTTP ${res.status})`)
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load licenses')
    } finally {
      setLoading(false)
    }
  }, [adminFetch, search])

  useEffect(() => {
    load()
  }, [load])

  async function createLicense(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await adminFetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5_account: form.mt5_account,
          license_key: form.license_key || undefined,
          bot_name: form.bot_name || undefined,
          buyer_name: form.buyer_name || undefined,
          buyer_email: form.buyer_email || undefined,
          expires_at: form.lifetime ? null : form.expiry_date || null,
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Create failed (HTTP ${res.status})`)
      }
      toast.success(`License created: ${data.license.license_key}`)
      setForm({
        mt5_account: '',
        license_key: '',
        bot_name: '',
        buyer_name: '',
        buyer_email: '',
        expiry_date: '',
        lifetime: true,
        notes: '',
      })
      load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  async function act(id: string, action: string, extra: Record<string, unknown> = {}) {
    setActing(id)
    try {
      const res = await adminFetch(`/api/admin/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Action failed (HTTP ${res.status})`)
      }
      toast.success(data.message || 'Done')
      setLicenses((prev) => prev.map((r) => (r.id === id ? data.license : r)))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setActing(null)
    }
  }

  async function remove(id: string, row: LicenseRow) {
    if (!window.confirm(`Delete the license for account ${row.mt5_account} (${row.license_key})? The EA will stop on its next check.`)) {
      return
    }
    setActing(id)
    try {
      const res = await adminFetch(`/api/admin/licenses/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Delete failed (HTTP ${res.status})`)
      }
      toast.success('License deleted')
      setLicenses((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setActing(null)
    }
  }

  const inputCls =
    'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60'
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1'

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">EA Licenses</h2>
        <p className="text-sm text-slate-500">
          The EA checks its license online - disable or extend here and it applies on the next check.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={createLicense}
        className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-8"
      >
        <h3 className="text-white font-semibold mb-4">Create license</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>MT5 account number *</label>
            <input
              className={inputCls}
              value={form.mt5_account}
              onChange={(e) => setForm({ ...form, mt5_account: e.target.value })}
              placeholder="e.g. 12345678"
              required
            />
          </div>
          <div>
            <label className={labelCls}>License key</label>
            <div className="flex gap-2">
              <input
                className={`${inputCls} font-mono`}
                value={form.license_key}
                onChange={(e) => setForm({ ...form, license_key: e.target.value })}
                placeholder="Auto-generated"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, license_key: randomKey() })}
                className="shrink-0 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition"
              >
                Generate
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Bot / product</label>
            <input
              className={inputCls}
              value={form.bot_name}
              onChange={(e) => setForm({ ...form, bot_name: e.target.value })}
              placeholder="e.g. PRIME ELITE EA"
            />
          </div>
          <div>
            <label className={labelCls}>Buyer name</label>
            <input
              className={inputCls}
              value={form.buyer_name}
              onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Buyer email</label>
            <input
              type="email"
              className={inputCls}
              value={form.buyer_email}
              onChange={(e) => setForm({ ...form, buyer_email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Expiry</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.lifetime}
                  onChange={(e) => setForm({ ...form, lifetime: e.target.checked })}
                  className="accent-amber-500"
                />
                Lifetime
              </label>
              {!form.lifetime && (
                <input
                  type="date"
                  className={inputCls}
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  required
                />
              )}
            </div>
          </div>
          <div className="md:col-span-3">
            <label className={labelCls}>Notes</label>
            <input
              className={inputCls}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional - order id, payment reference, anything"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition"
        >
          {creating ? 'Creating...' : 'Create license'}
        </button>
      </form>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          className={inputCls}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by account, key, bot, buyer email or name..."
        />
        <button
          onClick={load}
          className="shrink-0 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-12">Loading licenses...</p>
      ) : loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-1">Could not load licenses</p>
          <p className="text-sm text-red-300/90 mb-4 break-words">{loadError}</p>
          <button
            onClick={load}
            className="px-4 py-2 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/10 transition text-sm"
          >
            Try again
          </button>
        </div>
      ) : licenses.length === 0 ? (
        <p className="text-slate-400 text-center py-12">
          No licenses yet. Create the first one above.
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-left text-slate-400">
                <th className="px-4 py-3 font-medium">MT5 Account</th>
                <th className="px-4 py-3 font-medium">License Key</th>
                <th className="px-4 py-3 font-medium">Bot</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((row) => {
                const expired = isExpired(row)
                const busy = acting === row.id
                return (
                  <tr key={row.id} className="border-t border-slate-800 text-slate-300">
                    <td className="px-4 py-3 font-mono">{row.mt5_account}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.license_key}
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(row.license_key)
                          toast.success('Key copied')
                        }}
                        className="ml-2 text-amber-400 hover:text-amber-300 text-xs"
                      >
                        Copy
                      </button>
                    </td>
                    <td className="px-4 py-3">{row.bot_name || '-'}</td>
                    <td className="px-4 py-3">
                      {row.buyer_name || '-'}
                      {row.buyer_email && (
                        <span className="block text-xs text-slate-500">{row.buyer_email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.status === 'disabled' ? (
                        <span className="px-2 py-1 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-medium">
                          Disabled
                        </span>
                      ) : expired ? (
                        <span className="px-2 py-1 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-medium">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(row.expires_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.status === 'active' ? (
                          <button
                            disabled={busy}
                            onClick={() => act(row.id, 'deactivate')}
                            className="px-2.5 py-1 rounded bg-red-500/15 border border-red-500/40 text-red-300 text-xs hover:bg-red-500/25 disabled:opacity-50 transition"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() => act(row.id, 'activate')}
                            className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-500/25 disabled:opacity-50 transition"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          disabled={busy}
                          onClick={() => act(row.id, 'extend', { days: 30 })}
                          className="px-2.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-300 text-xs hover:bg-slate-700 disabled:opacity-50 transition"
                        >
                          +30 days
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => act(row.id, 'set_lifetime')}
                          className="px-2.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-300 text-xs hover:bg-slate-700 disabled:opacity-50 transition"
                        >
                          Lifetime
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => remove(row.id, row)}
                          className="px-2.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-400 text-xs hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
