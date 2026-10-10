'use client'

import { getEmbedUrl, isDirectVideo } from '@/lib/video-embed'
import type { BotVideo as BotVideoData } from '@/lib/bots-server'

interface BotVideoProps {
  /** Bot display name, e.g. "PRIME QUANTUM EA". */
  botName: string
  video: BotVideoData
}

/**
 * The per-bot video slot on the Bots page: plays the newest published, public
 * video the admin assigned to this bot (videos.bot_id, sql/10_bot_videos.sql)
 * — for the PrimeBot tiers that is the bot's Urdu explainer video.
 *
 * Rendered only when such a video exists; a bot without one shows no player
 * at all. Playback uses the same embed/direct rules as the Video Tutorials
 * page (lib/video-embed.ts), with no autoplay — the visitor presses play.
 */
export default function BotVideo({ botName, video }: BotVideoProps) {
  const direct = isDirectVideo(video.video_url)

  return (
    <div className="mt-6 bg-slate-800 border border-amber-500/30 rounded-xl overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-slate-950">
          ▶ WATCH
        </span>
        <p className="text-sm font-semibold text-white">
          {botName} — video guide
        </p>
      </div>

      <div className="relative w-full aspect-video bg-black">
        {direct ? (
          <video
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={getEmbedUrl(video.video_url, false)}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={video.title}
          />
        )}
      </div>

      <div className="px-5 py-4">
        <h3 className="text-base font-semibold text-white mb-1">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-slate-400 line-clamp-3">{video.description}</p>
        )}
      </div>
    </div>
  )
}
