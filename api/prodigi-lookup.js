// Vercel function (dormant Prodigi path): validate a product SKU against the
// Prodigi catalogue and return its print areas. Read-only. Uses PRODIGI_API_KEY.
//   /api/prodigi-lookup?sku=GLOBAL-FAP-A2   (add &env=live|sandbox, &debug=1)
export default async function handler(req, res) {
  const raw = process.env.PRODIGI_API_KEY || ''
  const key = raw.trim()
  const q = req.query || {}
  const envParam = q.env === 'live' || q.env === 'sandbox' ? q.env : process.env.PRODIGI_ENV === 'live' ? 'live' : 'sandbox'
  const base = envParam === 'live' ? 'https://api.prodigi.com/v4.0' : 'https://api.sandbox.prodigi.com/v4.0'

  if (q.debug) {
    return res.status(200).json({
      env: process.env.PRODIGI_ENV || '(unset, defaults to sandbox)',
      endpoint: base,
      keyPresent: raw.length > 0,
      keyLength: raw.length,
      keyHadWhitespaceEdges: raw !== raw.trim(),
    })
  }

  if (!key) return res.status(501).json({ error: 'Prodigi is not configured yet' })
  const sku = q.sku
  if (!sku) return res.status(400).json({ error: 'sku query parameter is required' })

  try {
    const r = await fetch(`${base}/products/${encodeURIComponent(sku)}`, { headers: { 'X-API-Key': key } })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ valid: false, sku, detail: data })
    const product = data.product || data
    return res.status(200).json({
      valid: true,
      sku,
      description: product.description,
      printAreas: product.printAreas ? Object.keys(product.printAreas) : undefined,
      attributes: product.attributes,
      variants: Array.isArray(product.variants) ? product.variants.length : undefined,
    })
  } catch (err) {
    return res.status(502).json({ valid: false, error: (err && err.message) || 'Prodigi request failed' })
  }
}
