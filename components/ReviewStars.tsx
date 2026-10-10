/**
 * Gold star display for an average rating. Read-only.
 */
export default function ReviewStars({
  average,
  count,
  size = 'md',
}: {
  average: number
  count?: number
  size?: 'sm' | 'md'
}) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${average.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = average >= star - 0.25
        const half = !filled && average >= star - 0.75
        return (
          <svg
            key={star}
            className={cls}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`half-${size}-${star}`}>
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#475569" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
              fill={filled ? '#fbbf24' : half ? `url(#half-${size}-${star})` : '#475569'}
            />
          </svg>
        )
      })}
      {typeof count === 'number' && (
        <span className="text-slate-400 text-xs ml-1">
          {average.toFixed(1)} ({count} review{count === 1 ? '' : 's'})
        </span>
      )}
    </span>
  )
}
