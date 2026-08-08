// Generates per-clinic print artwork. Two layouts cover the whole range:
//   poster  - a headline-led design, sized to A3 / A4 / A5 / A6 postcard
//   card    - an 85x55 business / counter card with the details on it
// Every piece carries the clinic's own QR + feedback URL.
//
// Output is SVG at true mm dimensions, so a printable HTML page can drop it on
// a matching @page and the practice prints (or saves as PDF) at exact size.
import qrcode from 'qrcode-generator'

const INK = '#14312d'
const TEAL = '#0b6b64'
const SLATE = '#46564f'
const PAPER = '#f4f1e9'
const WHITE = '#ffffff'
// Brand faces. The printable page loads Fraunces + Inter (Google Fonts), so
// inline SVG text renders on-brand on screen and embeds into a saved PDF.
const SERIF = "Fraunces, Georgia, 'Times New Roman', serif"
const SANS = 'Inter, Helvetica, Arial, sans-serif'
const QUIET = 3

// Page sizes in mm (portrait). Cards/postcards are laid out multi-up on A4 by
// the printable page; here we render one of each at true size.
export const SIZES = {
  a3: { w: 297, h: 420, kind: 'poster', label: 'A3 poster' },
  a4: { w: 210, h: 297, kind: 'poster', label: 'A4 poster' },
  a5: { w: 148, h: 210, kind: 'poster', label: 'A5 poster' },
  postcard: { w: 105, h: 148, kind: 'poster', label: 'Postcard (A6)' },
  card: { w: 85, h: 55, kind: 'card', label: 'Business card' },
}

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

// A QR on a white tile (so it scans on any background), sized to `size` at (x,y).
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
  const { anchor = 'middle', family = SERIF, style = 'normal', weight = 'normal' } = opts
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-style="${style}" font-weight="${weight}" fill="${fill}">${esc(content)}</text>`
}

const doc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">` +
  `<rect width="${w}" height="${h}" fill="${PAPER}"/>${inner}</svg>`

// The Straight Talking mark (speech bubble) + wordmark, centred on `cx`.
function brandMark(cx, baseline, fs) {
  const bs = fs * 1.25
  const gap = fs * 0.45
  const textW = 'Straight Talking'.length * fs * 0.46
  const x0 = cx - (bs + gap + textW) / 2
  const s = bs / 120
  return (
    `<g transform="translate(${x0} ${baseline - bs * 0.82}) scale(${s})">` +
    `<rect x="16" y="16" width="88" height="74" rx="26" fill="${TEAL}"/>` +
    `<path d="M46 88 L36 107 L64 88 Z" fill="${TEAL}"/>` +
    `<rect x="36" y="47" width="48" height="12" rx="6" fill="${WHITE}"/></g>` +
    `<text x="${x0 + bs + gap}" y="${baseline}" text-anchor="start" font-family="${SERIF}" font-weight="600" font-size="${fs}" fill="${INK}">Straight <tspan fill="${TEAL}">Talking</tspan></text>`
  )
}

// Headline poster, sized parametrically so one layout serves A3/A4/A5/postcard.
function poster(name, value, w, h) {
  const em = w * 0.056
  const head = w * 0.135
  const sub = w * 0.042
  const url = w * 0.048
  const brand = w * 0.04
  const qs = w * 0.5
  const qx = (w - qs) / 2
  const qy = h * 0.42
  const subY = h * 0.245 + head + sub * 2.2
  const afterQr = qy + qs + url * 1.9
  return doc(w, h,
    T(w / 2, h * 0.135, em, TEAL, name, { style: 'italic' }) +
    T(w / 2, h * 0.245, head, INK, 'How was', { weight: '560' }) +
    T(w / 2, h * 0.245 + head, head, INK, 'your visit?', { weight: '560' }) +
    T(w / 2, subY, sub, SLATE, 'Scan the code to tell us how it went.', { family: SANS }) +
    T(w / 2, subY + sub * 1.35, sub, SLATE, 'It helps the next patient choose their care.', { family: SANS }) +
    qrGroup(value, qx, qy, qs, qs * 0.04) +
    T(w / 2, afterQr, url, TEAL, displayUrl(value), { family: SANS }) +
    T(w / 2, afterQr + sub * 1.6, sub * 0.82, SLATE, 'About a minute, and anonymous', { family: SANS }) +
    brandMark(w / 2, h * 0.965, brand))
}

// Business / counter card, 85x55: name top, details left, QR bottom-right.
function card(name, value) {
  const w = 85, h = 55
  const qs = 26
  const qx = w - qs - 6, qy = h - qs - 6
  return doc(w, h,
    T(6, 12, 5.8, INK, name, { anchor: 'start', weight: 'bold' }) +
    T(6, 22, 4.6, TEAL, 'How was your visit?', { anchor: 'start', style: 'italic' }) +
    T(6, 32, 3.3, SLATE, 'Scan to tell us how it went,', { anchor: 'start', family: SANS }) +
    T(6, 37, 3.3, SLATE, 'and help the next patient.', { anchor: 'start', family: SANS }) +
    T(6, 52, 3.2, TEAL, displayUrl(value), { anchor: 'start', family: SANS }) +
    qrGroup(value, qx, qy, qs, 1.5))
}

export function artworkSvg({ clinicName = 'Your clinic', value, size = 'a4' }) {
  const s = SIZES[size] || SIZES.a4
  const v = value || 'https://straighttalking.co.uk/f/your-clinic'
  return s.kind === 'card' ? card(clinicName, v) : poster(clinicName, v, s.w, s.h)
}
