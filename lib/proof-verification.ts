/**
 * Payment-proof verification.
 *
 * How it works:
 *   1. The buyer submits method + their name + amount sent + TID + a slip
 *      picture (see app/payment/page.tsx and app/api/orders/payment-proof).
 *   2. When the slip is finalized, the server runs OCR on the slip image and
 *      cross-checks what the buyer TYPED against what the slip SAYS:
 *        - TID:    exact normalized match (spaces/dashes stripped on both)
 *        - amount: numeric match (commas, decimals, "PKR" text tolerated)
 *        - name:   case-insensitive, token-containment, surname-order tolerant
 *   3. HARD PASS/FAIL GATE (owner order 2026-10-10 ~21:40 PKT):
 *        ALL MATCH  -> 'verified': the request is APPROVED automatically and
 *                      proceeds through the existing flow (delivery follows the
 *                      normal admin delivery step).
 *        ANY MISMATCH or unreadable slip -> 'failed': the request is REJECTED
 *                      automatically with a clear buyer-facing message telling
 *                      them to upload the correct slip. It must NOT proceed,
 *                      must NOT auto-approve, and must NOT sit in a review
 *                      queue. The buyer may resubmit the correct slip against
 *                      the same order, which re-runs this check.
 *      Every failed attempt is kept in the audit trail (typed values, OCR
 *      text, per-field results, timestamp) so the admin has read-only fraud
 *      visibility. Failed attempts need no admin action.
 *
 * OCR choice:
 *   tesseract.js (pure wasm, no native binary) is used when it can be loaded.
 *   It does NOT exist as a system binary on Vercel, and it downloads the
 *   English language data from its CDN on first use (cached afterwards), so
 *   the first verification on a fresh deployment is slower. Every failure
 *   mode - missing package, network blocked, unsupported file type (PDF),
 *   OCR timeout/error - degrades to 'failed' with a reason, so a fake slip
 *   or unreadable image can never auto-approve. NEVER auto-approve when OCR
 *   is unavailable.
 */

export type VerificationStatus = 'verified' | 'failed'
export type OcrStatus = 'ok' | 'failed' | 'unavailable' | 'unsupported_type' | 'skipped'

export interface VerificationDetail {
  name_match: boolean
  tid_match: boolean
  amount_match: boolean
  /** Informational: amount the buyer typed vs the bot's authoritative price. */
  bot_price_match: boolean | null
  status: VerificationStatus
  reasons: string[]
  ocr_status: OcrStatus
  ocr_text: string | null
  checked_at: string
  /** What the buyer typed at the time of this check (fraud audit trail). */
  typed: {
    name: string | null
    tid: string | null
    amount: number | null
    method: string | null
    bot_price: number | null
  }
}

const OCR_TEXT_MAX_CHARS = 4000
const OCR_TIMEOUT_MS = 60_000

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** Strip everything but letters/digits and lowercase: "ABC-123 xyz" -> "abc123xyz". */
export function normalizeTid(value: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Lowercase, keep letters/digits/spaces, collapse whitespace. */
export function normalizeName(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u0600-\u06ff ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parse a human-typed amount like "1,000.00", "1000", "1000 PKR" into a number.
 * Returns null when nothing parseable is present.
 */
export function parseTypedAmount(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null
  }
  const text = String(value || '')
  const match = text.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/)
  if (!match) return null
  const parsed = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null
}

/** All candidate amounts visible in OCR text ("1,000.00 PKR" -> [1000]). */
export function extractAmounts(ocrText: string): number[] {
  const found: number[] = []
  const re = /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(ocrText)) !== null) {
    const n = Number(m[1].replace(/,/g, ''))
    if (Number.isFinite(n)) found.push(n)
  }
  return found
}

// ---------------------------------------------------------------------------
// Field matching (pure functions - easy to unit-test)
// ---------------------------------------------------------------------------

/** The typed TID must appear in the slip, exactly, after normalization. */
export function matchTid(typedTid: string, ocrText: string): boolean {
  const tid = normalizeTid(typedTid)
  if (tid.length < 3) return false
  const ocr = normalizeTid(ocrText)
  return ocr.includes(tid)
}

/** Any amount on the slip must equal the typed amount (1 cent tolerance). */
export function matchAmount(typedAmount: number | null, ocrText: string): boolean {
  if (typedAmount === null) return false
  return extractAmounts(ocrText).some((n) => Math.abs(n - typedAmount) < 0.011)
}

/**
 * Name matching: every meaningful word of the typed name should be found on
 * the slip, in any order (surname-first slips pass). At least 60% of the
 * typed tokens must hit; single initials are ignored.
 */
export function matchName(typedName: string, ocrText: string): boolean {
  const typedNorm = normalizeName(typedName)
  const ocrNorm = normalizeName(ocrText)
  const tokens = typedNorm.split(' ').filter((t) => t.length >= 2)
  if (tokens.length === 0) return false

  let hits = 0
  for (const token of tokens) {
    // Whole-word hit preferred; fall back to substring for glued OCR words.
    const whole = new RegExp(`(^| )${escapeRegex(token)}( |$)`)
    if (whole.test(ocrNorm) || ocrNorm.includes(token)) hits++
  }

  const needed = Math.max(1, Math.ceil(tokens.length * 0.6))
  return hits >= needed
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------------
// OCR
// ---------------------------------------------------------------------------

export interface OcrResult {
  status: OcrStatus
  text: string | null
  reason?: string
}

/**
 * Extract text from a slip image buffer. PDFs and non-images cannot be OCR'd
 * here, so they go to manual admin review.
 */
export async function extractSlipText(
  imageBytes: Buffer,
  mimeType: string | null
): Promise<OcrResult> {
  if (!mimeType || !mimeType.startsWith('image/')) {
    return {
      status: 'unsupported_type',
      text: null,
      reason: `OCR supports images only; this file is "${mimeType || 'unknown type'}".`,
    }
  }

  let recognize: any
  try {
    // Lazy: tesseract.js is optional. If the package is missing (or its
    // runtime fetch of language data is blocked), verification degrades to
    // needs_review instead of crashing the order flow.
    const mod = (await import('tesseract.js')) as any
    recognize = mod.recognize || mod.default?.recognize
    if (typeof recognize !== 'function') throw new Error('recognize() not found')
  } catch (error) {
    return {
      status: 'unavailable',
      text: null,
      reason: 'OCR engine could not be loaded in this environment.',
    }
  }

  try {
    const result = await withTimeout(
      recognize(imageBytes, 'eng', {
        // Keep the tesseract.js default CDN for language data; it is fetched
        // once and cached afterwards. Silence progress logging.
        logger: () => {},
      }),
      OCR_TIMEOUT_MS,
      'OCR timed out'
    )
    const text = String((result as any)?.data?.text || '').trim()
    if (!text) {
      return { status: 'failed', text: null, reason: 'OCR returned no readable text.' }
    }
    return { status: 'ok', text: text.slice(0, OCR_TEXT_MAX_CHARS) }
  } catch (error) {
    return {
      status: 'failed',
      text: null,
      reason: error instanceof Error ? error.message : 'OCR failed.',
    }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      }
    )
  })
}

// ---------------------------------------------------------------------------
// Overall verification
// ---------------------------------------------------------------------------

export interface VerifyArgs {
  payerName: string | null
  typedTid: string | null
  typedAmount: number | null
  paymentMethod: string | null
  /** The bot's authoritative price from the database (informational check). */
  botPrice: number | null
  ocrText: string | null
  ocrStatus: OcrStatus
}

/** Combine the per-field checks into one auditable PASS/FAIL decision. */
export function verifyPaymentProof(args: VerifyArgs): VerificationDetail {
  const reasons: string[] = []
  let nameMatch = false
  let tidMatch = false
  let amountMatch = false
  let botPriceMatch: boolean | null = null

  if (args.ocrStatus !== 'ok' || !args.ocrText) {
    reasons.push(
      args.ocrStatus === 'unavailable'
        ? 'The slip could not be read automatically in this environment - the payment could not be verified.'
        : args.ocrStatus === 'unsupported_type'
          ? 'The slip is not an image (PDF) and cannot be checked automatically - the payment could not be verified.'
          : args.ocrStatus === 'skipped'
            ? 'Verification was skipped - the payment could not be verified.'
            : 'The slip could not be read - the payment could not be verified.'
    )
  } else {
    nameMatch = matchName(args.payerName || '', args.ocrText)
    tidMatch = matchTid(args.typedTid || '', args.ocrText)
    amountMatch = matchAmount(args.typedAmount, args.ocrText)

    if (!nameMatch) reasons.push('Name on the form was not found on the slip.')
    if (!tidMatch) reasons.push('Transaction ID on the form was not found on the slip.')
    if (!amountMatch) {
      reasons.push(
        args.typedAmount === null
          ? 'No amount was entered on the form, so it could not be checked.'
          : 'Amount on the form did not match any amount on the slip.'
      )
    }
  }

  if (args.typedAmount !== null && args.botPrice !== null) {
    botPriceMatch = Math.abs(args.typedAmount - args.botPrice) < 0.011
    if (!botPriceMatch) {
      reasons.push(
        `Amount entered (${args.typedAmount}) differs from the bot's listed price (${args.botPrice}).`
      )
    }
  }

  // HARD GATE: verified only when name + TID + amount all match the slip.
  // A bot-price difference is reported but does not fail the slip check.
  const status: VerificationStatus =
    nameMatch && tidMatch && amountMatch ? 'verified' : 'failed'
  if (status === 'failed' && reasons.length === 0) {
    reasons.push('Verification could not be completed - please upload the correct slip.')
  }

  return {
    name_match: nameMatch,
    tid_match: tidMatch,
    amount_match: amountMatch,
    bot_price_match: botPriceMatch,
    status,
    reasons,
    ocr_status: args.ocrStatus,
    ocr_text: args.ocrText,
    checked_at: new Date().toISOString(),
    typed: {
      name: args.payerName,
      tid: args.typedTid,
      amount: args.typedAmount,
      method: args.paymentMethod,
      bot_price: args.botPrice,
    },
  }
}

/**
 * The single buyer-facing message after a failed verification. It must tell
 * the buyer exactly what to do (upload the correct slip) without exposing
 * OCR internals.
 */
export function buyerFailMessage(detail: VerificationDetail): string {
  const bits: string[] = []
  if (!detail.name_match) bits.push('the name')
  if (!detail.tid_match) bits.push('the transaction ID')
  if (!detail.amount_match) bits.push('the amount')
  const what =
    bits.length > 0
      ? `${bits.join(' and ')} on your form did not match what is shown on the payment slip`
      : 'the payment slip could not be verified'
  return `Payment verification failed: ${what}. Please upload the correct slip for this payment and try again.`
}
