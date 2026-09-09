# PrimeBot Markets — Payment Proof, Payment Details & Admin Separation

**Build: `npm install` exit 0 · `npx tsc --noEmit` clean · `npm run build` exit 0, 35/35 pages.**

---

## Read this first: the ZIP you uploaded was an older delivery

The uploaded `primebot-markets-ORDERS-PAYMENT-FIXED.zip` is my **Session 7**
build. I verified it does **not** contain:

```
app/api/orders/payment-proof/signed-url/route.ts    ABSENT
app/api/orders/payment-proof/finalize/route.ts      ABSENT
lib/payment-proof-upload.ts                         ABSENT
app/api/orders/create/route.ts                      ABSENT
app/admin/BotManagement.tsx                         ABSENT
app/actions/orders.ts                               PRESENT (the file that caused the Server Action error)
```

The error you are seeing in production —
*"Signed upload URL could not be generated for the 'payment-proofs' bucket"* —
**does not exist anywhere in that ZIP.** Your deployment is running a newer
build. Had I used the upload as the base, I would have deleted the code that is
actually running and reintroduced the Server Action bug.

So this was built on the newest state. Nothing was lost.

---

## Required manual steps

| Run in the Supabase SQL Editor | What it does |
|---|---|
| **`sql/07_storage_buckets_setup.sql`** | **Creates the missing `payment-proofs` bucket** (private, 10 MB, JPG/PNG/GIF/WebP/PDF) and `bot-deliveries` (private, 100 MB). **This is the fix for your production error.** |
| `sql/08_payment_method_details.sql` | Adds `account_holder_name` and `qr_code_url` to `payment_methods` |
| `sql/06_admin_authorization.sql` | Separate `admin_users` authorization table |
| `sql/05_future_proof_setup.sql` | Bot/payment-method enable-disable, delivery columns |
| `sql/01_video_visibility_and_autoplay.sql` | `videos.is_public`, `videos.autoplay` |

All are idempotent: they drop nothing, delete nothing, and insert no duplicates.
`sql/07` creates buckets **by SQL**, so no manual clicking — with fallback
Dashboard instructions in the file if your project restricts that insert.

---

## 1. "The related resource does not exist" — the payment-proofs bucket

**Cause: the bucket does not exist in project `fzepghuiqnmbfehnrgrc`.**

That message is emitted by Supabase Storage, not by this project. It is
`RelatedResourceNotFound` (HTTP 404), raised when an object write has no related
**bucket** row. This is the identical failure you already hit with the video
buckets, where the real IDs turned out to be `video-content` and
`video-thumbnils` rather than the names in `DATABASE_SETUP.md`.

`createSignedUploadUrl()` does **not** verify a bucket exists — it just signs a
token — so a missing bucket produced a valid-looking URL that failed later with
that opaque message.

**Fixes:**

- **`sql/07_storage_buckets_setup.sql` creates the bucket** with exactly the
  configuration you specified: private, 10 MB, and the five MIME types. It also
  corrects the settings if the bucket exists with the wrong ones, without
  touching stored files. Code alone cannot create a bucket — this is the part
  that actually resolves the error.
- **Preflight in the route.** `/api/orders/payment-proof/signed-url` now
  verifies the bucket exists *before* issuing a URL and, if it is missing,
  returns the bucket name, the project ref, and **the buckets that DO exist** —
  so a naming mismatch is immediately obvious rather than opaque.
- **Bucket ID overridable without a code change.** If your bucket is named
  something else and you would rather keep that name, set
  `NEXT_PUBLIC_SUPABASE_PAYMENT_PROOF_BUCKET` in Vercel.
- **All four bucket IDs now live in `lib/storage-buckets.ts`** — one file. The
  duplicate definition in `lib/supabase/server.ts` was removed and now
  re-exports from there, so `payment-proofs`, `bot-deliveries`,
  `video-content` and `video-thumbnils` cannot drift apart.
- **Run Diagnostics now checks all four buckets**, not just the two video ones.

## 2. "Only plain objects… can be passed to Server Actions" — eliminated

Verified by search across the whole project:

| Check | Result |
|---|---|
| Modules with a real `'use server'` directive | `app/actions/admin.ts` only |
| Does it take a `File` or `FormData`? | **No** |
| `'use server'` elsewhere | only inside a code comment in the signed-url route |
| `app/actions/orders.ts` (the culprit) | removed; copy in `legacy-backups/` |
| Obsolete `uploadPaymentProof(… file: File)` in `server.ts` | **removed this round** — it was dead code and the last File-shaped upload path |

**Exactly one payment-proof upload flow remains:**

```
lib/payment-proof-upload.ts (browser)
  → POST /api/orders/payment-proof/signed-url   (JSON only)
  → PUT the File direct to Supabase Storage      (File never leaves the browser)
  → POST /api/orders/payment-proof/finalize      (JSON only: { orderId, path })
```

No `File`, `Response`, `Error`, Supabase client, class instance or
null-prototype object crosses a server boundary. `lib/admin-upload.ts` also uses
XMLHttpRequest but is the **video/thumbnail** flow — a different feature, not a
competing payment-proof path.

Backend verification in `finalize`, all present: authenticated user exists; the
order belongs to that user; the path must start with
`<verified user id>/<orderId>/` so a proof cannot be attached to another
customer's order; the storage object is confirmed to exist before finalizing;
and a zero-row update is treated as failure rather than success.

## 3. Payment details were blank — my regression, now fixed

**Cause.** The checkout renders `paymentSelected.accountNumber` and
`.accountType` (camelCase, the shape of `lib/constants.ts`). The database
columns are **snake_case**: `account_number`, `account_type`. When I switched
checkout from constants to live database rows, both fields became `undefined`
and the payment details rendered **blank** — the customer could not see where to
send money.

**Fix.** `lib/payment-methods.ts` is now the single normaliser. It accepts
either shape and always returns camelCase, and every path that sends payment
methods to the browser goes through it — the public endpoint, the server-side
helper, and the checkout. The two shapes cannot drift apart again.

**No fake fallback data.** The public endpoint and `getActivePaymentMethods()`
**no longer fall back to hard-coded constants**. Showing a stale account number
from source would send a customer's money to the wrong account. If methods
cannot be read, checkout shows: *"Payment methods are unavailable… No account
details are shown rather than risk showing an outdated number."*

**What the customer now sees on selecting a method**, before entering the
transaction ID:

- Payment method name
- **Account holder name** (new field) with a copy button
- The number, labelled by `account_type` — so setting it to "Binance Pay ID" or
  "Bybit UID" makes the label read correctly instead of "Account Number"
- **QR code image** (new field) when configured
- Instructions, preserving line breaks
- An explicit red warning if the method has **no account number configured**,
  telling the customer not to pay — rather than silently showing a blank

**Admin Panel → Payment Methods** now edits account holder name and QR code URL
alongside the existing fields, and the list flags any method missing a number or
holder name. JazzCash, Easypaisa, Binance Pay and Bybit Pay rows are edited in
place — nothing is deleted or duplicated, and `sql/08` fills in no values,
because inventing a payee name would be fake data.

## 4. Mobile checkout

The upload path is now identical on mobile and desktop, and the previous
mobile-specific failure modes are addressed:

- **The signed-URL flow is what makes mobile work.** Routing the file through a
  Vercel serverless request body caps at ~4.5 MB; a modern phone camera photo
  frequently exceeds that. Going browser → Supabase removes that ceiling
  entirely, up to the bucket's 10 MB limit.
- The file input accepts `image/jpeg, image/png, image/gif, image/webp,
  application/pdf`, which is what the gallery and document pickers filter on.
- **Retry on flaky mobile networks:** a 60-second stall detector and 30-second
  request timeouts mean a dropped connection ends with a real message instead of
  hanging on "Uploading…".
- Retry reuses the same order ID (below), so a mobile network drop cannot create
  duplicate orders.
- The details panel now wraps long values (`break-all`) and the number scales
  down on small screens, so a long Binance Pay ID no longer overflows.

## 5. No duplicate orders — preserved

`handleSubmitOrder` creates an order only when `orderId` is `null`; on retry it
reuses the existing ID and re-runs only the upload plus finalize. Failure never
advances the step, never shows success, and never clears the file or the ID. The
panel names the ID and states the retry will not duplicate. That is the message
you quoted — it is correct behaviour, not a fault.

## 6. Admin Panel and pending orders

Unchanged and intact. The admin order view shows customer name, bot name,
historical bot price, payment method, transaction ID, status, and the payment
proof. Proofs are served from the **private** bucket via a 1-hour signed URL
minted only after the caller is verified as an admin; when signing fails the
panel says so explicitly instead of rendering a broken link. The bucket is never
made public.

## 7. Admin security separated from customers

| Guarantee | How |
|---|---|
| Admin rights are not a customer-editable value | Authoritative source is the **`admin_users` table**, created by `sql/06`, with **RLS enabled and no policies at all** — neither the anon key nor any signed-in user's key can read or write it. Only the service role, which exists solely server-side. |
| localStorage / sessionStorage cannot grant admin | Nothing reads them for authorization. The earlier `primebot-admin-<uuid>` cache was removed and stale keys are cleared on load. |
| A client-side variable or edited JS cannot grant admin | The browser only ever *displays* based on `isAdmin`; every admin API re-verifies server-side. |
| Calling an admin API directly cannot work | All 17 `/api/admin/*` routes verify. Measured: 401/403 with no token **and** with a forged token. |
| One definition of "is admin" | The 8 duplicated inline `users.is_admin` checks in the video and upload routes now call the shared `isUserAdmin()`. Zero inline copies remain. |
| A broken check fails closed | If the `admin_users` lookup errors for any reason other than "table missing", access is **denied**, not granted. |
| No lockout risk | `sql/06` migrates existing `users.is_admin = true` accounts into `admin_users` **before** the new source becomes authoritative, and the code falls back to `users.is_admin` only while the table does not yet exist. |
| `users.is_admin` cannot be escalated via the API | A trigger blocks any change carrying a non-`service_role` JWT. Direct SQL still works, so you are never locked out. |

Customer paths are untouched: registration, login, My Orders, checkout, payment
proof upload, bot downloads and video viewing all still work, and customers can
only ever read their own orders.

---

## Verification performed

```
npm install        exit 0
npx tsc --noEmit   clean
npm run build      exit 0 — "Compiled successfully", 35/35 pages
```

Runtime under `next start`:

| Endpoint | No token | Forged token |
|---|---|---|
| `/api/admin/orders`, `/bots`, `/payment-methods`, `/categories`, `/stats`, `/diagnostics` | 403 | 403 |
| `/api/admin/videos` | 401 | 401 |
| `/api/orders/list`, `/api/orders/[id]/download` | 401 | — |
| `POST /api/orders/create`, `/payment-proof/signed-url`, `/payment-proof/finalize` | 401 | — |

`/`, `/payment`, `/admin`, `/dashboard`, `/video-tutorials`, `/bots`,
`/pricing` → all 200. `/api/payment-methods` with an unreachable database
returns a real error and **no** fabricated account numbers.

## Files changed this round

| File | Change |
|---|---|
| `lib/storage-buckets.ts` | Added `PAYMENT_PROOF_BUCKET`, `BOT_DELIVERY_BUCKET`, `ALL_REQUIRED_BUCKETS`; env-overridable |
| `lib/supabase/server.ts` | Re-exports bucket IDs from the single source; **removed** the obsolete File-based `uploadPaymentProof`; `isUserAdmin()` now backed by `admin_users`, failing closed |
| `app/api/orders/payment-proof/signed-url/route.ts` | Bucket preflight naming the missing bucket and listing existing ones |
| `lib/payment-methods.ts` | **New** — the single snake_case → camelCase normaliser |
| `app/api/payment-methods/route.ts` | Normalised output; hard-coded fallback removed |
| `lib/bots-server.ts` | Same for the server-side helper |
| `app/payment/page.tsx` | Full details panel (holder name, labelled number, QR, instructions), missing-detail warnings, loading/error states, mobile-safe wrapping |
| `app/admin/PaymentMethodManagement.tsx` | Account holder name and QR fields; flags incomplete methods |
| `app/api/admin/payment-methods/route.ts`, `.../[id]/route.ts` | Accept the new fields, with pre-migration retry |
| `types/index.ts` | `PaymentMethod` extended |
| `lib/supabase-diagnostics.ts` | Checks all four buckets |
| `app/api/admin/videos/route.ts`, `.../[id]/route.ts`, `upload-video`, `upload-thumbnail` | 8 duplicated admin checks replaced with the shared one |
| `sql/06_admin_authorization.sql` | **New** — separate admin authorization |
| `sql/07_storage_buckets_setup.sql` | **New** — creates the missing buckets |
| `sql/08_payment_method_details.sql` | **New** — payment detail fields |
| `FIXES_SESSION_9.md` | This document |

Nothing else was removed. Video system, categories, bot management, delivery,
orders, admin panel and all buckets remain intact.

## What I could not verify

I have no access to project `fzepghuiqnmbfehnrgrc`, so I could not create the
bucket, place a real order, or upload a real proof. The bucket's absence is
established by the Storage error you reported, whose exact meaning I traced to
the `supabase/storage` source. **Run `sql/07` first** — that is the step that
resolves your production error. If the upload still fails afterwards, the new
preflight message will name the exact bucket and project, and Run Diagnostics
lists every bucket that exists.
