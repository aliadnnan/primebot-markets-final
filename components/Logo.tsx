import Link from 'next/link'

/**
 * PrimeBot Markets logo: gold "P" monogram in a dark rounded tile with a gold
 * ring, plus the "PrimeBot / MARKETS" wordmark. Used in the header and on the
 * login page; the same gold-on-dark monogram ships as the PWA app icon
 * (public/icons/*, generated from this design).
 */
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0" aria-label="PrimeBot Markets - home">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="PrimeBot Markets logo"
        className="drop-shadow-[0_0_12px_rgba(245,197,66,0.35)]"
      >
        <defs>
          <linearGradient id="pbm-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7d774" />
            <stop offset="55%" stopColor="#f5c542" />
            <stop offset="100%" stopColor="#c8961e" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="11" fill="#0a0f1e" stroke="url(#pbm-gold)" strokeWidth="2" />
        <text
          x="24"
          y="33"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="url(#pbm-gold)"
        >
          P
        </text>
      </svg>
      <span className="leading-none">
        <span className="block whitespace-nowrap text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
          PrimeBot
        </span>
        <span className="block whitespace-nowrap text-[9px] sm:text-[10px] font-bold tracking-[0.35em] text-amber-500/90 mt-0.5">
          MARKETS
        </span>
      </span>
    </Link>
  )
}
