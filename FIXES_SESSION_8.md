# PrimeBot Markets — Full Project Audit & Future-Proof Update

**Build: `npm install` exit 0 · `tsc --noEmit` clean · `npm run build` exit 0, 35/35 pages.**
**The ZIP contains the COMPLETE project**, verified by directory comparison
against the uploaded base — zero files missing.

**Note on the base:** no new ZIP reached the uploads folder (newest is still
`2026-09-08 11:15`). This was built on my previous delivery, which is what you
have been deploying, per your instruction to proceed.

---

## Manual steps still required

| Step | Why |
|---|---|
| Run `sql/05_future_proof_setup.sql` | Bot/payment-method enable-disable, delivery columns, transaction-ID index |
| Run `sql/01_video_visibility_and_autoplay.sql` (if not already) | `videos.is_public`, `videos.autoplay` |
| Create private bucket **`bot-deliveries`** (Storage → New bucket, Public **OFF**, 100 MB) | Nowhere private currently exists for EA files. Not a duplicate of any existing bucket. |

Everything degrades gracefully until these are done: writes that touch the new
columns are retried without them, and the UI says which SQL to run. Existing
buckets `video-content`, `video-thumbnils`, `payment-proofs` are untouched.

---

## PART 1 — "Only plain objects… can be passed to Server Actions"

**Cause.** `app/actions/orders.ts` was a `'use server'` module and
`uploadPaymentProofFile(userId, orderId, file, …)` took the browser's `File` as
an argument. React cannot serialise a `File` across the Server Action boundary.

Wrapping the File in an object would not have helped — the File itself is the
unsupported value. Sending it as FormData would work but would push the whole
file through a Vercel serverless request body, capped at roughly 4.5 MB, below
the 10 MB the form allows.

**Fix — direct upload, exactly the flow you specified:**

```
browser
  → POST /api/orders/payment-proof/signed-url   (JSON, authenticated, ownership-checked)
  → PUT  file directly to Supabase Storage      (private payment-proofs bucket)
  → POST /api/orders/payment-proof/finalize     (JSON; verifies the object exists,
                                                 then records its PATH on the order)
```

Only JSON crosses the server boundary. Limits preserved exactly as before:
**10 MB**, JPG/PNG/GIF/WebP/PDF. Bucket stays **private**; admin viewing still
uses on-demand signed URLs.

Security in the new routes:
- The path is server-generated as `<verified user id>/<orderId>/<timestamp>-<name>`.
- `finalize` refuses any path not starting with that prefix, so one customer
  cannot attach another customer's uploaded file to their order.
- The object is confirmed to exist before the order is updated, so a failed
  browser upload cannot mark an order as having a proof.
- A zero-row update is treated as failure rather than success.

Real errors are mapped and surfaced: missing bucket, over bucket size limit,
disallowed MIME type, policy denial, plus a 60-second stall detector and
30-second request timeouts so it can never hang on "Uploading…".

## PART 2 — Order creation is now server-authoritative

`POST /api/orders/create` accepts only `botId`, `paymentMethodId`,
`transactionId`, `fullName`. The server determines:

| Value | Source |
|---|---|
| `user_id` | the verified Bearer token — a customer cannot order for another user |
| `bot_name`, `bot_price` | read from the `bots` table |
| `payment_method` | validated against enabled `payment_methods` rows |

Editing a price in devtools and buying a $600 bot for $1 is therefore
impossible. Disabled or non-purchasable bots are refused. `bot_name` and
`bot_price` are copied onto the order, so **existing orders keep the price they
were placed at** even after an admin changes the bot.

## PART 3 — Retry without duplicate orders

Retained and now applies to the new flow. `handleSubmitOrder` creates an order
only when `orderId` is null; on retry it reuses the existing ID and re-runs the
upload plus finalize only. Failure never advances the step, never shows success,
and never clears the file or the ID. The error panel names the ID and states the
retry will not duplicate; the button relabels to "Retry Payment Proof Upload".

## PART 4 — My Orders authentication

**Cause.** `app/api/orders/list/route.ts` called
`supabaseServer.auth.getUser()` with no argument. `supabaseServer` is the
**service-role** client, built with `persistSession: false` and no user context,
so that call always resolved to `null` and every request returned 401 — My
Orders could never load, for anybody. (It did not leak other customers' orders;
it simply never worked.)

**Fix.** New `getUserFromRequest()` in `lib/supabase/server.ts` verifies the
request's Bearer token via `supabaseServer.auth.getUser(token)` — a real
server-side check, so a forged token cannot impersonate anyone. The query filters
on that verified id, never on a body or query value. The dashboard now sends the
token, shows a real error with a retry and a "Sign in again" link instead of an
empty list, and works after refresh. Storage paths are no longer sent to the
browser at all — only `has_payment_proof` / `has_delivery_file` booleans.

## PART 5 — Transaction ID reuse

Checked server-side before insert, compared **case-insensitively and trimmed**,
so `"ABC 123 "` cannot be reused as `"abc123"`. Distinct messages for your own
prior order versus another customer's. A retry on an existing order never
reaches this check. `23505` from the database is also handled, in case you add
the optional unique index. `sql/05` adds `idx_orders_transaction_id`; the
**unique** index is left commented with a duplicate-finding query first, because
a unique index cannot be created while duplicates exist.

## PART 6 — Bot Management

The `bots` table already existed and was seeded with the three bots, so this
extends it — no new table, no duplicate bot system, no re-inserted rows.

- `GET/POST /api/admin/bots`, `PUT/DELETE /api/admin/bots/[id]`
- New **Bot Management** tab: view, add, edit name/type/description/price/features,
  show/hide on the website, open/close for purchase
- Public `GET /api/bots` and server-side `getActiveBots()`
- Home, `/bots`, `/pricing` and checkout now read the database
- `lib/constants.ts` BOTS is **fallback only** for database outages; it never
  prices an order
- **Delete is refused when a bot has orders** (`orders.bot_id` references
  `bots(id)`) — disable instead, which preserves history
- PRIME SCALPER EA, PRIME HEDGE EA, PRIME AI ALGORITHM EA all preserved

## PART 7 — Payment Method Management

Same approach on the existing `payment_methods` table.

- `GET/POST /api/admin/payment-methods`, `PUT/DELETE /api/admin/payment-methods/[id]`
- New **Payment Methods** tab: add, edit name / account number / account type /
  description / instructions, enable/disable
- Public `GET /api/payment-methods` returns **only enabled** methods
- Checkout displays only enabled methods and validates the choice server-side
- JazzCash, Easypaisa, Binance Pay, Bybit Pay preserved with current details
- Only customer-facing fields are returned; no secret credentials are stored or
  exposed by these endpoints

## PART 8 — Secure bot file delivery

- **Private `bot-deliveries` bucket** (must be created once — see above)
- `POST /api/admin/orders/[id]/delivery` → signed upload URL; the admin's
  browser uploads direct to the private bucket. The route verifies the bucket
  exists first and names it if missing.
- `PUT /api/admin/orders/[id]/delivery` → confirms the object exists, records
  `delivery_file_path` / `delivery_file_name`, optionally sets
  `status='delivered'` and `delivered_at`
- **Marking delivered is refused unless the payment is verified** — you cannot
  deliver an unapproved order
- `GET /api/orders/[id]/download` → **5-minute** signed URL, only for the
  verified owner of a verified/delivered order. A different customer gets `404`,
  byte-identical to a nonexistent order, so order IDs cannot be probed for
  existence. The storage path is never sent to the browser.
- Admin order modal: upload UI, current file, delivery timestamp
- Customer dashboard: per-order delivery status for all four states, plus a
  **Download Bot File** button when ready
- No public URL is ever generated for a delivery file
- Existing approved/delivered orders are unaffected — the new columns default to
  NULL

## PART 9 — Video system database consistency

Unchanged and verified intact. `published`, `is_public`, `autoplay` are all
supported by `sql/01_video_visibility_and_autoplay.sql`, which is idempotent and
additive. `sql/04_inspect_video_records.sql` reports which columns actually
exist in your project. No duplicate videos table, no video records replaced.
Bucket IDs confirmed still `video-content` and `video-thumbnils`; a project-wide
search finds **zero** references to `videos-content` or `video-thumbnails`.

## PART 10 — Admin Panel preservation

One Admin Panel, now five tabs: **Orders & Payments · Video Tutorials · Video
Categories · Bot Management · Payment Methods**, with delivery management inside
the existing order modal. Admin authentication is unchanged (in-memory verified
cache, no re-verification on tab focus).

Every sensitive operation verifies the admin **server-side** via
`getAdminUserFromRequest`, which re-reads `users.is_admin` with the service role
key. Browser-side checks control only what is displayed. Verified by request:
all admin endpoints return 403/401 with no token and with a forged token.

## PART 11 — Technical debt

- **Merge conflict markers: 0.** Searched every file for `<<<<<<<`, `=======`,
  `>>>>>>>`, `|||||||`, excluding only `node_modules` and `.next`.
- **`.old` files** — `components/Header.tsx.old`, `app/admin/page.tsx.old`,
  `app/payment/page.tsx.old`. Verified **not imported anywhere** and not routed
  by Next.js (it only routes `.tsx`/`.ts`/`.js`/`.jsx`). Left byte-identical
  rather than deleted, since they are inert and are your backups.
- **`app/actions/orders.ts` removed.** Nothing imported it after the rewrite,
  and it was a *second* order-creation path that trusted a client-supplied
  `userId`, `botName` and `botPrice` — a live security liability and a duplicate
  system. A copy is kept at `legacy-backups/orders-server-action.ts.removed`.
  While removing it I briefly deleted `app/actions/admin.ts` as well; it was
  restored from the previous ZIP and is byte-identical.

## PART 12 — Migration safety

`sql/05_future_proof_setup.sql` uses only `ALTER TABLE … ADD COLUMN IF NOT
EXISTS` and `CREATE INDEX IF NOT EXISTS`. It creates no tables, **drops
nothing**, **deletes no rows**, and inserts no duplicate defaults — the only
`UPDATE`s set `display_order` and are guarded with `AND display_order = 0` so
re-running never overwrites an admin's ordering. Fully idempotent.

## PART 13 — End-to-end audit

| | Workflow | Result |
|---|---|---|
| A | Signup / login | Unchanged, working |
| B | Dashboard / My Orders | **Fixed** (Part 4) |
| C | Bot selection | Now from database |
| D | Price verification | **Fixed** — server-authoritative (Part 2) |
| E | Payment method selection | Now from database, enabled only |
| F | Order creation | **Fixed** — `.select().single()`, server-derived values |
| G | Proof selection | Type + size validated client and server side |
| H | Proof upload | **Fixed** — direct signed upload (Part 1) |
| I | Proof retry after failure | Real error, nothing cleared |
| J | No duplicate order on retry | Order ID reused |
| K | Transaction ID duplicates | **Added** (Part 5) |
| L | Admin order viewing | Working |
| M | Admin proof viewing | Signed URL or explicit reason, never a broken link |
| N | Approve payment | Unchanged, working |
| O | Reject payment | Unchanged, working |
| P | Private bot file delivery | **Added** (Part 8) |
| Q | Customer secure download | **Added** — 5-min signed URL, ownership-checked |
| R–X | Video upload / edit / delete / admin listing / public tutorials / categories / published-public-autoplay | Untouched, verified intact |

## PART 14 — Verification

```
merge conflict markers          0
tsc --noEmit                    clean
npm install                     exit 0
npm run build                   exit 0 — "Compiled successfully", 35/35 pages
```

Runtime under `next start`: `/`, `/payment`, `/admin`, `/dashboard`,
`/video-tutorials`, `/bots`, `/pricing`, `/faq` all 200. Admin and customer APIs
reject unauthenticated and forged tokens.

---

## Files changed

### Modified (9)

| File | Change |
|---|---|
| `lib/supabase/server.ts` | Added `getUserFromRequest()` (token-verified) and `BOT_DELIVERY_BUCKET` |
| `app/api/orders/list/route.ts` | Rewritten — token-bound auth; storage paths no longer exposed |
| `app/payment/page.tsx` | Uses the new order + proof APIs; live bots/methods; no Server Action |
| `app/dashboard/page.tsx` | Sends the Bearer token; real error state; delivery status + secure download |
| `app/admin/page.tsx` | Two new tabs; delivery upload handler and UI in the order modal |
| `app/bots/page.tsx` | Reads admin-managed bots |
| `app/pricing/page.tsx` | Reads admin-managed bots |
| `app/page.tsx` | Reads admin-managed bots |
| `app/actions/admin.ts` | Restored unchanged after the accidental directory removal |

### Added (12)

| File | Purpose |
|---|---|
| `sql/05_future_proof_setup.sql` | The one migration to run |
| `lib/payment-proof-upload.ts` | Browser-side direct proof upload with progress and stall detection |
| `lib/bots-server.ts` | Server-side reads of admin-managed bots and payment methods |
| `app/api/orders/create/route.ts` | Server-authoritative order creation |
| `app/api/orders/payment-proof/signed-url/route.ts` | Ownership-checked signed upload URL |
| `app/api/orders/payment-proof/finalize/route.ts` | Verifies the object, attaches it to the order |
| `app/api/orders/[id]/download/route.ts` | Secure customer download |
| `app/api/admin/orders/[id]/delivery/route.ts` | Admin delivery upload + finalize |
| `app/api/admin/bots/route.ts`, `app/api/admin/bots/[id]/route.ts` | Bot CRUD |
| `app/api/admin/payment-methods/route.ts`, `.../[id]/route.ts` | Payment method CRUD |
| `app/api/bots/route.ts`, `app/api/payment-methods/route.ts` | Public reads |
| `app/admin/BotManagement.tsx`, `app/admin/PaymentMethodManagement.tsx` | Admin UIs |

### Removed (1)

`app/actions/orders.ts` — see Part 11. Copy retained in `legacy-backups/`.

---

## What I could not verify

I have no access to Supabase project `fzepghuiqnmbfehnrgrc`, so I could not
place a real order, upload a real proof, or download a real delivery file. Every
change was verified by reading the actual code paths, typechecking, building,
and exercising the routes under `next start`. The four defects in Parts 1, 2, 4
and the duplicate-order path were confirmed by inspection — the exact broken
lines are quoted in this report and in `FIXES_SESSION_7.md`.

After deploying, the highest-value checks are: **My Orders loads** (Part 4),
**a >5 MB payment proof uploads** (Part 1), and **a customer download works
while another account gets 404** (Part 8).
