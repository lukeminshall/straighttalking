// Vercel function (dormant Prodigi path): create a Prodigi print order and
// drop-ship to the site. Not wired into the app flow (we use the self-serve
// print module instead); kept available behind PRODIGI_API_KEY for the future.
import { prodigiItems, specialistItems } from '../lib/fulfilment.mjs'

const readBody = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {})
const slugify = (s) =>
  String(s || 'your-clinic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'your-clinic'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = (process.env.PRODIGI_API_KEY || '').trim()
  const base = process.env.PRODIGI_ENV === 'live' ? 'https://api.prodigi.com/v4.0' : 'https://api.sandbox.prodigi.com/v4.0'
  const publicUrl = process.env.PUBLIC_URL || `https://${req.headers.host || 'straighttalking.co.uk'}`

  let p
  try {
    p = readBody(req)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const clinic = p.clinic || {}
  const recipient = p.recipient
  const lines = Array.isArray(p.lines) ? p.lines : []
  if (!recipient || !recipient.name || !recipient.address) {
    return res.status(400).json({ error: 'recipient with an address is required' })
  }

  const toPrint = prodigiItems(lines)
  const specialist = specialistItems(lines)
  if (toPrint.length === 0) {
    return res.status(200).json({ ok: true, prodigiOrder: null, specialist, note: 'No Prodigi-printed items in this order' })
  }

  const slug = clinic.slug || slugify(clinic.name)
  const artworkUrl = (size) =>
    `${publicUrl}/api/artwork?clinic=${encodeURIComponent(clinic.name || 'Your clinic')}&slug=${encodeURIComponent(slug)}&size=${encodeURIComponent(size)}`

  const items = toPrint.map((l) => ({
    sku: l.spec.sku,
    copies: l.quantity,
    sizing: l.spec.sizing || 'fillPrintArea',
    assets: [{ printArea: 'default', url: artworkUrl(l.spec.template) }],
  }))
  const orderPayload = { shippingMethod: p.shippingMethod || 'Standard', recipient, items, metadata: { clinic: clinic.name || '', slug } }

  if (!key) return res.status(501).json({ error: 'Prodigi is not configured yet', wouldSend: { endpoint: `${base}/Orders`, order: orderPayload }, specialist })

  try {
    const r = await fetch(`${base}/Orders`, {
      method: 'POST',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: 'Prodigi rejected the order', detail: data })
    return res.status(200).json({ ok: true, prodigiOrder: data.order || data, specialist })
  } catch (err) {
    return res.status(502).json({ error: (err && err.message) || 'Prodigi request failed' })
  }
}
