import type { PaymentMethod } from '@/types'

/**
 * Normalises a `payment_methods` row into the camelCase shape the UI uses.
 *
 * THIS FIXES A REAL BUG. The database columns are snake_case
 * (`account_number`, `account_type`), but the checkout renders
 * `paymentSelected.accountNumber` and `.accountType`. When checkout was
 * switched from the hard-coded constants to live database rows, those two
 * fields became `undefined` and the payment details rendered BLANK — the
 * customer could not see where to send the money.
 *
 * Every path that returns payment methods to the browser goes through here, so
 * the two shapes can never drift apart again.
 */
export function normalisePaymentMethod(row: any): PaymentMethod {
  return {
    id: String(row?.id ?? ''),
    name: String(row?.name ?? ''),
    description: row?.description ?? '',
    // Accept either shape, so a row from the database and an object from
    // lib/constants.ts both normalise correctly.
    accountNumber: row?.account_number ?? row?.accountNumber ?? '',
    accountType: row?.account_type ?? row?.accountType ?? '',
    instructions: row?.instructions ?? '',
    accountHolderName: row?.account_holder_name ?? row?.accountHolderName ?? undefined,
    qrCodeUrl: row?.qr_code_url ?? row?.qrCodeUrl ?? undefined,
    isActive: row?.is_active ?? row?.isActive ?? undefined,
    displayOrder: row?.display_order ?? row?.displayOrder ?? undefined,
  }
}

export function normalisePaymentMethods(rows: any[] | null | undefined): PaymentMethod[] {
  return (rows || []).map(normalisePaymentMethod)
}

/** The columns the app reads. Kept in one place so every query matches. */
export const PAYMENT_METHOD_COLUMNS =
  'id, name, description, account_number, account_type, instructions, account_holder_name, qr_code_url, is_active, display_order'

/** Same list without the columns added by sql/08, for the pre-migration retry. */
export const PAYMENT_METHOD_COLUMNS_LEGACY =
  'id, name, description, account_number, account_type, instructions'

/** True when a method has enough detail for a customer to actually pay. */
export function hasPayableDetails(method: PaymentMethod): boolean {
  return Boolean(method.accountNumber && method.accountNumber.trim())
}
