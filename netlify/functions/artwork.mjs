// Public endpoint that renders a clinic's print artwork for a given item, so
// Prodigi can fetch it as the order asset. Example:
//   /.netlify/functions/artwork?clinic=Sussex%20Imaging&slug=sussex-imaging&item=poster
import { artworkSvg } from './_lib/artwork.mjs'

const slugify = (s) =>
  String(s || 'your-clinic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'your-clinic'

export const handler = async (event) => {
  const q = event.queryStringParameters || {}
  const clinicName = q.clinic || 'Your clinic'
  const template = q.item || 'poster'
  const formBase = process.env.VITE_FORM_BASE_URL || 'https://straighttalking.co.uk/f'
  const slug = q.slug || slugify(clinicName)
  const value = q.value || `${formBase}/${slug}`

  const svg = artworkSvg({ clinicName, value, template })
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
    body: svg,
  }
}
