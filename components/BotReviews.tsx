import { getApprovedReviews } from '@/lib/reviews-server'
import type { ReviewSummary } from '@/lib/reviews-server'
import ReviewStars from './ReviewStars'
import ReviewForm from './ReviewForm'

/**
 * Public per-bot reviews section: average rating + approved reviews +
 * submission form. Only APPROVED reviews are ever read from the database.
 */
export default async function BotReviews({
  botId,
  botName,
  summary,
}: {
  botId: string
  botName: string
  summary?: ReviewSummary
}) {
  const reviews = await getApprovedReviews(botId)
  const average = summary?.average ?? 0
  const count = summary?.count ?? 0

  return (
    <section className="mt-8 bg-slate-800/40 border border-slate-700 rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-xl font-bold text-white">
          Buyer <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Reviews</span>
        </h3>
        {count > 0 ? (
          <ReviewStars average={average} count={count} />
        ) : (
          <span className="text-slate-500 text-sm">No reviews yet - be the first!</span>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="space-y-4 mb-6">
          {reviews.map((review) => (
            <article key={review.id} className="bg-slate-800/70 border border-slate-700 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-white font-semibold text-sm">{review.reviewer_name}</span>
                <ReviewStars average={review.rating} size="sm" />
                {review.is_verified_purchase && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/15 text-green-400 border border-green-500/30">
                    Verified purchase
                  </span>
                )}
                <span className="text-slate-500 text-xs ml-auto">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{review.review_text}</p>
            </article>
          ))}
        </div>
      )}

      <ReviewForm botId={botId} botName={botName} />
    </section>
  )
}
