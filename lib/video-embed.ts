/**
 * Shared video playback helpers.
 *
 * Extracted from app/video-tutorials/page.tsx so the Bots page (per-bot
 * videos, components/BotVideo.tsx) embeds and plays a video in exactly the
 * same way as the Video Tutorials page. Keep the provider handling here, not
 * in individual pages.
 */

export function getEmbedUrl(url: string, autoplay = true) {
  // Autoplay is always paired with mute=1: every current desktop and mobile
  // browser blocks autoplay with sound, and a blocked play() leaves the player
  // in a broken state.
  const flags = autoplay ? 'autoplay=1&mute=1&playsinline=1' : 'autoplay=0&playsinline=1'
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}?${flags}`
      const parts = parsed.pathname.split('/').filter(Boolean)
      const embedIndex = parts.indexOf('embed')
      if (embedIndex >= 0 && parts[embedIndex + 1]) return `https://www.youtube.com/embed/${parts[embedIndex + 1]}?${flags}`
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      if (id) return `https://www.youtube.com/embed/${id}?${flags}`
    }
    if (host.endsWith('tiktok.com')) {
      const match = parsed.pathname.match(/\/video\/(\d+)/)
      if (match?.[1]) return `https://www.tiktok.com/embed/v2/${match[1]}`
    }
    if (host.endsWith('facebook.com') || host === 'fb.watch') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=${autoplay ? 1 : 0}&mute=1`
    }
  } catch {
    // Fall back to the original URL for already-embedded or direct URLs.
  }
  return url
}

export function isDirectVideo(url: string) {
  const clean = url.split('?')[0].toLowerCase()
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.includes('/storage/v1/object/')
}
