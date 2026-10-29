// Vercel function: Stripe webhook receiver. Verifies the signature over the raw
// body, then acts on payment events. Point a Stripe webhook at /api/stripe-webhook
// and set STRIPE_WEBHOOK_SECRET in the Vercel environment.
import Stripe from 'stripe'
import { adminClient, practiceIdBySlug } from './_supabase.js'

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

  const db = adminClient()

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object
      const meta = session.metadata || {}
      const kind = meta.kind
      const email = (session.customer_details && session.customer_details.email) || session.customer_email || null
      console.log('checkout.session.completed', { kind, org: meta.org_name, email })

      if (!db) break // no service role configured yet — acknowledge and move on

      if (kind === 'signup') {
        // Activate the practice (by slug when supplied) and record the order.
        let practiceId = await practiceIdBySlug(db, meta.slug)
        if (practiceId) {
          await db.from('practices').update({ status: 'active' }).eq('id', practiceId)
        }
        await db.from('orders').insert({
          practice_id: practiceId,
          email,
          kind: 'subscription',
          amount: session.amount_total ?? null,
          currency: session.currency || 'gbp',
          stripe_session_id: session.id,
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
          status: 'paid',
        })
        // Welcome email (board link + printables) is sent by the mailer wiring;
        // digital assets are already live the moment the practice is active.
      }

      if (kind === 'materials') {
        await db.from('orders').insert({
          practice_id: await practiceIdBySlug(db, meta.slug),
          email,
          kind: 'materials',
          amount: session.amount_total ?? null,
          currency: session.currency || 'gbp',
          stripe_session_id: session.id,
          status: 'paid',
        })
      }
      break
    }

    case 'invoice.paid': {
      // Renewal succeeded — keep the practice active.
      const sub = evt.data.object && evt.data.object.subscription
      if (db && sub) {
        const { data: order } = await db
          .from('orders')
          .select('practice_id')
          .eq('stripe_subscription_id', sub)
          .maybeSingle()
        if (order && order.practice_id) {
          await db.from('practices').update({ status: 'active' }).eq('id', order.practice_id)
        }
      }
      break
    }

    case 'invoice.payment_failed':
      // Left active on a single failure; dunning / cancellation is handled by
      // Stripe's retry schedule and the customer.subscription.deleted event.
      break

    case 'customer.subscription.deleted': {
      const sub = evt.data.object
      if (db && sub && sub.id) {
        const { data: order } = await db
          .from('orders')
          .select('practice_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle()
        if (order && order.practice_id) {
          await db.from('practices').update({ status: 'cancelled' }).eq('id', order.practice_id)
        }
      }
      break
    }

    default:
      break
  }

  return res.status(200).json({ received: true })
}
