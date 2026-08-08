// Vercel function: builds a fulfilment "print pack" for a paid order, ready to
// forward to the print supplier. A cover sheet (clinic, delivery site, feedback
// URL, order summary) followed by each ordered item's print-ready artwork at
// true size. Open it and Save as PDF.
//   /api/print-pack?clinic=Sussex%20Imaging&slug=sussex-imaging&site=Haywards%20Heath&items=a3:2,a4:3,card:1
import { artworkSvg, SIZES } from '../lib/artwork.mjs'

const SANS = 'Inter, Helvetica, Arial, sans-serif'
const esc = (s) =>
  String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))
const slugify = (s) =>
  String(s || 'your-clinic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'your-clinic'

const parseItems = (str) =>
  String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [size, q] = s.split(':')
      return { size, qty: Math.max(1, parseInt(q || '1', 10) || 1) }
    })
    .filter((i) => SIZES[i.size])

export default async function handler(req, res) {
  const q = req.query || {}
  const clinicName = q.clinic || 'Your clinic'
  const slug = q.slug || slugify(clinicName)
  const formBase = process.env.VITE_FORM_BASE_URL || 'https://straighttalking.co.uk/f'
  const value = q.value || `${formBase}/${slug}`
  const site = q.site || ''
  const items = parseItems(q.items)

  const rows = items.map((i) => `<tr><td>${esc(SIZES[i.size].label)}</td><td>&times; ${i.qty}</td></tr>`).join('') ||
    '<tr><td colspan="2">No print items in this order.</td></tr>'

  const previews = items
    .map(
      (i) =>
        `<section class="item"><div class="ihead"><b>${esc(SIZES[i.size].label)}</b> &middot; print &times; ${i.qty}</div>` +
        `<div class="art" style="max-width:${Math.min(SIZES[i.size].w, 180)}mm">${artworkSvg({ clinicName, value, size: i.size })}</div></section>`
    )
    .join('')

  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Print pack - ${esc(clinicName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,560;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box } html, body { margin: 0 }
  body { font-family: ${SANS}; background: #e9e6df; color: #14312d }
  .bar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 12px; padding: 12px 18px; background: #fff; border-bottom: 1px solid #e5e0d4 }
  .bar b { font-weight: 600 }
  .bar button { margin-left: auto; background: #0b6b64; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font: inherit; font-weight: 600; cursor: pointer }
  .page { max-width: 820px; margin: 24px auto; background: #fff; padding: 36px 40px; box-shadow: 0 8px 30px rgba(20,49,45,.14) }
  h1 { font-family: Fraunces, Georgia, serif; font-weight: 560; font-size: 1.7rem; margin: 0 0 4px }
  .muted { color: #46564f; font-size: .9rem }
  table { width: 100%; border-collapse: collapse; margin: 18px 0 }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #e5e0d4; font-size: .95rem }
  th { color: #46564f; font-weight: 600; font-size: .8rem; text-transform: uppercase; letter-spacing: .04em }
  .meta { display: grid; grid-template-columns: 140px 1fr; gap: 6px 14px; margin-top: 14px; font-size: .95rem }
  .meta div:nth-child(odd) { color: #46564f }
  .item { margin: 22px auto; max-width: 820px; padding: 0 8px }
  .ihead { font-family: Fraunces, Georgia, serif; margin-bottom: 8px }
  .art { border: 1px solid #e5e0d4; margin: 0 auto }
  .art > svg { display: block; width: 100%; height: auto }
  @media print { body { background: #fff } .bar { display: none } .page, .art { box-shadow: none } .item { page-break-inside: avoid } }
</style></head>
<body>
  <div class="bar"><b>Print pack</b> &middot; ${esc(clinicName)} <button onclick="window.print()">Save as PDF</button></div>
  <div class="page">
    <h1>Straight Talking print pack</h1>
    <div class="muted">Ready to send to the print supplier. Each artwork carries the clinic's own QR.</div>
    <div class="meta">
      <div>Clinic</div><div>${esc(clinicName)}</div>
      <div>Deliver to</div><div>${esc(site || '(site address)')}</div>
      <div>Feedback URL</div><div>${esc(value)}</div>
    </div>
    <table><thead><tr><th>Item</th><th>Quantity</th></tr></thead><tbody>${rows}</tbody></table>
  </div>
  ${previews}
</body></html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
