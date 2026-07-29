// Generates per-clinic print artwork as an SVG: the clinic's QR + name on a
// clean template, sized per item. This is what the Prodigi order references as
// the asset URL, so each order prints that clinic's unique code.
//
// Scaffold note: SVG is fine for preview and for Prodigi products that accept
// vector, but most print SKUs want a rasterised, bleed-safe PDF/PNG at the
// product's DPI. For production, render this SVG to PDF/PNG server-side (e.g.
// resvg-js or a headless renderer) and add crop/bleed marks before ordering.
import qrcode from 'qrcode-generator'

// width x height in mm (artwork proportions); the QR is sized as a fraction.
const TEMPLATES = {
  poster:  { w: 420, h: 594, qr: 0.5,  name: 30, tag: 15 }, // A2 portrait
  card:    { w: 85,  h: 55,  qr: 0.52, name: 6,  tag: 3.4 },
  sticker: { w: 100, h: 100, qr: 0.62, name: 7,  tag: 4 },
  tent:    { w: 100, h: 120, qr: 0.5,  name: 8,  tag: 4.5 },
  lanyard: { w: 86,  h: 54,  qr: 0.5,  name: 6,  tag: 3.4 },
  insert:  { w: 100, h: 60,  qr: 0.5,  name: 7,  tag: 4 },
  stand:   { w: 100, h: 150, qr: 0.62, name: 9,  tag: 5 },
}

const QUIET = 3

function qrPath(value) {
  const qr = qrcode(0, 'M')
  qr.addData(value)
  qr.make()
  const count = qr.getModuleCount()
  const dim = count + QUIET * 2
  let d = ''
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) d += `M${col + QUIET} ${row + QUIET}h1v1h-1z`
    }
  }
  return { d, dim }
}

const esc = (s) =>
  String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))

export function artworkSvg({ clinicName = 'Your clinic', value, template = 'poster' }) {
  const t = TEMPLATES[template] || TEMPLATES.poster
  const { d, dim } = qrPath(value || 'https://straighttalking.co.uk/f/your-clinic')

  const qrSize = t.w * t.qr
  const qrX = (t.w - qrSize) / 2
  const qrY = t.h * 0.32
  const scale = qrSize / dim

  const ink = '#14312d'
  const teal = '#0b6b64'
  const paper = '#f4f1e9'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}mm" height="${t.h}mm" viewBox="0 0 ${t.w} ${t.h}">
  <rect width="${t.w}" height="${t.h}" fill="${paper}"/>
  <text x="${t.w / 2}" y="${t.h * 0.16}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${t.name}" font-style="italic" fill="${ink}">${esc(clinicName)}</text>
  <text x="${t.w / 2}" y="${t.h * 0.24}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${t.tag}" fill="${teal}">How was your visit? Scan to tell us.</text>
  <g transform="translate(${qrX} ${qrY}) scale(${scale})">
    <rect width="${dim}" height="${dim}" fill="#ffffff"/>
    <path d="${d}" fill="${ink}"/>
  </g>
  <text x="${t.w / 2}" y="${qrY + qrSize + t.tag * 2.4}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${t.tag * 0.85}" fill="${ink}">It takes about a minute and stays anonymous.</text>
</svg>`
}
