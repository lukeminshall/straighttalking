// Stripe webhook receiver. Verifies the signature, then acts on payment events.
// Point a Stripe webhook endpoint at /.netlify/functions/stripe-webhook and set
// STRIPE_WEBHOOK_SECRET (the signing secret Stripe gives you) in Netlify.
import Stripe from 'stripe'

export const handler = async (event) => {
  const key = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !whSecret) return { statusCode: 501, body: 'Stripe webhook is not configured yet' }

  const stripe = new Stripe(key)
  const sig = event.headers['stripe-signature']
  // The signature is computed over the exact raw body, so do not JSON.parse first.
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body

  let evt
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, whSecret)
  } catch (err) {
    return { statusCode: 400, body: `Webhook signature verification failed: ${err.message}` }
  }

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object
      const kind = session.metadata?.kind
      console.log('checkout.session.completed', {
        kind,
        org: session.metadata?.org_name,
        email: session.customer_details?.email,
      })
      if (kind === 'signup') {
        // TODO: mark the clinic active and send the welcome email (board link +
        // printable codes). Digital assets are already live.
      }
      if (kind === 'materials') {
        // Fire fulfilment. In production, persist the order intent (line items +
        // delivery address) when the Checkout session is created, keyed by
        // session.id, then look it up here and POST it to create-fulfilment-order:
        //
        //   const intent = await store.get(session.id)   // { clinic, recipient, lines }
        //   await fetch(`${process.env.URL}/.netlify/functions/create-fulfilment-order`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(intent),
        //   })
        //
        // Prodigi prints and drop-ships; large-format + NFC items come back in
        // the `specialist` array for manual handling.
      }
      break
    }
    case 'invoice.paid':
      // Annual subscription renewed successfully.
      break
    case 'invoice.payment_failed':
      // Renewal failed: trigger dunning / notify the account.
      break
    default:
      break
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
