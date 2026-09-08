/**
 * Browser-side file upload for the Admin Panel.
 *
 * Strategy, in order:
 *
 *   1. Ask the server for a signed upload URL and PUT the file straight to
 *      Supabase Storage. This is the primary path. It avoids the ~4.5 MB
 *      serverless request body cap that made larger uploads fail, and it gives
 *      real byte-level progress via XMLHttpRequest.
 *   2. If that direct PUT fails, retry through the supabase-js client
 *      (`uploadToSignedUrl`) using the same signed URL token.
 *   3. If the signed URL could not be issued at all, fall back to the original
 *      server-proxy FormData route, which still works for small files and in
 *      local development.
 *
 * Every failure returns the real error message. Nothing is swallowed.
 */

import { supabase } from './supabase/client'
import { describeStorageError, parseStorageErrorBody } from './supabase-diagnostics'
import { REQUIRED_BUCKETS } from './storage-buckets'

export interface UploadResult {
  path: string
  /** Which strategy actually succeeded - useful when reporting problems. */
  via: 'signed-direct' | 'signed-client' | 'server-proxy'
}

interface UploadOptions {
  /** Which bucket to target. See lib/storage-buckets.ts for the IDs. */
  kind: 'video' | 'thumbnail'
  file: File
  /** Returns a fresh admin access token. */
  getToken: () => Promise<string | null>
  /** Called with 0-100 as the upload progresses. */
  onProgress?: (percent: number) => void
  /** Lets the caller cancel an in-flight upload. */
  signal?: AbortSignal
}

const ENDPOINTS: Record<UploadOptions['kind'], string> = {
  video: '/api/admin/upload-video',
  thumbnail: '/api/admin/upload-thumbnail',
}

const BUCKETS: Record<UploadOptions['kind'], string> = {
  video: REQUIRED_BUCKETS.video,
  thumbnail: REQUIRED_BUCKETS.thumbnail,
}

/**
 * How long the upload may make no progress at all before we give up.
 *
 * Without this, a connection that dies mid-transfer never fires `load`,
 * `error` or `timeout` on the XHR, and the form sits on "Uploading..." forever
 * with no way out. The stall detector guarantees the upload always terminates
 * in either success or a real error message.
 */
const STALL_TIMEOUT_MS = 90_000
const STALL_CHECK_INTERVAL_MS = 5_000

/** Short requests (issuing the signed URL) must not hang either. */
const REQUEST_TIMEOUT_MS = 30_000

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`The server did not respond within ${timeoutMs / 1000} seconds.`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** PUTs the file to a signed storage URL, reporting real progress. */
function putToSignedUrl(
  signedUrl: string,
  file: File,
  bucket: string,
  projectRef: string | null,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let lastActivityAt = Date.now()
    let stalled = false

    const stallTimer = setInterval(() => {
      if (Date.now() - lastActivityAt < STALL_TIMEOUT_MS) return
      stalled = true
      clearInterval(stallTimer)
      xhr.abort()
    }, STALL_CHECK_INTERVAL_MS)

    const finish = () => clearInterval(stallTimer)

    // Mirrors the multipart body that supabase-js sends for a Blob upload.
    const form = new FormData()
    form.append('cacheControl', '3600')
    form.append('', file)

    xhr.open('PUT', signedUrl, true)
    xhr.setRequestHeader('x-upsert', 'false')
    // Content-Type is intentionally not set: the browser must add the
    // multipart boundary itself.

    xhr.upload.onprogress = (event) => {
      lastActivityAt = Date.now()
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    // The browser has finished sending; the server is now processing. Keep the
    // stall clock alive so a slow-but-working server is not killed off.
    xhr.upload.onload = () => {
      lastActivityAt = Date.now()
    }

    xhr.onload = () => {
      finish()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      // Translate the raw storage response into an explicit statement of
      // which resource failed, rather than passing through a bare
      // "The related resource does not exist".
      const parsed = parseStorageErrorBody(xhr.responseText)
      console.error('[upload] Storage rejected the upload.', {
        bucket,
        projectRef,
        httpStatus: xhr.status,
        code: parsed.code,
        message: parsed.message,
        responseBody: xhr.responseText?.slice(0, 500),
      })
      reject(
        new Error(
          describeStorageError(bucket, projectRef, xhr.status, parsed.code, parsed.message)
        )
      )
    }

    xhr.onerror = () => {
      finish()
      reject(new Error('Network error while uploading to storage. Check your connection and retry.'))
    }
    xhr.ontimeout = () => {
      finish()
      reject(new Error('The upload timed out.'))
    }
    xhr.onabort = () => {
      finish()
      reject(
        new Error(
          stalled
            ? `The upload stopped making progress for ${
                STALL_TIMEOUT_MS / 1000
              } seconds and was stopped. Your form has been kept - check your connection and press Upload Video again.`
            : 'Upload cancelled.'
        )
      )
    }

    if (signal) {
      if (signal.aborted) {
        xhr.abort()
        return
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(form)
  })
}

export async function uploadAdminFile({
  kind,
  file,
  getToken,
  onProgress,
  signal,
}: UploadOptions): Promise<UploadResult> {
  const accessToken = await getToken()
  if (!accessToken) {
    throw new Error('Your admin session could not be read. Please reload the page and sign in again.')
  }

  const endpoint = ENDPOINTS[kind]

  // --- Step 1: request a signed upload URL -------------------------------
  let signed: { signedUrl: string; token: string; path: string } | null = null
  let signedUrlError = ''
  let projectRef: string | null = null
  const bucket = BUCKETS[kind]

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
    })

    const data = await response.json().catch(() => null)

    projectRef = typeof data?.projectRef === 'string' ? data.projectRef : null

    if (response.ok && data?.success && data.signedUrl && data.token && data.path) {
      signed = { signedUrl: data.signedUrl, token: data.token, path: data.path }
    } else {
      signedUrlError = data?.error || `Could not prepare the upload (HTTP ${response.status})`
      if (data?.stage) {
        console.error('[upload] Preparation failed.', {
          stage: data.stage,
          expectedBucket: data.expectedBucket,
          availableBuckets: data.availableBuckets,
          projectRef: data.projectRef,
          error: data.error,
        })
      }
      // A validation rejection, a missing bucket or a project mismatch is
      // final - do not silently retry through the proxy and report something
      // vaguer than the exact resource that is missing.
      if (response.status === 400 || response.status === 403) {
        throw new Error(signedUrlError)
      }
    }
  } catch (error) {
    if (signedUrlError) throw error
    signedUrlError = error instanceof Error ? error.message : 'Could not prepare the upload'
  }

  // --- Step 2: direct upload, then the client-library variant ------------
  if (signed) {
    try {
      onProgress?.(0)
      await putToSignedUrl(signed.signedUrl, file, bucket, projectRef, onProgress, signal)
      onProgress?.(100)
      return { path: signed.path, via: 'signed-direct' }
    } catch (directError) {
      if (signal?.aborted) throw directError

      const { error: clientError } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type || undefined,
        })

      if (!clientError) {
        onProgress?.(100)
        return { path: signed.path, via: 'signed-client' }
      }

      console.error('[upload] Client-library retry also failed.', {
        bucket,
        projectRef,
        error: clientError,
      })

      // Prefer the already-translated message from the direct attempt; it
      // names the exact failing resource.
      throw new Error(
        `${
          directError instanceof Error ? directError.message : 'Upload failed'
        } The client-library retry failed as well: ${clientError.message}`
      )
    }
  }

  // --- Step 3: server-proxy fallback ------------------------------------
  const formData = new FormData()
  formData.append('file', file)

  const proxyResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
    signal,
  })

  if (proxyResponse.status === 413) {
    throw new Error(
      `This file is too large to upload through the server (${(file.size / 1024 / 1024).toFixed(
        1
      )} MB). Direct upload was unavailable: ${signedUrlError}`
    )
  }

  const proxyData = await proxyResponse.json().catch(() => null)

  if (!proxyResponse.ok || !proxyData?.success || !proxyData.path) {
    throw new Error(
      proxyData?.error || signedUrlError || `Upload failed (HTTP ${proxyResponse.status})`
    )
  }

  onProgress?.(100)
  return { path: proxyData.path, via: 'server-proxy' }
}
