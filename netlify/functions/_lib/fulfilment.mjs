// Maps each catalogue material to how it is produced.
//
//   prodigi       -> printed and drop-shipped via the Prodigi print API
//   large-format  -> a UK large-format trade printer (banners, window vinyl)
//   nfc           -> Seritag (prints + encodes the tag)
//   digital       -> generated instantly, no production
//
// The Prodigi SKUs below are PLACEHOLDERS: confirm each against the live Prodigi
// product catalogue (GET /v4.0/products or the dashboard) before going live.
// Wrong SKUs are rejected by the Orders API, so this is safe to ship as a stub.

export const FULFILMENT = {
  stand:   { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-STAND-INSERT',  sizing: 'fillPrintArea', template: 'stand' },
  card:    { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-BUSINESS-CARD', sizing: 'fillPrintArea', template: 'card' },
  poster:  { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-POSTER-A2',     sizing: 'fillPrintArea', template: 'poster' },
  sticker: { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-STICKER-SHEET', sizing: 'fillPrintArea', template: 'sticker' },
  tent:    { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-TENT-CARD',     sizing: 'fillPrintArea', template: 'tent' },
  lanyard: { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-LANYARD-CARD',  sizing: 'fillPrintArea', template: 'lanyard' },
  insert:  { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-LETTER-INSERT', sizing: 'fillPrintArea', template: 'insert' },
  banner:  { fulfilBy: 'large-format' },
  vinyl:   { fulfilBy: 'large-format' },
  nfctag:  { fulfilBy: 'nfc' },
}

/** Items Prodigi will print, from a list of { id, quantity }. */
export const prodigiItems = (lines) =>
  (lines || [])
    .map((l) => ({ ...l, spec: FULFILMENT[l.id] }))
    .filter((l) => l.spec && l.spec.fulfilBy === 'prodigi' && l.quantity > 0)

/** Items that need a specialist supplier (surfaced for manual handling). */
export const specialistItems = (lines) =>
  (lines || [])
    .map((l) => ({ ...l, spec: FULFILMENT[l.id] }))
    .filter((l) => l.spec && (l.spec.fulfilBy === 'large-format' || l.spec.fulfilBy === 'nfc') && l.quantity > 0)
