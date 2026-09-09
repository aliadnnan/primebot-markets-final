import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseServer,
  getUserFromRequest,
  isSupabaseServerConfigured,
  PAYMENT_PROOF_BUCKET,
} from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Limits preserved exactly as the existing checkout advertised them:
 * 10 MB, images (JPG/PNG/GIF/WebP) or PDF.
 */
const MAX_PROOF_SIZE = 10 * 1024 * 1024
const ALLOWED_PROOF_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]

/**
 * Issues a signed upload URL so the BROWSER uploads the payment proof straight
 * to the private payment-proofs bucket.
 *
 * Why this replaced the Server Action: the checkout used to pass the browser's
 * `File` object as an argument to a `'use server'` function. React cannot
 * serialise a File across that boundary, which produced
 *
 *   "Only plain objects, and a few built-ins, can be passed to Server Actions.
 *    Classes or null prototypes are not supported."
 *
 * Wrapping the File in another object would not have helped - the File itself
 * is the unsupported value. Sending the bytes through the route as FormData
 * would work but would also push the whole file through a Vercel serverless
 * request body, which is capped at roughly 4.5 MB, well under the 10 MB the
 * form allows. A signed upload URL avoids both problems: nothing but JSON
 * crosses the server boundary, and the bytes go browser -> Supabase.
 *
 * Authorization: the caller must be signed in AND must own the order. The
 * object path is generated here from the verified user id, so a customer cannot
 * write into another customer's folder.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseServerConfigured) {
      return NextResponse.json(
        { success: false, error: 'Server is not configured to reach Supabase.' },
        { status: 500 }
      )
    }

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to upload a payment proof.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    const filename = typeof body?.filename === 'string' ? body.filename : ''
    const contentType = typeof body?.contentType === 'string' ? body.contentType : ''
    const size = typeof body?.size === 'number' ? body.size : 0

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'No order ID was supplied.' },
        { status: 400 }
      )
    }

    if (contentType && !ALLOWED_PROOF_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only images (JPG, PNG, GIF, WebP) and PDF files are allowed.',
        },
        { status: 400 }
      )
    }

    if (size && size > MAX_PROOF_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB.' },
        { status: 400 }
      )
    }

    // ---- Ownership check ------------------------------------------------
    const { data: order, error: orderError } = await (supabaseServer as any)
      .from('orders')
      .select('id, user_id, status')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) {
      console.error('[payment-proof] Could not read order:', orderError)
      return NextResponse.json(
        { success: false, error: `Could not verify the order: ${orderError.message}` },
        { status: 400 }
      )
    }
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }
    if (order.user_id !== user.id) {
      // Deliberately the same message as "not found" would be fine, but being
      // explicit is harmless here since we already know who the caller is.
      return NextResponse.json(
        { success: false, error: 'This order does not belong to your account.' },
        { status: 403 }
      )
    }

    // ---- Server-generated path ------------------------------------------
    // Keeps the existing <userId>/<orderId>/<timestamp>-<name> layout.
    const safeName =
      filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .slice(-80) || 'proof'
    const path = `${user.id}/${orderId}/${Date.now()}-${safeName}`

    // PREFLIGHT: confirm the bucket exists before issuing a URL.
    //
    // createSignedUploadUrl() only signs a token for <bucket>/<path>; it does
    // NOT verify the bucket exists. A missing bucket therefore surfaced as the
    // opaque Supabase Storage message "The related resource does not exist"
    // (storage-api's RelatedResourceNotFound, raised when an object write has
    // no related bucket row). Checking here turns that into an exact message
    // naming the bucket, the project, and the buckets that DO exist.
    const { data: bucketList, error: bucketListError } = await supabaseServer.storage.listBuckets()

    if (bucketListError) {
      console.error('[payment-proof] Could not list storage buckets:', bucketListError)
      return NextResponse.json(
        {
          success: false,
          error: `Could not read the storage buckets of the connected Supabase project: ${bucketListError.message}. If this is an authorization error, SUPABASE_SERVICE_ROLE_KEY may belong to a different project than NEXT_PUBLIC_SUPABASE_URL.`,
          stage: 'list-buckets',
        },
        { status: 400 }
      )
    }

    const availableBuckets = (bucketList || []).map((b: any) => b.id ?? b.name)

    if (!availableBuckets.includes(PAYMENT_PROOF_BUCKET)) {
      const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').match(
        /https:\/\/([a-z0-9]+)\.supabase\./i
      )?.[1]

      console.error('[payment-proof] Missing bucket.', {
        expected: PAYMENT_PROOF_BUCKET,
        projectRef,
        availableBuckets,
      })

      return NextResponse.json(
        {
          success: false,
          error:
            `Storage bucket "${PAYMENT_PROOF_BUCKET}" does not exist in Supabase project "${
              projectRef || 'unknown'
            }". ` +
            (availableBuckets.length
              ? `Buckets that DO exist: ${availableBuckets.join(', ')}. `
              : 'This project has no storage buckets at all. ') +
            `Create a PRIVATE bucket with the exact ID "${PAYMENT_PROOF_BUCKET}" (IDs are case-sensitive) — or run sql/07_storage_buckets_setup.sql in the Supabase SQL Editor, which creates it with the correct settings.`,
          stage: 'bucket-missing',
          expectedBucket: PAYMENT_PROOF_BUCKET,
          availableBuckets,
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer.storage
      .from(PAYMENT_PROOF_BUCKET)
      .createSignedUploadUrl(path)

    if (error || !data) {
      console.error('[payment-proof] Could not create signed upload URL:', error)
      return NextResponse.json(
        {
          success: false,
          error: `Signed upload URL could not be generated for the "${PAYMENT_PROOF_BUCKET}" bucket: ${
            error?.message || 'unknown error'
          }`,
          stage: 'signed-url',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      bucket: PAYMENT_PROOF_BUCKET,
    })
  } catch (error) {
    console.error('[payment-proof] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
