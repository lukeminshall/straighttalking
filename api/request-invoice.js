// Vercel function: the "request an invoice" path for Trust / PO buyers. Captures
// billing details and (when wired) raises a draft invoice in Xero; until then it
// records the request and returns a reference.
const body = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let p
  try {
    p = body(req)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const org = p.org || {}
  if (!org.name || !p.billingEmail) {
    return res.status(400).json({ error: 'Organisation name and billing email are required' })
  }

  const reference = 'INV-' + Date.now().toString(36).toUpperCase().slice(-6)

  // --- Xero draft invoice (fill in to enable) --------------------------------
  // With XERO_ACCESS_TOKEN + XERO_TENANT_ID (refresh the OAuth2 token first),
  // POST an ACCREC draft invoice to https://api.xero.com/api.xro/2.0/Invoices
  // with Contact { Name, EmailAddress }, Reference (PO), and the annual-plan line.
  // ---------------------------------------------------------------------------

  console.log('invoice request', {
    reference,
    org: org.name,
    sites: org.sites,
    billingEmail: p.billingEmail,
    contact: p.contactName,
    po: p.poNumber,
    notify: process.env.INVOICE_NOTIFY_EMAIL,
  })

  return res.status(200).json({ ok: true, reference })
}
