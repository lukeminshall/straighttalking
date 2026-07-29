// Creates a Stripe Checkout Session, server-side. No card data ever touches the
// client: the browser is redirected to Stripe's hosted page.
//
// Two modes:
//   signup    -> a subscription for the flat annual fee (materials come later)
//   materials -> a one-off payment for printed materials (from the Reorder page)
//
// Inline price_data is used so nothing needs pre-creating in the Stripe
// dashboard. Set STRIPE_SECRET_KEY in the Netlify environment to enable it;
// until then this returns 501 and the app falls back to its demo flow.
import Stripe from 'stripe'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return json(501, { error: 'Stripe is not configured yet' })

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON body' })
  }

  const stripe = new Stripe(key)
  const origin = event.headers.origin || process.env.PUBLIC_URL || 'https://straighttalking.co.uk'
  const org = payload.org || {}
  const mode = payload.mode === 'materials' ? 'materials' : 'signup'

  try {
    let session
    if (mode === 'signup') {
      const annualFeePence = Number.isInteger(payload.annualFeePence) ? payload.annualFeePence : 20000
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: org.email || undefined,
        allow_promotion_codes: true,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'gbp',
              product_data: { name: 'Straight Talking annual plan' },
              unit_amount: annualFeePence,
              recurring: { interval: 'year' },
            },
          },
        ],
        subscription_data: { metadata: { org_name: org.name || '', sites: String(org.sites || 1) } },
        metadata: { kind: 'signup', org_name: org.name || '', sites: String(org.sites || 1) },
        success_url: `${origin}/setup?status=paid&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/setup?status=cancelled`,
      })
    } else {
      const items = Array.isArray(payload.items) ? payload.items : []
      const line_items = items
        .filter((i) => i && i.name && Number.isInteger(i.unitAmountPence) && i.unitAmountPence > 0 && i.quantity > 0)
        .map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency: 'gbp',
            product_data: { name: i.name },
            unit_amount: i.unitAmountPence,
          },
        }))
      if (line_items.length === 0) return json(400, { error: 'No payable items' })
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: org.email || undefined,
        line_items,
        metadata: { kind: 'materials', org_name: org.name || '' },
        success_url: `${origin}/reorder?status=paid&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/reorder?status=cancelled`,
      })
    }
    return json(200, { url: session.url })
  } catch (err) {
    return json(500, { error: err?.message || 'Stripe error' })
  }
}
