/**
 * Storage bucket IDs — SINGLE SOURCE OF TRUTH.
 *
 * These are the bucket IDs that already exist in the Supabase project. They are
 * case-sensitive and are NOT guesses: they were read back from the live project
 * by the Admin Panel's Run Diagnostics check.
 *
 *   video-content      (videos)
 *   video-thumbnils    (thumbnails)
 *
 * Note the second name is spelled "thumbnils", not "thumbnails". That is the
 * actual ID of the existing bucket, so it is what the code must use. Supabase
 * bucket IDs cannot be renamed in place, so the code matches the bucket rather
 * than the other way round.
 *
 * WHY THIS FILE EXISTS
 * Bucket IDs used to be hardcoded as string literals in six separate active
 * code paths (upload, thumbnail upload, admin listing signed URLs, public
 * playback signed URLs, video delete, and the diagnostics check). Changing the
 * bucket therefore meant finding and editing all six, and missing one produced a
 * failure in only part of the app. Every one of those call sites now imports
 * from here, so there is exactly one place to change.
 *
 * OVERRIDING WITHOUT A CODE CHANGE
 * Both IDs can be overridden with environment variables, which is useful if the
 * buckets are ever renamed or differ between environments. The NEXT_PUBLIC_
 * variants are required for the values to be readable in browser code; the
 * server-only names are accepted as well for server code.
 *
 *   NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET
 *   NEXT_PUBLIC_SUPABASE_THUMBNAIL_BUCKET
 *
 * Leave them unset to use the existing buckets above.
 */

/** Bucket holding the uploaded video files. */
export const VIDEO_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET ||
  process.env.SUPABASE_VIDEO_BUCKET ||
  'video-content'

/** Bucket holding the uploaded thumbnail images. */
export const THUMBNAIL_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_THUMBNAIL_BUCKET ||
  process.env.SUPABASE_THUMBNAIL_BUCKET ||
  'video-thumbnils'

/** Both required buckets, keyed by upload kind. */
export const REQUIRED_BUCKETS = {
  video: VIDEO_BUCKET,
  thumbnail: THUMBNAIL_BUCKET,
} as const

export type UploadKind = keyof typeof REQUIRED_BUCKETS
