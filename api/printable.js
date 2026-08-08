// Vercel function: a print-ready HTML page for a clinic in a chosen format.
// Posters print one-per-page at true size; business cards and postcards are
// laid out multi-up on A4 with light cut guides. Brand fonts (Fraunces + Inter)
// are loaded so the SVG renders on-brand and embeds into a saved PDF.
//   /api/printable?clinic=Sussex%20Imaging&slug=sussex-imaging&size=a4
import { artworkSvg, SIZES } from '../lib/artwork.mjs'

const SANS = 'Inter, Helvetica, Arial, sans-serif'
const esc = (s) =>
  String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))
const slugify = (s) =>
  String(s || 'your-clinic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'your-clinic'

export default async function handler(req, res) {
  const q = req.query || {}
  const clinicName = q.clinic || 'Your clinic'
  const size = SIZES[q.size] ? q.size : 'a4'
  const spec = SIZES[size]
  const formBase = process.env.VITE_FORM_BASE_URL || 'https://straighttalking.co.uk/f'
  const slug = q.slug || slugify(clinicName)
  const value = q.value || `${formBase}/${slug}`
  const autoprint = q.print === '1'

  const multiUp = size === 'card' || size === 'postcard'
  const printW = multiUp ? 210 : spec.w
  const printH = multiUp ? 297 : spec.h

  let content
  if (size === 'card') {
    const one = artworkSvg({ clinicName, value, size: 'card' })
    content = `<div class="sheet grid cards">${Array.from({ length: 10 }, () => `<div class="cell">${one}</div>`).join('')}</div>`
  } else if (size === 'postcard') {
    const one = artworkSvg({ clinicName, value, size: 'postcard' })
    content = `<div class="sheet grid postcards">${Array.from({ length: 4 }, () => `<div class="cell">${one}</div>`).join('')}</div>`
  } else {
    const one = artworkSvg({ clinicName, value, size })
    content = `<div class="sheet" style="width:${spec.w}mm;height:${spec.h}mm">${one}</div>`
  }

  const links = Object.entries(SIZES)
    .map(([k, s]) => `<a href="?clinic=${encodeURIComponent(clinicName)}&slug=${encodeURIComponent(slug)}&size=${k}"${k === size ? ' class="on"' : ''}>${esc(s.label)}</a>`)
    .join('')

  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(clinicName)} - ${esc(spec.label)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,560;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page { size: ${printW}mm ${printH}mm; margin: 0 }
  * { box-sizing: border-box } html, body { margin: 0 }
  body { font-family: ${SANS}; background: #e9e6df; color: #14312d }
  .bar { position: sticky; top: 0; z-index: 5; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 12px 18px; background: #fff; border-bottom: 1px solid #e5e0d4 }
  .bar b { font-weight: 600 }
  .bar .links { display: flex; gap: 6px; flex-wrap: wrap }
  .bar a { color: #46564f; text-decoration: none; font-size: 13px; padding: 5px 10px; border: 1px solid #e5e0d4; border-radius: 6px }
  .bar a.on { background: #0b6b64; color: #fff; border-color: #0b6b64 }
  .bar button { margin-left: auto; background: #0b6b64; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font: inherit; font-weight: 600; cursor: pointer }
  .hint { padding: 0 18px 12px; font-size: 13px; color: #46564f; background: #fff }
  .wrap { padding: 24px; display: flex; justify-content: center }
  .sheet { background: #fff; box-shadow: 0 8px 30px rgba(20,49,45,.18) }
  .sheet > svg { display: block; width: 100%; height: 100% }
  .grid { display: grid; width: 210mm; height: 297mm; justify-content: center; align-content: center }
  .grid.cards { grid-template-columns: repeat(2, 85mm); grid-template-rows: repeat(5, 55mm) }
  .grid.postcards { grid-template-columns: repeat(2, 105mm); grid-template-rows: repeat(2, 148mm) }
  .cell { overflow: hidden; outline: .2mm dashed #c9c4b6 }
  .cell > svg { display: block; width: 100%; height: 100% }
  @media print { body { background: #fff } .bar, .hint { display: none } .wrap { padding: 0 } .sheet { box-shadow: none } .cell { outline: none } }
</style></head>
<body>
  <div class="bar">
    <b>${esc(clinicName)}</b>
    <span class="links">${links}</span>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="hint">Print at 100% (actual size), not "fit to page". ${multiUp ? 'Cut along the guides.' : 'Prints one per ' + esc(spec.label.split(' ')[0]) + ' page.'}</div>
  <div class="wrap">${content}</div>
  ${autoprint ? '<script>window.addEventListener("load",function(){(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print()},250)})})</script>' : ''}
</body></html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.status(200).send(html)
}
