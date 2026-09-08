import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { projectRefFromUrl } from '@/lib/supabase-diagnostics'
import { VIDEO_BUCKET } from '@/lib/storage-buckets'

const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

/**
 * Creates a short-lived signed upload URL so the BROWSER can send the file
 * straight to Supabase Storage.
 *
 * Why this exists: the FormData branch below streams the file through this
 * serverless function, and a serverless request body is capped at about 4.5 MB
 * on Vercel. The upload form advertises 500 MB, so any realistic video went out
 * with a body far over that cap and the request was rejected before it reached
 * this code - which is what made uploads look like they silently cancelled.
 *
 * A signed upload URL bypasses the function entirely: the bytes go
 * browser -> Supabase, so the cap does not apply. Admin authorization is still
 * enforced here, before the URL is handed out, and the URL is scoped to one
 * single object path.
 *
 * Send `Content-Type: application/json` to use this mode. The FormData mode is
 * kept as a fallback for small files and local development.
 */
async function createSignedUpload(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const authHeader = request.headers.get('Authorization')

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await supabaseUser.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !userProfile?.is_admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const rawName = typeof body?.filename === 'string' ? body.filename : ''
  const contentType = typeof body?.contentType === 'string' ? body.contentType : ''
  const size = typeof body?.size === 'number' ? body.size : 0

  if (contentType && !ALLOWED_VIDEO_TYPES.includes(contentType)) {
    return NextResponse.json(
      { success: false, error: `Invalid file type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  if (size && size > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { success: false, error: `File size exceeds maximum of ${MAX_VIDEO_SIZE / 1024 / 1024}MB` },
      { status: 400 }
    )
  }

  // Server-generated path - the client never chooses where the object lands.
  const extension = (rawName.split('.').pop() || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
  const filename = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${
    extension ? `.${extension}` : ''
  }`

  const projectRef = projectRefFromUrl(supabaseUrl)
  const where = projectRef ? `Supabase project "${projectRef}"` : 'the connected Supabase project'

  // PREFLIGHT: confirm the bucket actually exists before handing out a URL.
  //
  // createSignedUploadUrl() only signs a token for <bucket>/<path>; it does NOT
  // verify the bucket exists. Without this check a missing bucket produces a
  // perfectly valid-looking URL, and the failure only surfaces later when the
  // browser PUTs the file, as a confusing 404 "The related resource does not
  // exist" (storage-api's RelatedResourceNotFound, raised when an object write
  // has no related bucket row). Checking here turns that into an exact,
  // immediate message that names the bucket and the project.
  const { data: bucketList, error: bucketListError } = await supabaseAdmin.storage.listBuckets()

  if (bucketListError) {
    console.error('[upload] Could not list storage buckets:', bucketListError)
    return NextResponse.json(
      {
        success: false,
        error: `Could not read the storage buckets of ${where}: ${bucketListError.message}. If this is an authorization error, SUPABASE_SERVICE_ROLE_KEY may belong to a different Supabase project than NEXT_PUBLIC_SUPABASE_URL.`,
        stage: 'list-buckets',
        projectRef,
      },
      { status: 400 }
    )
  }

  const availableBuckets = (bucketList || []).map((b: any) => b.id ?? b.name)

  if (!availableBuckets.includes(VIDEO_BUCKET)) {
    const message =
      `Storage bucket "${VIDEO_BUCKET}" does not exist in ${where}. ` +
      (availableBuckets.length
        ? `Buckets that DO exist in this project: ${availableBuckets.join(', ')}. `
        : 'This project has no storage buckets at all. ') +
      `Create a bucket with the exact ID "${VIDEO_BUCKET}" (IDs are case-sensitive) in that project, or point this deployment's environment variables at the Supabase project where it already exists.`

    console.error('[upload] Missing bucket.', {
      expected: VIDEO_BUCKET,
      projectRef,
      availableBuckets,
    })

    return NextResponse.json(
      {
        success: false,
        error: message,
        stage: 'bucket-missing',
        expectedBucket: VIDEO_BUCKET,
        availableBuckets,
        projectRef,
      },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin.storage
    .from(VIDEO_BUCKET)
    .createSignedUploadUrl(filename)

  if (error || !data) {
    console.error('[upload] Could not create signed upload URL:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Signed upload URL could not be generated for bucket "${VIDEO_BUCKET}" in ${where}: ${
          error?.message || 'unknown error'
        }`,
        stage: 'signed-url',
        projectRef,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    mode: 'signed',
    signedUrl: data.signedUrl,
    token: data.token,
    path: filename,
    bucket: VIDEO_BUCKET,
    projectRef,
  })
}

export async function POST(request: NextRequest) {
  // JSON body -> hand back a signed upload URL for a direct browser upload.
  if ((request.headers.get('content-type') || '').includes('application/json')) {
    try {
      return await createSignedUpload(request)
    } catch (error) {
      console.error('Unexpected error creating signed upload URL:', error)
      return NextResponse.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      )
    }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const authHeader = request.headers.get('Authorization')

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get user ID from token
    const { data: userData, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userData.user.id

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds maximum of ${MAX_VIDEO_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const filename = `videos/${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(VIDEO_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading video:', uploadError)
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      path: uploadData.path,
      filename: uploadData.path,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
