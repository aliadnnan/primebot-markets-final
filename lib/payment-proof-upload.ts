/**
 * Payment proof upload, browser side.
 *
 * Flow:
 *   1. POST /api/orders/payment-proof/signed-url  (JSON only, authenticated,
 *      ownership-checked) -> returns a signed upload URL for the private
 *      payment-proofs bucket
 *   2. PUT the file directly to that URL (browser -> Supabase Storage)
 *   3. POST /api/orders/payment-proof/finalize    (JSON only) -> the server
 *      confirms the object exists and records its path on the order
 *
 * The File object never crosses a Server Action boundary, which is what caused
 *   "Only plain objects, and a few built-ins, can be passed to Server Actions."
 * and it never passes through a Vercel serverless request body, whose ~4.5 MB
 * cap is below the 10 MB the form allows.
 *
 * Every failure throws with the real reason. Nothing is swallowed, so the
 * checkout can show it and keep the user's input.
 */

const STALL_TIMEOUT_MS = 60_000
const STALL_CHECK_INTERVAL_MS = 5_000
const REQUEST_TIMEOUT_MS = 30_000

interface UploadArgs {
  orderId: string
  file: File
  fullName: string
  getToken: () => Promise<string | null>
  onStage?: (stage: string) => void
  onProgress?: (percent: number) => void
}

async function postJson(
  url: string,
  token: string,
  body: unknown
): Promise<{ ok: boolean; status: number; data: any }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, data }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`The server did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** PUTs the file to a signed storage URL with real progress and stall detection. */
function putToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress?: (percent: number) => void
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

    // Supabase signed upload URLs expect the raw file body, not multipart
    // FormData. Sending FormData can store the wrong payload or make the
    // signed upload endpoint reject the request.
    xhr.open('PUT', signedUrl, true)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      lastActivityAt = Date.now()
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.upload.onload = () => {
      lastActivityAt = Date.now()
    }

    xhr.onload = () => {
      finish()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }

      let code = ''
      let message = ''
      try {
        const parsed = JSON.parse(xhr.responseText)
        code = parsed?.code || parsed?.error || ''
        message = parsed?.message || ''
      } catch {
        message = xhr.responseText?.slice(0, 200) || ''
      }

      const raw = [code, message].filter(Boolean).join(': ') || `HTTP ${xhr.status}`

      if (
        message.toLowerCase().includes('related resource does not exist') ||
        code === 'NoSuchBucket' ||
        message.toLowerCase().includes('bucket not found')
      ) {
        reject(
          new Error(
            `Payment proof upload failed: the "payment-proofs" storage bucket does not exist in the connected Supabase project. Raw error: ${raw}`
          )
        )
        return
      }
      if (xhr.status === 413) {
        reject(
          new Error(
            `Payment proof upload failed: the file exceeds the size limit configured on the "payment-proofs" bucket. Raw error: ${raw}`
          )
        )
        return
      }
      if (xhr.status === 403) {
        reject(
          new Error(
            `Payment proof upload failed: storage policies on "payment-proofs" denied the upload, or the signed URL was rejected. Raw error: ${raw}`
          )
        )
        return
      }
      reject(new Error(`Payment proof upload failed: ${raw}`))
    }

    xhr.onerror = () => {
      finish()
      reject(new Error('Network error while uploading your payment proof. Check your connection and retry.'))
    }
    xhr.ontimeout = () => {
      finish()
      reject(new Error('The payment proof upload timed out.'))
    }
    xhr.onabort = () => {
      finish()
      reject(
        new Error(
          stalled
            ? `The upload stopped making progress for ${STALL_TIMEOUT_MS / 1000} seconds and was stopped. Your details have been kept - check your connection and try again.`
            : 'Payment proof upload cancelled.'
        )
      )
    }

    xhr.send(file)
  })
}

export async function uploadPaymentProofDirect({
  orderId,
  file,
  fullName,
  getToken,
  onStage,
  onProgress,
}: UploadArgs): Promise<{ path: string }> {
  const token = await getToken()
  if (!token) {
    throw new Error('Your session could not be read. Please sign in again and retry.')
  }

  // ---- 1. Authorization + signed upload URL ----------------------------
  onStage?.('Preparing secure upload')
  const prep = await postJson('/api/orders/payment-proof/signed-url', token, {
    orderId,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  })

  if (!prep.ok || !prep.data?.success || !prep.data.signedUrl || !prep.data.path) {
    throw new Error(
      prep.data?.error || `Could not prepare the payment proof upload (HTTP ${prep.status})`
    )
  }

  const { signedUrl, path } = prep.data as { signedUrl: string; path: string }

  // ---- 2. Direct upload -------------------------------------------------
  onStage?.('Uploading payment proof')
  onProgress?.(0)
  await putToSignedUrl(signedUrl, file, onProgress)
  onProgress?.(100)

  // ---- 3. Finalize ------------------------------------------------------
  // The proof is only considered attached once the server confirms the object
  // exists and the order row was actually updated.
  onStage?.('Attaching proof to your order')
  const finalize = await postJson('/api/orders/payment-proof/finalize', token, {
    orderId,
    path,
    fullName,
  })

  if (!finalize.ok || !finalize.data?.success) {
    throw new Error(
      finalize.data?.error ||
        `The file uploaded, but attaching it to your order failed (HTTP ${finalize.status}).`
    )
  }

  return { path }
}
