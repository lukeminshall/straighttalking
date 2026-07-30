// Maps each catalogue material to how it is produced.
//
//   prodigi       -> printed and drop-shipped via the Prodigi print API
//   large-format  -> a UK large-format trade printer (banners, window vinyl)
//   nfc           -> Seritag (prints + encodes the tag)
//   digital       -> generated instantly, no production
//
// SKU status (validated live against the Prodigi catalogue):
//   CONFIRMED  poster, insert -> real Enhanced Matte Art Paper print SKUs
//              (GLOBAL-FAP-A2 / -A5), verified via /prodigi-lookup.
//   INTERIM    stand, card, tent, lanyard -> mapped to a small print (FAP-A5)
//              so the full order flow validates now; swap for proper cardstock
//              (business-card / tent-card) SKUs from the Prodigi dashboard.
//   TODO       sticker -> needs the real kiss-cut sticker SKU (no public code;
//              grab it from the dashboard). Rejected by the Orders API until set.
// Confirm a SKU any time with /.netlify/functions/prodigi-lookup?sku=<SKU>.

export const FULFILMENT = {
  poster:  { fulfilBy: 'prodigi',      sku: 'GLOBAL-FAP-A2',             sizing: 'fillPrintArea', template: 'poster' },  // CONFIRMED A2 print
  insert:  { fulfilBy: 'prodigi',      sku: 'GLOBAL-FAP-A5',             sizing: 'fillPrintArea', template: 'insert' },  // CONFIRMED A5 print
  stand:   { fulfilBy: 'prodigi',      sku: 'GLOBAL-FAP-A5',             sizing: 'fillPrintArea', template: 'stand' },   // INTERIM
  card:    { fulfilBy: 'prodigi',      sku: 'GLOBAL-FAP-A5',             sizing: 'fillPrintArea', template: 'card' },    // INTERIM
  tent:    { fulfilBy: 'prodigi',      sku: 'GLOBAL-FAP-A5',             sizing: 'fillPrintArea', template: 'tent' },    // INTERIM
  lanyard: { fulfilBy: 'prodigi',      sku: 'GLOBAL-FAP-A5',             sizing: 'fillPrintArea', template: 'lanyard' }, // INTERIM
  sticker: { fulfilBy: 'prodigi',      sku: 'PRODIGI-SKU-STICKER-SHEET', sizing: 'fillPrintArea', template: 'sticker' }, // TODO: real kiss-cut SKU
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
