// Validates a Prodigi product SKU against your account and returns its details
// (print areas, attributes, variants), so we can lock real SKUs into the
// fulfilment map instead of guessing. Uses the server-side PRODIGI_API_KEY.
//
//   /.netlify/functions/prodigi-lookup?sku=GLOBAL-...
const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  const raw = process.env.PRODIGI_API_KEY || ''
  const key = raw.trim()
  const q = event.queryStringParameters || {}
  // env override is read-only here (product lookup only): lets us confirm which
  // environment a key actually authenticates against. Never used for orders.
  const envParam = q.env === 'live' || q.env === 'sandbox' ? q.env : process.env.PRODIGI_ENV === 'live' ? 'live' : 'sandbox'
  const base = envParam === 'live' ? 'https://api.prodigi.com/v4.0' : 'https://api.sandbox.prodigi.com/v4.0'

  // Safe diagnostic: never returns the key itself, only whether it looks sane.
  if (q.debug) {
    return json(200, {
      env: process.env.PRODIGI_ENV || '(unset, defaults to sandbox)',
      endpoint: base,
      keyPresent: raw.length > 0,
      keyLength: raw.length,
      keyHadWhitespaceEdges: raw !== raw.trim(),
    })
  }

  if (!key) return json(501, { error: 'Prodigi is not configured yet' })

  const sku = q.sku
  if (!sku) return json(400, { error: 'sku query parameter is required' })

  try {
    const res = await fetch(`${base}/products/${encodeURIComponent(sku)}`, {
      headers: { 'X-API-Key': key },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return json(res.status, { valid: false, sku, detail: data })
    // Surface just the useful bits for mapping.
    const product = data.product || data
    return json(200, {
      valid: true,
      sku,
      description: product.description,
      printAreas: product.printAreas ? Object.keys(product.printAreas) : undefined,
      attributes: product.attributes,
      variants: Array.isArray(product.variants) ? product.variants.length : undefined,
    })
  } catch (err) {
    return json(502, { valid: false, error: err?.message || 'Prodigi request failed' })
  }
}
