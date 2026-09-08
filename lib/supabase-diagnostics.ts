/**
 * Supabase connection diagnostics.
 *
 * Answers, precisely and without guessing:
 *   1. Which Supabase project is this deployment actually talking to?
 *   2. Do NEXT_PUBLIC_SUPABASE_URL, the anon key and the service role key all
 *      point at the SAME project? (A mismatch here is a common cause of
 *      "the buckets exist but the app cannot see them".)
 *   3. Do the configured video and thumbnail buckets exist in that
 *      project, and with what limits?
 *   4. Are the `videos` and `video_categories` tables reachable?
 *   5. Can a signed upload URL actually be created for each bucket?
 *
 * Nothing here exposes a key. Only the project ref (which is already visible in
 * NEXT_PUBLIC_SUPABASE_URL) and the key's role are reported.
 */

import { createClient } from '@supabase/supabase-js'
import { REQUIRED_BUCKETS } from './storage-buckets'

// Bucket IDs live in lib/storage-buckets.ts. Re-exported here so existing
// imports keep working, but there is only one definition.
export { REQUIRED_BUCKETS }

export interface CheckResult {
  name: string
  status: 'ok' | 'fail' | 'warn' | 'skipped'
  detail: string
}

/**
 * Extracts the Supabase project ref from a URL like
 * https://abcdefghijklmn.supabase.co -> "abcdefghijklmn"
 */
export function projectRefFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname
    const match = host.match(/^([a-z0-9]+)\.supabase\.(co|in|red)$/i)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * Reads the `ref` and `role` claims out of a Supabase anon/service key.
 *
 * Legacy Supabase keys are unsigned-payload-readable JWTs whose payload is
 * `{ iss: "supabase", ref: "<projectref>", role: "anon" | "service_role" }`.
 * We only base64-decode the payload to read those two claims - no verification,
 * no secret handling. Newer `sb_publishable_…` / `sb_secret_…` keys are not
 * JWTs, which is reported rather than treated as an error.
 */
export function decodeSupabaseKey(key: string): {
  ref: string | null
  role: string | null
  format: 'jwt' | 'new-style' | 'unknown'
} {
  if (!key) return { ref: null, role: null, format: 'unknown' }

  if (key.startsWith('sb_publishable_') || key.startsWith('sb_secret_')) {
    return { ref: null, role: null, format: 'new-style' }
  }

  const parts = key.split('.')
  if (parts.length !== 3) return { ref: null, role: null, format: 'unknown' }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    return {
      ref: typeof payload?.ref === 'string' ? payload.ref : null,
      role: typeof payload?.role === 'string' ? payload.role : null,
      format: 'jwt',
    }
  } catch {
    return { ref: null, role: null, format: 'unknown' }
  }
}

/** Turns a Supabase Storage error into an explicit, operator-facing sentence. */
export function describeStorageError(
  bucket: string,
  projectRef: string | null,
  status: number | null,
  code: string | null,
  message: string | null
): string {
  const where = projectRef ? `Supabase project "${projectRef}"` : 'the connected Supabase project'
  const raw = [code, message].filter(Boolean).join(': ') || `HTTP ${status ?? '?'}`

  // The signature that started this investigation. storage-api raises
  // RelatedResourceNotFound (httpStatusCode 404, code InvalidRequest,
  // message "The related resource does not exist") when an object write has no
  // related bucket row - i.e. the bucket does not exist.
  if (
    (message || '').toLowerCase().includes('related resource does not exist') ||
    code === 'RelatedResourceNotFound'
  ) {
    return `Storage bucket "${bucket}" does not exist in ${where}. Supabase Storage rejected the upload with 404 "The related resource does not exist", which it returns when an object has no matching bucket. Create a bucket with the exact ID "${bucket}" in that project, or point the deployment's environment variables at the project where it already exists. Raw error: ${raw}`
  }

  if (code === 'NoSuchBucket' || (message || '').toLowerCase().includes('bucket not found')) {
    return `Storage bucket "${bucket}" was not found in ${where}. Check the bucket ID spelling (it is case-sensitive) and that it lives in this project. Raw error: ${raw}`
  }

  if (code === 'AccessDenied' || status === 403) {
    if ((message || '').toLowerCase().includes('signature')) {
      return `The signed upload URL for "${bucket}" was rejected as invalid. This usually means the URL was altered or the service role key does not belong to ${where}. Raw error: ${raw}`
    }
    return `Access to bucket "${bucket}" was denied by storage policies in ${where}. Check the storage policies for this bucket. Raw error: ${raw}`
  }

  if (code === 'InvalidJWT' || status === 401) {
    return `The signed upload URL for "${bucket}" was rejected as expired or malformed. Start the upload again. Raw error: ${raw}`
  }

  if (code === 'EntityTooLarge' || status === 413) {
    return `The file is larger than the size limit configured on bucket "${bucket}" (or on the project's storage settings) in ${where}. Raise the bucket's file size limit. Raw error: ${raw}`
  }

  if (code === 'InvalidMimeType') {
    return `Bucket "${bucket}" in ${where} does not allow this file's MIME type. Adjust the bucket's allowed MIME types. Raw error: ${raw}`
  }

  if (code === 'ResourceAlreadyExists' || code === 'KeyAlreadyExists' || status === 409) {
    return `An object already exists at that path in "${bucket}". Retry the upload - a new unique path is generated each time. Raw error: ${raw}`
  }

  if (code === 'TenantNotFound') {
    return `Supabase Storage reports that ${where} has no storage service provisioned. Raw error: ${raw}`
  }

  return `Upload to bucket "${bucket}" in ${where} failed. Raw error from Supabase Storage: ${raw}`
}

/** Parses a storage error body, whatever shape it arrives in. */
export function parseStorageErrorBody(body: string): {
  code: string | null
  message: string | null
  statusCode: number | null
} {
  try {
    const parsed = JSON.parse(body)
    return {
      code: parsed?.code ?? parsed?.error ?? null,
      message: parsed?.message ?? null,
      statusCode: parsed?.statusCode ? Number(parsed.statusCode) : null,
    }
  } catch {
    return { code: null, message: body ? body.slice(0, 300) : null, statusCode: null }
  }
}

/**
 * Runs the full connection/resource check. Server-side only: needs the service
 * role key to list buckets.
 */
export async function runSupabaseDiagnostics(): Promise<{
  projectRef: string | null
  checks: CheckResult[]
  buckets: string[]
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const checks: CheckResult[] = []
  const urlRef = projectRefFromUrl(url)
  const anon = decodeSupabaseKey(anonKey)
  const service = decodeSupabaseKey(serviceKey)
  let bucketIds: string[] = []

  // --- 1. Environment variables present? ---------------------------------
  checks.push({
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    status: url ? 'ok' : 'fail',
    detail: url ? `${url} (project ref: ${urlRef ?? 'could not parse'})` : 'Not set',
  })
  checks.push({
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    status: anonKey ? 'ok' : 'fail',
    detail: anonKey
      ? `Present. Format: ${anon.format}. Role: ${anon.role ?? 'unknown'}. Project ref: ${anon.ref ?? 'not readable'}`
      : 'Not set',
  })
  checks.push({
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    status: serviceKey ? 'ok' : 'fail',
    detail: serviceKey
      ? `Present. Format: ${service.format}. Role: ${service.role ?? 'unknown'}. Project ref: ${service.ref ?? 'not readable'}`
      : 'Not set (server-side admin operations and signed uploads will fail)',
  })

  // --- 2. Do all three point at the SAME project? ------------------------
  // Compared case-insensitively: the hostname is lowercased by URL parsing
  // while the JWT `ref` claim is used verbatim, so a case difference alone must
  // not be reported as a project mismatch.
  const refs = [urlRef, anon.ref, service.ref].filter(Boolean) as string[]
  const distinct = Array.from(new Set(refs.map((ref) => ref.toLowerCase())))

  if (distinct.length === 0) {
    checks.push({
      name: 'Project match (URL vs anon key vs service key)',
      status: 'warn',
      detail: 'Could not determine the project ref from any value. New-style keys do not carry it.',
    })
  } else if (distinct.length === 1) {
    checks.push({
      name: 'Project match (URL vs anon key vs service key)',
      status: 'ok',
      detail: `All readable values point at the same project: ${distinct[0]}`,
    })
  } else {
    checks.push({
      name: 'Project match (URL vs anon key vs service key)',
      status: 'fail',
      detail: `MISMATCH. URL project: ${urlRef ?? 'unknown'}; anon key project: ${anon.ref ?? 'unknown'}; service key project: ${service.ref ?? 'unknown'}. The deployment is mixing credentials from different Supabase projects, so buckets and tables created in one will be invisible to the other.`,
    })
  }

  if (service.role && service.role !== 'service_role') {
    checks.push({
      name: 'Service role key role claim',
      status: 'fail',
      detail: `SUPABASE_SERVICE_ROLE_KEY carries role "${service.role}", not "service_role". The wrong key was pasted into this variable.`,
    })
  }

  if (!url || !serviceKey) {
    checks.push({
      name: 'Storage and database checks',
      status: 'skipped',
      detail: 'Skipped because the URL or service role key is missing.',
    })
    return { projectRef: urlRef, checks, buckets: bucketIds }
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  // --- 3. Buckets --------------------------------------------------------
  try {
    const { data, error } = await admin.storage.listBuckets()
    if (error) {
      checks.push({
        name: 'List storage buckets',
        status: 'fail',
        detail: `Could not list buckets: ${error.message}. If this is an auth error, the service role key does not belong to project ${urlRef ?? '(unknown)'}.`,
      })
    } else {
      bucketIds = (data || []).map((b: any) => b.id ?? b.name)
      checks.push({
        name: 'List storage buckets',
        status: 'ok',
        detail: bucketIds.length
          ? `Buckets in project ${urlRef ?? '(unknown)'}: ${bucketIds.join(', ')}`
          : `Project ${urlRef ?? '(unknown)'} has NO storage buckets at all.`,
      })

      for (const bucket of Object.values(REQUIRED_BUCKETS)) {
        const found = (data || []).find((b: any) => (b.id ?? b.name) === bucket)
        if (found) {
          const limit = (found as any).file_size_limit
          checks.push({
            name: `Bucket "${bucket}"`,
            status: 'ok',
            detail: `Exists. public: ${(found as any).public}. file_size_limit: ${
              limit ? `${(limit / 1024 / 1024).toFixed(0)} MB` : 'project default'
            }. allowed_mime_types: ${
              (found as any).allowed_mime_types
                ? JSON.stringify((found as any).allowed_mime_types)
                : 'any'
            }`,
          })
        } else {
          checks.push({
            name: `Bucket "${bucket}"`,
            status: 'fail',
            detail: `DOES NOT EXIST in project ${urlRef ?? '(unknown)'}. This is the cause of "The related resource does not exist" during upload. Create a bucket with this exact ID (case-sensitive), or repoint the environment variables at the project that has it.`,
          })
        }
      }
    }
  } catch (error) {
    checks.push({
      name: 'List storage buckets',
      status: 'fail',
      detail: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    })
  }

  // --- 4. Signed upload URL probe (does not upload anything) -------------
  for (const bucket of Object.values(REQUIRED_BUCKETS)) {
    try {
      const probePath = `diagnostics/probe-${Date.now()}.tmp`
      const { error } = await admin.storage.from(bucket).createSignedUploadUrl(probePath)
      checks.push({
        name: `Signed upload URL for "${bucket}"`,
        status: error ? 'fail' : 'ok',
        detail: error
          ? `Could not be created: ${error.message}`
          : 'Created successfully. Note: Supabase can sign a URL even when the bucket is missing, so this passing does not by itself prove the bucket exists - see the bucket check above.',
      })
    } catch (error) {
      checks.push({
        name: `Signed upload URL for "${bucket}"`,
        status: 'fail',
        detail: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  // --- 5. Database tables ------------------------------------------------
  for (const table of ['videos', 'video_categories', 'users'] as const) {
    try {
      const { count, error } = await (admin as any)
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        const missing =
          error.code === '42P01' || (error.message || '').includes('does not exist')
        checks.push({
          name: `Table public.${table}`,
          status: 'fail',
          detail: missing
            ? `DOES NOT EXIST in project ${urlRef ?? '(unknown)'}. Run the schema from DATABASE_SETUP.md in this project. Raw: ${error.message}`
            : `Not readable: ${error.message} (code ${error.code ?? 'none'})`,
        })
      } else {
        checks.push({
          name: `Table public.${table}`,
          status: 'ok',
          detail: `Exists. Row count: ${count ?? 'unknown'}`,
        })
      }
    } catch (error) {
      checks.push({
        name: `Table public.${table}`,
        status: 'fail',
        detail: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  // --- 6. Foreign key prerequisite: at least one category ----------------
  try {
    const { data, error } = await (admin as any)
      .from('video_categories')
      .select('id, name')
      .limit(5)

    if (!error) {
      checks.push({
        name: 'Categories available for videos.category_id',
        status: data && data.length ? 'ok' : 'warn',
        detail:
          data && data.length
            ? `${data.length} found (showing up to 5): ${data.map((c: any) => c.name).join(', ')}`
            : 'No categories exist. videos.category_id is NOT NULL and references video_categories(id), so saving a video will fail with a foreign key error until at least one category exists.',
      })
    }
  } catch {
    // Already reported by the table check above.
  }

  return { projectRef: urlRef, checks, buckets: bucketIds }
}
