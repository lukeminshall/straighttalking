// "Request an invoice" path for NHS Trusts and buyers who pay on a PO with net
// terms rather than a card at signup. Captures the billing details and (when
// wired) raises a draft invoice in Xero; until then it records the request and
// returns a reference so the client can confirm.
const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  let p
  try {
    p = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON body' })
  }

  const org = p.org || {}
  if (!org.name || !p.billingEmail) {
    return json(400, { error: 'Organisation name and billing email are required' })
  }

  const reference = 'INV-' + Date.now().toString(36).toUpperCase().slice(-6)

  // --- Xero draft invoice (fill in to enable) --------------------------------
  // With XERO_ACCESS_TOKEN + XERO_TENANT_ID available (refresh the OAuth2 token
  // server-side first), raise a draft ACCREC invoice:
  //
  //   await fetch('https://api.xero.com/api.xro/2.0/Invoices', {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${process.env.XERO_ACCESS_TOKEN}`,
  //       'Xero-Tenant-Id': process.env.XERO_TENANT_ID,
  //       'Content-Type': 'application/json',
  //       Accept: 'application/json',
  //     },
  //     body: JSON.stringify({
  //       Type: 'ACCREC',
  //       Status: 'DRAFT',
  //       Reference: p.poNumber || reference,
  //       Contact: { Name: org.name, EmailAddress: p.billingEmail },
  //       LineItems: [
  //         { Description: 'Straight Talking annual plan', Quantity: 1, UnitAmount: 200, AccountCode: '200' },
  //       ],
  //     }),
  //   })
  // ---------------------------------------------------------------------------

  // Fallback until Xero is wired: log for the finance inbox to pick up.
  console.log('invoice request', {
    reference,
    org: org.name,
    sites: org.sites,
    billingEmail: p.billingEmail,
    contact: p.contactName,
    po: p.poNumber,
    notes: p.notes,
    notify: process.env.INVOICE_NOTIFY_EMAIL,
  })

  return json(200, { ok: true, reference })
}
