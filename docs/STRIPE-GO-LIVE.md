# Stripe: test mode → live

The checkout code is **mode-agnostic**. It builds prices inline with Stripe
`price_data` (no stored price/product IDs that differ between test and live), and
derives success/cancel URLs from the request origin. So moving from test to live is
**only an environment-variable change** — there is nothing to edit in the code.

- Checkout: [api/create-checkout.js](../api/create-checkout.js) — reads `STRIPE_SECRET_KEY`.
- Webhook: [api/stripe-webhook.js](../api/stripe-webhook.js) — reads `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`; writes orders + flips `practices.status` via the service-role client.

Which mode you're in is decided entirely by whether the secret key is `sk_test_…`
or `sk_live_…`. Test and live are fully separate worlds in Stripe (separate
customers, payments, webhooks, and signing secrets).

---

## Phase 1 — Test mode

> Full end-to-end verification (practice activates, `orders` row written) also needs
> the Supabase project live, since the webhook's DB write no-ops until then. The
> checkout + webhook-signature path can be exercised before Supabase is wired.

**Option A — local (fastest, no deploy):**

1. In `.env.local` (git-ignored), set your **test** keys:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
2. Run the app with the serverless functions: `vercel dev` (or `npx vercel dev`).
3. Forward webhooks with the Stripe CLI — it prints a `whsec_…` to use:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
   Put that `whsec_…` in `.env.local` as `STRIPE_WEBHOOK_SECRET` and restart.
4. Go through `/setup`, reach checkout, pay with the test card below.

**Option B — on the deployed domain (tests the real production path):**

1. Vercel → Project → Settings → Environment Variables, **Production** scope:
   - `STRIPE_SECRET_KEY = sk_test_...`
   - `STRIPE_WEBHOOK_SECRET =` (from step 3 below)
2. Deploy.
3. Stripe Dashboard **in test mode** → Developers → Webhooks → add endpoint:
   - URL: `https://<your-domain>/api/stripe-webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
   - Copy the endpoint's signing secret (`whsec_…`) into the env var above, redeploy.
4. Run a real checkout on the site with the test card.

**Stripe test card:** `4242 4242 4242 4242` · any future expiry · any CVC · any postcode.

**Verify:**
- Browser redirects to Stripe's hosted page and back to `/setup?status=paid`.
- Webhook delivery shows `200` in Stripe (or the CLI logs it).
- Once Supabase is live: the practice flips to `active` and an `orders` row appears
  (kind `subscription`, status `paid`).

---

## Phase 2 — Switch to live

1. Create a **live-mode** webhook (Stripe Dashboard, live mode) at the **same** URL
   `https://<your-domain>/api/stripe-webhook`, same three events. Copy its new
   `whsec_…` (live endpoints have their own signing secret).
2. Vercel → Environment Variables, **Production** scope — replace both values:
   - `STRIPE_SECRET_KEY = sk_live_...`
   - `STRIPE_WEBHOOK_SECRET = whsec_...` (the live one from step 1)
3. **Redeploy** so the new env is picked up.
4. Smoke test with a real card you can refund (or a small real charge), confirm the
   `orders` row, then refund from the Stripe Dashboard.

That's the whole switch. If anything 501s, `STRIPE_SECRET_KEY` isn't set in that
environment; if the webhook 400s, `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint
that sent the event (a common slip is pairing a test secret with a live webhook).

**Keys never go through chat** — set them directly in Vercel / `.env.local`.
