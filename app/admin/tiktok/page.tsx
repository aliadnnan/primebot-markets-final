'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface ConnStatus {
  connected: boolean
  configured?: boolean
  open_id?: string
  scope?: string
  expires_at?: string
  error?: string
}

/**
 * /admin/tiktok — TikTok Login Kit + Content Posting API control page.
 *
 * 1. Connect: OAuth with the owner's TikTok account (Login Kit).
 * 2. Post: pick a video file, caption and mode; the page initializes the
 *    upload on the server, PUTs the bytes straight to TikTok (chunked, so
 *    big files never touch our serverless functions), then polls the
 *    publish status.
 *
 * Draft mode  -> video lands in the TikTok app's drafts (video.upload scope).
 * Direct mode -> publishes to the profile (needs video.publish scope +
 *                Direct Post enabled + TikTok audit approval).
 */
export default function TikTokAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-600">Loading…</div>}>
      <TikTokAdminInner />
    </Suspense>
  )
}

function TikTokAdminInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, isAdmin, getAccessToken } = useAuth()

  const [status, setStatus] = useState<ConnStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [privacy, setPrivacy] = useState('PUBLIC_TO_EVERYONE')
  const [mode, setMode] = useState<'draft' | 'direct'>('draft')
  const [progress, setProgress] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (searchParams.get('connected') === '1') {
      toast.success('TikTok connected!')
      router.replace('/admin/tiktok')
    }
    const err = searchParams.get('error')
    if (err) {
      toast.error(err)
      router.replace('/admin/tiktok')
    }
  }, [searchParams, router])

  const api = async (path: string, init?: RequestInit) => {
    const token = await getAccessToken()
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return res.json()
  }

  const loadStatus = async () => {
    setStatusLoading(true)
    try {
      const data = await api('/api/admin/tiktok/status')
      setStatus(data)
    } catch {
      setStatus({ connected: false, error: 'Status check failed' })
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && isAdmin) loadStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin])

  const handleConnect = async () => {
    setBusy(true)
    try {
      const data = await api('/api/admin/tiktok/auth-url')
      if (!data.success) {
        toast.error(data.error || 'Could not start TikTok login')
        return
      }
      window.location.href = data.url
    } finally {
      setBusy(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect the TikTok account?')) return
    setBusy(true)
    try {
      const data = await api('/api/admin/tiktok/disconnect', { method: 'POST' })
      if (data.success) {
        toast.success('Disconnected')
        loadStatus()
      } else {
        toast.error(data.error || 'Disconnect failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const pollStatus = async (publishId: string) => {
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      try {
        const data = await api('/api/admin/tiktok/post-status', {
          method: 'POST',
          body: JSON.stringify({ publish_id: publishId }),
        })
        const st = data?.status?.status || data?.status
        setProgress(`TikTok status: ${JSON.stringify(st)}`)
        const s = String(st).toUpperCase()
        if (s.includes('PUBLISHED') || s.includes('SUCCESS')) {
          setResult('Published on TikTok.')
          setProgress('')
          return
        }
        if (s.includes('FAIL')) {
          setResult(`TikTok reported failure: ${JSON.stringify(st)}`)
          setProgress('')
          return
        }
      } catch {
        /* keep polling */
      }
    }
    setResult('Still processing on TikTok — check the TikTok app drafts/profile.')
    setProgress('')
  }

  const handlePost = async () => {
    if (!file) {
      toast.error('Please choose a video file first')
      return
    }
    if (!caption.trim()) {
      toast.error('Caption is required')
      return
    }
    setBusy(true)
    setResult('')
    try {
      setProgress('Initializing upload with TikTok…')
      const init = await api('/api/admin/tiktok/post-init', {
        method: 'POST',
        body: JSON.stringify({
          title: caption.trim(),
          video_size: file.size,
          privacy_level: privacy,
          mode,
        }),
      })
      if (!init.success) {
        toast.error(init.error || 'Upload init failed')
        setProgress('')
        return
      }

      const { publish_id, upload_url, chunk_size, total_chunk_count } = init
      setProgress(`Uploading to TikTok (0/${total_chunk_count} chunks)…`)
      for (let i = 0; i < total_chunk_count; i++) {
        const start = i * chunk_size
        const end = Math.min(start + chunk_size, file.size)
        const chunk = file.slice(start, end)
        const put = await fetch(upload_url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'video/mp4',
            'Content-Length': String(chunk.size),
            'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
          },
          body: chunk,
        })
        if (!put.ok) {
          throw new Error(`Chunk ${i + 1} upload failed (HTTP ${put.status})`)
        }
        setProgress(`Uploading to TikTok (${i + 1}/${total_chunk_count} chunks)…`)
      }

      setProgress('Upload complete — waiting for TikTok to process…')
      await pollStatus(publish_id)
      toast.success(mode === 'direct' ? 'Sent to TikTok for publishing' : 'Sent to TikTok drafts')
    } catch (e: any) {
      setProgress('')
      setResult(e?.message || 'Upload failed')
      toast.error(e?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  if (authLoading) {
    return <div className="p-8 text-gray-600">Loading…</div>
  }
  if (!isAdmin) {
    return <div className="p-8 text-red-600">Admin access required.</div>
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">TikTok — Login &amp; Auto-Posting</h1>

      {/* Connection card */}
      <div className="rounded-lg border p-5 bg-white shadow-sm">
        <h2 className="font-semibold mb-3">Connection</h2>
        {statusLoading ? (
          <p className="text-gray-500">Checking…</p>
        ) : status?.connected ? (
          <div className="space-y-2">
            <p className="text-green-700 font-medium">Connected to TikTok</p>
            <p className="text-sm text-gray-600">Open ID: {status.open_id}</p>
            <p className="text-sm text-gray-600">Scopes: {status.scope}</p>
            <p className="text-sm text-gray-600">
              Token expires: {status.expires_at ? new Date(status.expires_at).toLocaleString() : '—'}
              {' '}(auto-refreshes)
            </p>
            <button
              onClick={handleDisconnect}
              disabled={busy}
              className="mt-2 rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              {status?.configured === false
                ? 'Server keys missing: set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Vercel project settings first.'
                : 'No TikTok account connected yet.'}
            </p>
            {status?.error && <p className="text-sm text-red-600">{status.error}</p>}
            <button
              onClick={handleConnect}
              disabled={busy || status?.configured === false}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {busy ? 'Starting…' : 'Connect with TikTok'}
            </button>
          </div>
        )}
      </div>

      {/* Post card */}
      <div className="rounded-lg border p-5 bg-white shadow-sm">
        <h2 className="font-semibold mb-3">Post a video</h2>
        {!status?.connected && (
          <p className="mb-3 text-sm text-amber-700">
            Connect a TikTok account above before posting.
          </p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video file</label>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {file && (
              <p className="mt-1 text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB — uploads straight to TikTok
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Caption (+ hashtags)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={2200}
              placeholder="Video title, caption and #hashtags…"
              className="w-full rounded border p-2 text-sm"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Privacy</label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="rounded border p-2 text-sm"
              >
                <option value="PUBLIC_TO_EVERYONE">Public</option>
                <option value="MUTUAL_FOLLOW_FRIENDS">Mutual followers</option>
                <option value="FOLLOWER_OF_CREATOR">Followers</option>
                <option value="SELF_ONLY">Only me</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'draft' | 'direct')}
                className="rounded border p-2 text-sm"
              >
                <option value="draft">Draft (review in TikTok app)</option>
                <option value="direct">Direct Post (publishes immediately)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePost}
            disabled={busy || !status?.connected}
            className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Send to TikTok'}
          </button>

          {progress && <p className="text-sm text-blue-700">{progress}</p>}
          {result && <p className="text-sm text-gray-800">{result}</p>}

          <p className="text-xs text-gray-500">
            Direct Post needs the <b>video.publish</b> scope, Direct Post enabled in the
            developer portal, and TikTok audit approval. Until approval lands, use Draft
            mode and publish from the TikTok app.
          </p>
        </div>
      </div>
    </div>
  )
}
