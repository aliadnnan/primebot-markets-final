'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'
import ReviewStars from '@/components/ReviewStars'

interface ReviewRow {
  id: string
  bot_id: string
  reviewer_name: string
  rating: number
  review_text: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
}

/**
 * Admin review moderation: pending reviews are approved or rejected here.
 * Only approved reviews ever appear on the public site.
 */
export default function ReviewManagement() {
  const { getAccessToken } = useAuth()
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

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
      const res = await adminFetch(`/api/admin/reviews?status=${filter}`)
      const data = await res.json().catch(() => null)
      if (res.ok && data?.success) {
        setReviews(data.reviews || [])
      } else {
        setLoadError(data?.error || `Could not load reviews (HTTP ${res.status})`)
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load reviews')
    } finally {
      setLoading(false)
    }
  }, [adminFetch, filter])

  useEffect(() => {
    load()
  }, [load])

  async function moderate(id: string, action: 'approve' | 'reject') {
    setActing(id)
    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Action failed (HTTP ${res.status})`)
      }
      toast.success(data.message || (action === 'approve' ? 'Review approved' : 'Review rejected'))
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setActing(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Buyer Reviews</h2>
        <div className="flex gap-2 ml-auto">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-12">Loading reviews...</p>
      ) : loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-1">Could not load reviews</p>
          <p className="text-sm text-red-300/90 mb-4 break-words">{loadError}</p>
          <button
            onClick={load}
            className="px-4 py-2 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/10 transition text-sm"
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-400 text-center py-12">
          {filter === 'pending' ? 'No reviews waiting for approval.' : 'No reviews found.'}
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-white font-semibold text-sm">{review.reviewer_name}</span>
                <ReviewStars average={review.rating} size="sm" />
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-400">
                  {review.bot_id}
                </span>
                {review.is_verified_purchase && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/15 text-green-400 border border-green-500/30">
                    Verified purchase
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    review.is_approved
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {review.is_approved ? 'Public' : 'Pending'}
                </span>
                <span className="text-slate-500 text-xs ml-auto">
                  {new Date(review.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap mb-3">{review.review_text}</p>
              {!review.is_approved && (
                <div className="flex gap-2">
                  <button
                    onClick={() => moderate(review.id, 'approve')}
                    disabled={acting === review.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-1.5 px-4 rounded-lg"
                  >
                    {acting === review.id ? 'Working...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => moderate(review.id, 'reject')}
                    disabled={acting === review.id}
                    className="bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold py-1.5 px-4 rounded-lg"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
