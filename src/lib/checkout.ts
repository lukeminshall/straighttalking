// Client-side helpers that talk to the Netlify payment functions.
//
// Each returns gracefully when there is no backend (local dev, the file://
// viewer, or before Stripe keys are set), so callers can fall back to the demo
// flow. No card data is handled here: Stripe Checkout is a hosted redirect.

const CHECKOUT_URL = '/.netlify/functions/create-checkout'
const INVOICE_URL = '/.netlify/functions/request-invoice'

export interface CheckoutOrg {
  name: string
  email: string
  sites: number
}

export interface MaterialLine {
  name: string
  unitAmountPence: number
  quantity: number
}

export type CheckoutResult = 'redirected' | 'unavailable'

async function toCheckout(body: unknown): Promise<CheckoutResult> {
  try {
    const res = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return 'unavailable'
    const data = (await res.json()) as { url?: string }
    if (data && typeof data.url === 'string') {
      window.location.href = data.url
      return 'redirected'
    }
    return 'unavailable'
  } catch {
    return 'unavailable'
  }
}

/** Annual-fee subscription checkout for first-time signup. */
export function startSignupCheckout(org: CheckoutOrg, annualFeePence: number): Promise<CheckoutResult> {
  return toCheckout({ mode: 'signup', org, annualFeePence })
}

/** One-off materials checkout for the post-registration reorder flow. */
export function startMaterialsCheckout(org: CheckoutOrg, items: MaterialLine[]): Promise<CheckoutResult> {
  return toCheckout({ mode: 'materials', org, items })
}

export interface InvoiceRequest {
  org: CheckoutOrg
  billingEmail: string
  contactName?: string
  poNumber?: string
  notes?: string
}

/** Ask for an invoice (PO / net terms) instead of paying by card. */
export async function requestInvoice(payload: InvoiceRequest): Promise<{ ok: boolean; reference?: string }> {
  try {
    const res = await fetch(INVOICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as { ok?: boolean; reference?: string }
    return { ok: Boolean(data?.ok), reference: data?.reference }
  } catch {
    return { ok: false }
  }
}
