// Vercel function: renders a clinic's print artwork as a raw SVG for a size.
//   /api/artwork?clinic=Sussex%20Imaging&slug=sussex-imaging&size=a4
import { artworkSvg, SIZES } from '../lib/artwork.mjs'

const slugify = (s) =>
  String(s || 'your-clinic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'your-clinic'

export default async function handler(req, res) {
  const q = req.query || {}
  const clinicName = q.clinic || 'Your clinic'
  const size = SIZES[q.size] ? q.size : 'a4'
  const formBase = process.env.VITE_FORM_BASE_URL || 'https://straighttalking.co.uk/f'
  const slug = q.slug || slugify(clinicName)
  const value = q.value || `${formBase}/${slug}`

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.status(200).send(artworkSvg({ clinicName, value, size }))
}
