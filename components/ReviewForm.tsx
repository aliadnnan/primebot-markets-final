'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Public review submission form for one bot. New reviews go to moderation
 * (is_approved=FALSE) and only appear publicly after admin approval.
 */
export default function ReviewForm({ botId, botName }: { botId: string; botName: string }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [hovered, setHovered] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: botId, reviewer_name: name, rating, review_text: text }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Could not submit (HTTP ${res.status})`)
      }
      setDone(true)
      toast.success('Review submitted - it will appear after approval')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit your review')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-sm text-green-300">
        Thank you for reviewing {botName}! Your review will appear here after approval.
      </div>
    )
  }

  const inputClass =
    'w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm'

  return (
    <form onSubmit={submit} className="bg-slate-800/60 border border-slate-700 rounded-lg p-5 space-y-4">
      <h4 className="text-white font-semibold">Write a review for {botName}</h4>

      <div>
        <label className="block text-slate-400 text-xs mb-2">Your rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5"
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
            >
              <svg className="w-7 h-7" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
                  fill={(hovered || rating) >= star ? '#fbbf24' : '#475569'}
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <input
        className={inputClass}
        placeholder="Your name"
        value={name}
        maxLength={50}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        className={inputClass}
        rows={4}
        placeholder="How has this bot worked for you? (10-1000 characters)"
        value={text}
        maxLength={1000}
        onChange={(e) => setText(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-6 rounded-lg text-sm transition"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
      <p className="text-slate-500 text-xs">Reviews appear publicly after approval.</p>
    </form>
  )
}
