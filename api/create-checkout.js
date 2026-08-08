// Vercel function: creates a Stripe Checkout Session, server-side. No card data
// touches the client (the browser is redirected to Stripe's hosted page).
//   signup    -> subscription for the flat annual fee
//   materials -> one-off payment for printed materials
// Set STRIPE_SECRET_KEY in the Vercel environment to enable it; until then this
// returns 501 and the app falls back to its demo flow.
import Stripe from 'stripe'

const body = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(501).json({ error: 'Stripe is not configured yet' })

  let payload
  try {
    payload = body(req)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const stripe = new Stripe(key)
  const origin = req.headers.origin || process.env.PUBLIC_URL || 'https://straighttalking.co.uk'
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
          price_data: { currency: 'gbp', product_data: { name: i.name }, unit_amount: i.unitAmountPence },
        }))
      if (line_items.length === 0) return res.status(400).json({ error: 'No payable items' })
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: org.email || undefined,
        line_items,
        metadata: { kind: 'materials', org_name: org.name || '' },
        success_url: `${origin}/reorder?status=paid&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/reorder?status=cancelled`,
      })
    }
    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: (err && err.message) || 'Stripe error' })
  }
}
