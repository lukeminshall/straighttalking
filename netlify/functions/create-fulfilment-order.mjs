// Creates a Prodigi print order for a clinic's physical materials and drop-ships
// to the site address. Prodigi pulls each item's artwork from our /artwork
// endpoint, so every order prints that clinic's own QR.
//
// Invoked server-side after a materials payment settles (see stripe-webhook).
// Set PRODIGI_API_KEY (and PRODIGI_ENV=live to leave the sandbox) in Netlify.
import { prodigiItems, specialistItems } from './_lib/fulfilment.mjs'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

const slugify = (s) =>
  String(s || 'your-clinic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'your-clinic'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  const key = process.env.PRODIGI_API_KEY
  const base = process.env.PRODIGI_ENV === 'live' ? 'https://api.prodigi.com/v4.0' : 'https://api.sandbox.prodigi.com/v4.0'
  const publicUrl = process.env.PUBLIC_URL || process.env.URL || 'https://straighttalking.netlify.app'

  let p
  try {
    p = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON body' })
  }

  const clinic = p.clinic || {}
  const recipient = p.recipient
  const lines = Array.isArray(p.lines) ? p.lines : [] // [{ id, quantity }]
  if (!recipient || !recipient.name || !recipient.address) {
    return json(400, { error: 'recipient with an address is required' })
  }

  const toPrint = prodigiItems(lines)
  const specialist = specialistItems(lines) // banners / vinyl / NFC: handled outside Prodigi

  if (toPrint.length === 0) {
    return json(200, { ok: true, prodigiOrder: null, specialist, note: 'No Prodigi-printed items in this order' })
  }

  const slug = clinic.slug || slugify(clinic.name)
  const artworkUrl = (template) =>
    `${publicUrl}/.netlify/functions/artwork?clinic=${encodeURIComponent(clinic.name || 'Your clinic')}` +
    `&slug=${encodeURIComponent(slug)}&item=${encodeURIComponent(template)}`

  const items = toPrint.map((l) => ({
    sku: l.spec.sku,
    copies: l.quantity,
    sizing: l.spec.sizing || 'fillPrintArea',
    assets: [{ printArea: 'default', url: artworkUrl(l.spec.template) }],
  }))

  const orderPayload = {
    shippingMethod: p.shippingMethod || 'Standard',
    recipient,
    items,
    metadata: { clinic: clinic.name || '', slug },
  }

  // No key yet: return the exact payload we would POST, so it can be reviewed
  // and the app can carry on. Once PRODIGI_API_KEY is set this path is skipped.
  if (!key) {
    return json(501, { error: 'Prodigi is not configured yet', wouldSend: { endpoint: `${base}/Orders`, order: orderPayload }, specialist })
  }

  try {
    const res = await fetch(`${base}/Orders`, {
      method: 'POST',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return json(res.status, { error: 'Prodigi rejected the order', detail: data })
    return json(200, { ok: true, prodigiOrder: data.order || data, specialist })
  } catch (err) {
    return json(502, { error: err?.message || 'Prodigi request failed' })
  }
}
