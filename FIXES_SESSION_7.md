# PrimeBot Markets — Order Creation & Payment Proof Repair

**Build status: `npm install` and `npm run build` both completed successfully.**
Exit code 0, "Compiled successfully", 36/36 static pages.

**Files changed this round: 5 modified, 1 added (this document), 0 deleted.**
**No SQL file was added** — see Task 6.

**The ZIP contains the COMPLETE project**, not only modified files: every file
from the uploaded base is present (verified by directory comparison), plus the
additions from this and previous rounds.

---

## Task 1 — `createOrder()` never returned the created order

**File: `lib/supabase/server.ts`**

The insert had no `.select()`:

```ts
const { data, error } = await (supabaseServer as any).from('orders').insert([ … ])
if (error) { … }
return data          // supabase-js v2 returns data: null for a bare insert
```

supabase-js v2 returns `data: null` for an insert without `.select()`. The row
*was* written, but nothing came back. `createNewOrder` then checked
`if (!orderData || orderData.length === 0) throw new Error('Failed to create order')`,
so **every single order threw** — and because it threw before the proof step,
no order ID was ever available to attach a payment proof to.

Fixed by integrating `.select().single()` into the existing implementation:

```ts
const { data, error } = await (supabaseServer as any)
  .from('orders')
  .insert([{ …, payment_proof_url: paymentProofUrl ?? null, status: 'pending_verification' }])
  .select()
  .single()
```

`.single()` returns the row as an object rather than an array, so the ID is
available immediately, before the payment proof is attached. Also added:

- Postgres error mapping — `23503` reports a foreign key problem naming the
  user/bot reference, `42501` reports a row-level-security denial. Both include
  the raw Supabase message.
- A guard for the odd case of no error but no returned row, which would
  previously have surfaced as a confusing `undefined`.

**File: `app/actions/orders.ts`** — updated to match the new single-object
return (`orderData.id` instead of `orderData[0].id`). `createOrder` has exactly
one caller, so nothing else needed changing.

## Task 2 — the code explicitly faked success

**File: `app/payment/page.tsx`**

```ts
} catch (uploadError) {
  console.error('Upload error:', uploadError)
  // Continue even if upload fails - order is created
}
toast.success('Order submitted! Moving to confirmation...')
setTimeout(() => handleNext(), 1000)
```

The real error went to the console, a success toast fired, and step 5 was shown
regardless. Fixed: the upload is now awaited outside any swallowing `catch`. On
failure the handler:

- does **not** advance the step,
- does **not** show a success toast,
- does **not** clear the selected file, the name, or the transaction ID,
- does **not** discard the order ID,
- renders a red panel with the **real** error message and the note "Nothing was
  cleared. Your details and selected file have been kept."

Success is now the only path that advances, and the toast says
"Order submitted and payment proof attached." The submit button also reports the
current stage while working ("Creating your order…", "Uploading payment
proof…").

A missing file is now caught explicitly rather than skipping the upload block
entirely, which previously meant an order with no proof could reach step 5.

## Task 3 — retries created duplicate orders

**File: `app/payment/page.tsx`**

`handleSubmitOrder` called `createNewOrder(...)` unconditionally on every press,
so each retry inserted another order. The `orderId` state existed but was never
consulted.

Fixed:

```ts
let currentOrderId = orderId
if (!currentOrderId) {
  // …create the order, once…
  setOrderId(currentOrderId)
}
// …then always attach the proof to currentOrderId…
```

A new order is created **only** when `orderId` is null — a genuinely new
checkout. On retry the existing ID is reused and only the upload plus the order
update are retried. The error panel says so explicitly, naming the ID:

> Your order has already been created (ID `…`). Pressing Submit again will
> attach the payment proof to that same order — it will **not** create a
> duplicate order.

The button relabels itself to "Retry Payment Proof Upload" once an order exists,
so the behaviour is visible before it is pressed.

## Task 4 — `payment-proofs` bucket integration preserved

**File: `lib/supabase/server.ts`**

The bucket ID is unchanged: `payment-proofs`, private, path stored in the
database, signed URLs generated on demand. It is now declared once as an
exported constant `PAYMENT_PROOF_BUCKET` so the upload helper and the
signed-URL helper cannot drift apart — the same problem that caused the video
bucket mismatch.

`uploadPaymentProof` previously swallowed failures:

```ts
if (error) { console.error(…); return null }   // real reason discarded
```

The caller then threw a generic "Failed to upload payment proof". It now
**throws with the real Supabase Storage message**, mapped to a specific cause
where recognisable: bucket missing, file over the bucket's size limit,
disallowed MIME type, or storage policy denial. The raw message is always
appended.

Also added: the filename is sanitised (`[^a-zA-Z0-9._-]` → `_`, capped at 80
chars) because storage object keys reject some characters, and `contentType` is
passed through so the proof opens correctly in the browser rather than
downloading as binary.

**File: `app/actions/orders.ts`** — one more real gap closed. The database
update was checked only for `result.error`, but `.update()` reports **no error
when it matches zero rows**. A wrong order ID, or an order belonging to another
user, would have left the proof orphaned in storage with the order holding no
reference, and the user told everything succeeded. Now a zero-row update fails
explicitly, naming the storage path so the file can be traced.

## Task 5 — admin payment proof retrieval

**Files: `app/api/admin/orders/route.ts`, `app/admin/page.tsx`**

The API fell back to the raw storage path when signing failed:

```ts
payment_proof_url: signedUrl || order.payment_proof_url,  // fallback to path
```

The Admin Panel put that straight into an `href`. A path like
`<uuid>/<uuid>/1712-proof.png` is a **relative URL**, so clicking "View
Screenshot" navigated to `/admin/<uuid>/<uuid>/1712-proof.png` — a 404, with
nothing to indicate the file simply could not be signed.

Fixed by reporting the path and the signed URL as separate fields:

| Field | Meaning |
|---|---|
| `payment_proof_url` | a real signed URL, or `null` if signing failed |
| `payment_proof_path` | the stored storage path, always |
| `payment_proof_signed` | whether a usable link exists |
| `payment_proof_error` | why signing failed |

Rows that legitimately hold a full `https://` URL (older records) pass straight
through. The Admin Panel now shows either a working link with "Secure link,
valid for 1 hour", or a yellow panel reading "Proof recorded but not viewable"
with the reason and the stored path — never a broken link.

## Task 6 — no SQL file added

I checked the existing schema in `DATABASE_SETUP.md` before writing anything:

```sql
CREATE TABLE IF NOT EXISTS orders (
  …
  payment_proof_url TEXT,
  …
);
```

`payment_proof_url` **already exists**, and the application stores a storage
path in it as `TEXT`. No column is missing and no migration is required, so
**no `PAYMENT_PROOF_SETUP.sql` was created** — per your instruction not to add
unnecessary SQL files. The four existing files in `sql/` are unchanged.

## Task 7 — Git merge conflict markers

Searched **every file** in the project (all extensions, excluding only
`node_modules` and `.next`) for `<<<<<<<`, `=======`, `>>>>>>>` and `|||||||`:

```
files with conflict markers: 0
```

**Zero unresolved markers.** Note that the version I worked from had none to
begin with — if your intended ZIP contains conflicts, they are in a copy I never
received (nothing new arrived in uploads; the newest file is still dated
2026-09-08 11:15). Re-upload it and I will resolve them against that base.

## Task 8 — nothing else broken

Verified unchanged and working:

- **Video bucket IDs** still `video-content` and `video-thumbnils`. Zero active
  references to `videos-content` or `video-thumbnails`.
- **Video system** — categories, management, upload, tutorials, public/private,
  autoplay: no files touched.
- **Admin Panel** — one panel, three tabs. Only the payment-proof display block
  changed.
- **Authentication, orders, users, bots, prices, pages, design** — untouched.
- No duplicate systems, components, routes, APIs, tables or Supabase clients
  were created. No dummy data added.

## Task 9 — build

```
npm install   -> success
tsc --noEmit  -> clean
npm run build -> exit 0, "Compiled successfully", 36/36 static pages
```

Runtime verification under `next start`:

| Route | Result |
|---|---|
| `/`, `/payment`, `/admin`, `/dashboard`, `/video-tutorials`, `/bots`, `/faq` | 200 |
| `GET /api/admin/orders` without a token | 403 |
| `GET /api/admin/diagnostics` without admin | 403 |

## Task 10 — the workflow, end to end

| Step | Status |
|---|---|
| 1. Order creation | Fixed — `.select().single()` |
| 2. Created record returned | Fixed — returns the row object |
| 3. Order ID available after creation | Fixed — guarded, throws if absent |
| 4. Payment proof selected | Validated before submit; type and size checked |
| 5. Payment proof uploaded | Fixed — real errors thrown, filename sanitised |
| 6. Path saved to the correct order | Fixed — zero-row update now fails loudly |
| 7. Real error shown on failure | Fixed — red panel, no fake success |
| 8. Retry creates no duplicate | Fixed — existing order ID reused |
| 9. Successful upload continues | Only success advances to step 5 |
| 10. Admin retrieves the proof | Fixed — signed URL or explicit reason |

---

## Files changed

| File | Change |
|---|---|
| `lib/supabase/server.ts` | `.select().single()` on order insert; DB error mapping; `PAYMENT_PROOF_BUCKET` constant; proof upload throws the real error; filename sanitising; `contentType` |
| `app/actions/orders.ts` | Adapted to the single-object return; zero-row update now fails; error messages name the storage path |
| `app/payment/page.tsx` | Order created once and ID reused on retry; upload failure never fakes success or advances; error panel; stage labels on the button |
| `app/api/admin/orders/route.ts` | Signed URL and raw path reported separately; signing failure reported instead of a broken link |
| `app/admin/page.tsx` | Payment proof block renders a working link or an explicit "not viewable" panel; extended `Order` type |
| `FIXES_SESSION_7.md` | This document (new) |

### What I could not verify

I have no access to Supabase project `fzepghuiqnmbfehnrgrc`, so I could not
place a real order or upload a real proof file. Every fix above was verified by
reading the actual code paths, typechecking, building, and exercising the routes
under `next start`. The defects themselves were confirmed by inspection, not
inferred — the exact broken lines are quoted above.
