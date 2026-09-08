/**
 * Temporary draft persistence for the admin video upload form.
 *
 * Stored in `sessionStorage`, which survives an accidental page refresh and
 * navigating away and back within the same tab, and is discarded when the tab
 * is closed. Nothing sensitive is stored - only what the administrator typed.
 *
 * A selected File cannot be serialised, so only its NAME is remembered. The UI
 * uses that to tell the administrator exactly which file to pick again after a
 * refresh, rather than silently presenting an empty file input.
 *
 * The draft is cleared only on a successful upload or when the administrator
 * explicitly discards it.
 */

const DRAFT_KEY = 'primebot:admin:video-upload-draft'

/**
 * Key used by an earlier attempt at this feature, which stored the draft in
 * `localStorage`. localStorage is the wrong scope here: the draft outlived the
 * browser session entirely and stayed readable on a shared computer long after
 * the admin had finished. It is removed on first load so no stale copy lingers.
 */
const LEGACY_LOCALSTORAGE_KEY = 'primebot-video-upload-draft-v1'

export function clearLegacyDraft(): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY)
  } catch {
    // Ignore - best effort only.
  }
}

export interface VideoUploadDraft {
  title: string
  description: string
  category_id: string
  video_url: string
  source_type: 'upload' | 'link'
  published: boolean
  is_public: boolean
  autoplay: boolean
  /** Name of the previously selected file, if any. The file itself is gone. */
  video_file_name?: string
  thumbnail_file_name?: string
  savedAt: number
}

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.sessionStorage
  } catch {
    // Private browsing modes can throw on access.
    return null
  }
}

export function loadVideoDraft(): VideoUploadDraft | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VideoUploadDraft
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function saveVideoDraft(draft: Omit<VideoUploadDraft, 'savedAt'>): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch {
    // Quota or private mode - drafting is best-effort and must never break
    // the form.
  }
}

export function clearVideoDraft(): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(DRAFT_KEY)
  } catch {
    // Ignore.
  }
}

/** True when the draft holds anything worth restoring. */
export function draftHasContent(draft: VideoUploadDraft | null): boolean {
  if (!draft) return false
  return Boolean(
    draft.title?.trim() ||
      draft.description?.trim() ||
      draft.category_id ||
      draft.video_url?.trim() ||
      draft.video_file_name
  )
}
