// Vercel function: Stripe webhook receiver. Verifies the signature over the raw
// body, then acts on payment events. Point a Stripe webhook at /api/stripe-webhook
// and set STRIPE_WEBHOOK_SECRET in the Vercel environment.
import Stripe from 'stripe'

// Stripe needs the exact raw body for signature verification, so disable
// Vercel's automatic body parsing for this route.
export const config = { api: { bodyParser: false } }

async function rawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  const key = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !whSecret) return res.status(501).send('Stripe webhook is not configured yet')

  const stripe = new Stripe(key)
  const sig = req.headers['stripe-signature']
  const raw = await rawBody(req)

  let evt
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, whSecret)
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`)
  }

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object
      const kind = session.metadata && session.metadata.kind
      console.log('checkout.session.completed', {
        kind,
        org: session.metadata && session.metadata.org_name,
        email: session.customer_details && session.customer_details.email,
      })
      if (kind === 'signup') {
        // TODO: mark the clinic active + send the welcome email (board link,
        // printable links). Digital assets are already live.
      }
      if (kind === 'materials') {
        // TODO: record the paid order and generate the print pack to send to the
        // preferred supplier (self-serve print module; Prodigi stays dormant).
      }
      break
    }
    case 'invoice.paid':
      break
    case 'invoice.payment_failed':
      break
    default:
      break
  }

  return res.status(200).json({ received: true })
}
