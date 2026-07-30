// Generates per-clinic print artwork, laid out appropriately for each material:
// a headline-led A2 poster, a business/counter card with the details on it, a
// desk-stand card, a table tent, a letter insert, a lanyard card and a sticker.
// Every piece carries the clinic's own QR + feedback URL.
//
// Scaffold note: SVG suits preview and vector-friendly Prodigi products; most
// print SKUs want a bleed-safe PDF/PNG at the product DPI. For production,
// rasterise this SVG (e.g. resvg-js) and add crop/bleed marks before ordering.
import qrcode from 'qrcode-generator'

const INK = '#14312d'
const TEAL = '#0b6b64'
const SLATE = '#46564f'
const PAPER = '#f4f1e9'
const WHITE = '#ffffff'
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = 'Helvetica, Arial, sans-serif'
const QUIET = 3

const esc = (s) =>
  String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))

const displayUrl = (v) => String(v || '').replace(/^https?:\/\//, '').replace(/\/$/, '')

function qrPath(value) {
  const qr = qrcode(0, 'M')
  qr.addData(value || 'https://straighttalking.co.uk/f/your-clinic')
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

// A QR group scaled to `size`, positioned at (x, y), on a white tile so it
// scans against any background.
function qrGroup(value, x, y, size, pad = 0) {
  const { d, dim } = qrPath(value)
  const tile = size + pad * 2
  const s = size / dim
  return (
    `<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${Math.min(2, tile * 0.04)}" fill="${WHITE}"/>` +
    `<g transform="translate(${x + pad} ${y + pad}) scale(${s})"><path d="${d}" fill="${INK}"/></g>`
  )
}

const T = (x, y, size, fill, content, opts = {}) => {
  const { anchor = 'middle', family = SERIF, style = 'normal', weight = 'normal', spacing } = opts
  const ls = spacing ? ` letter-spacing="${spacing}"` : ''
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-style="${style}" font-weight="${weight}" fill="${fill}"${ls}>${esc(content)}</text>`
}

const doc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">` +
  `<rect width="${w}" height="${h}" fill="${PAPER}"/>${inner}</svg>`

// --- per-material layouts (dimensions in mm) --------------------------------

function poster(name, value) {
  const w = 420, h = 594
  const qs = 210
  return doc(w, h,
    T(w / 2, 70, 24, TEAL, name, { style: 'italic' }) +
    T(w / 2, 168, 62, INK, 'How was') +
    T(w / 2, 236, 62, INK, 'your visit?') +
    T(w / 2, 300, 22, SLATE, 'Scan the code to tell us, in your own words.', { family: SANS }) +
    qrGroup(value, (w - qs) / 2, 330, qs, 10) +
    T(w / 2, 330 + qs + 46, 22, TEAL, displayUrl(value), { family: SANS }) +
    T(w / 2, 560, 20, SLATE, 'About a minute, and anonymous', { family: SANS }))
}

// Business / counter card, 85x55: name across the top, details on the left,
// QR bottom-right, feedback URL along the bottom.
function card(name, value) {
  const w = 85, h = 55
  const qs = 26
  const qx = w - qs - 6, qy = h - qs - 6
  return doc(w, h,
    T(6, 12, 5.8, INK, name, { anchor: 'start', weight: 'bold' }) +
    T(6, 22, 4.6, TEAL, 'How was your visit?', { anchor: 'start', style: 'italic' }) +
    T(6, 32, 3.3, SLATE, 'Scan to tell us,', { anchor: 'start', family: SANS }) +
    T(6, 37, 3.3, SLATE, 'anonymous, about a minute.', { anchor: 'start', family: SANS }) +
    T(6, 52, 3.2, TEAL, displayUrl(value), { anchor: 'start', family: SANS }) +
    qrGroup(value, qx, qy, qs, 1.5))
}

// Lanyard card worn by staff, 54x86 portrait: QR big, prompt to offer it.
function lanyard(name, value) {
  const w = 54, h = 86
  const qs = 40
  return doc(w, h,
    T(w / 2, 12, 5, INK, name, { weight: 'bold' }) +
    T(w / 2, 20, 3.6, TEAL, 'Share your visit', { style: 'italic' }) +
    qrGroup(value, (w - qs) / 2, 26, qs, 2) +
    T(w / 2, 78, 3, SLATE, 'Scan, anonymous, 1 min', { family: SANS }))
}

// Table tent, 100x120: headline over QR, faces the patient across a desk.
function tent(name, value) {
  const w = 100, h = 120
  const qs = 52
  return doc(w, h,
    T(w / 2, 24, 8.5, INK, 'How was your visit?') +
    T(w / 2, 36, 5, TEAL, name, { style: 'italic' }) +
    qrGroup(value, (w - qs) / 2, 48, qs, 4) +
    T(w / 2, 112, 4.4, SLATE, 'Scan to tell us, anonymous', { family: SANS }))
}

// Desk-stand insert, 100x150 portrait.
function stand(name, value) {
  const w = 100, h = 150
  const qs = 62
  return doc(w, h,
    T(w / 2, 26, 6, TEAL, name, { style: 'italic' }) +
    T(w / 2, 46, 9.5, INK, 'How was your visit?') +
    qrGroup(value, (w - qs) / 2, 60, qs, 5) +
    T(w / 2, 140, 5, SLATE, displayUrl(value), { family: SANS }))
}

// Letter insert / flyer, 148x210 (A5) portrait: a bit more copy for a pack.
function insert(name, value) {
  const w = 148, h = 210
  const qs = 66
  return doc(w, h,
    T(w / 2, 40, 8, TEAL, name, { style: 'italic' }) +
    T(w / 2, 66, 15, INK, 'How was your visit?') +
    T(w / 2, 90, 7, SLATE, 'We would love to hear how today went.', { family: SANS }) +
    T(w / 2, 100, 7, SLATE, 'Scan the code below to tell us.', { family: SANS }) +
    qrGroup(value, (w - qs) / 2, 112, qs, 6) +
    T(w / 2, 196, 7, TEAL, displayUrl(value), { family: SANS }) +
    T(w / 2, 205, 5.5, SLATE, 'It takes about a minute and stays anonymous.', { family: SANS }))
}

// Sticker, 100x100 square: mostly QR, minimal words.
function sticker(name, value) {
  const w = 100, h = 100
  const qs = 60
  return doc(w, h,
    T(w / 2, 16, 7, INK, 'Scan to tell us') +
    qrGroup(value, (w - qs) / 2, 24, qs, 4) +
    T(w / 2, 94, 4.6, SLATE, name, { style: 'italic', family: SERIF }))
}

const LAYOUTS = { poster, card, lanyard, tent, stand, insert, sticker }

export function artworkSvg({ clinicName = 'Your clinic', value, template = 'poster' }) {
  const build = LAYOUTS[template] || LAYOUTS.poster
  return build(clinicName, value || 'https://straighttalking.co.uk/f/your-clinic')
}
