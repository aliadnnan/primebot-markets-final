/**
 * Optional `videos` columns.
 *
 * `is_public` and `autoplay` are added by sql/01_video_visibility_and_autoplay.sql.
 * That SQL has to be run manually in the Supabase SQL Editor, so the app must
 * keep working before it has been run. Every write that touches these columns
 * therefore retries once without them if Postgres reports that the column does
 * not exist, and every read falls back to filtering on `published` alone.
 */

export const OPTIONAL_VIDEO_COLUMNS = ['is_public', 'autoplay'] as const

/** True when a PostgREST/Postgres error was caused by a missing column. */
export function isMissingColumnError(error: any): boolean {
  if (!error) return false
  // 42703 = undefined_column. PGRST204 = column not found in schema cache.
  if (error.code === '42703' || error.code === 'PGRST204') return true
  const message = `${error.message || ''} ${error.details || ''}`
  return OPTIONAL_VIDEO_COLUMNS.some(
    (column) =>
      new RegExp(`column .*${column}.* does not exist`, 'i').test(message) ||
      new RegExp(`'${column}' column`, 'i').test(message)
  )
}

/** Returns a copy of `payload` with the optional columns removed. */
export function withoutOptionalColumns<T extends Record<string, any>>(payload: T): Partial<T> {
  const copy: Record<string, any> = { ...payload }
  for (const column of OPTIONAL_VIDEO_COLUMNS) {
    delete copy[column]
  }
  return copy as Partial<T>
}

/** Message shown to the admin when the optional columns are not present yet. */
export const MIGRATION_HINT =
  'Saved, but the Public/Private and Autoplay settings were ignored because the videos table does not have the is_public and autoplay columns yet. Run sql/01_video_visibility_and_autoplay.sql in the Supabase SQL Editor to enable them.'
