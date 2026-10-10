import type { MetadataRoute } from 'next'

/**
 * PWA manifest - makes PrimeBot Markets installable ("Add to Home Screen")
 * while the exact same deployment keeps running as the website.
 * Next.js serves this at /manifest.webmanifest and links it automatically.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PrimeBot Markets',
    short_name: 'PrimeBot',
    description:
      'PrimeBot Markets - Smart Trading. Powered by Automation. Automated Trading Expert Advisors with Lifetime Licenses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
