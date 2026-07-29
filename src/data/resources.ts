// Materials catalogue, shared by first-time setup and admin reorder.
// Three groups: printed and physical, digital (no printing, live instantly),
// and NFC tap tags. Digital assets are included at no cost with the plan.

import type { IconName } from '@/components/ui/Icon'

export type ResourceCategory = 'physical' | 'digital' | 'nfc'

export interface Resource {
  id: string
  name: string
  desc: string
  example: string
  icon: IconName
  category: ResourceCategory
  price: number
  /** default quantity suggested at first setup */
  qty: number
  /** unit the price/quantity is counted in, shown in the UI */
  unit?: string
}

export interface CategoryMeta {
  key: ResourceCategory
  label: string
  note: string
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'physical', label: 'Printed and physical', note: 'Made to order and shipped to each site. Priced at cost, never per scan.' },
  { key: 'digital', label: 'Digital', note: 'No printing, live the moment you go live. Included with your plan.' },
  { key: 'nfc', label: 'Tap to open', note: 'For patients who would rather tap than scan. Works alongside every QR.' },
]

export const RESOURCES: Resource[] = [
  // Printed and physical
  { id: 'stand', name: 'Acrylic QR table stand', desc: 'Reception and clinic desks', category: 'physical', example: 'A small clear stand that sits on a desk holding your QR code, like the table-number holders in a cafe. Patients scan while they wait.', icon: 'stand', price: 6, qty: 4 },
  { id: 'card', name: 'QR counter cards', desc: 'Handed out at discharge', category: 'physical', example: 'Business-card-sized cards a receptionist hands over on the way out: "scan to tell us how today went". Good for pockets and bags.', icon: 'card', price: 9, qty: 2, unit: 'pack of 25' },
  { id: 'poster', name: 'Waiting-room poster (A2)', desc: 'Wall poster for waiting areas', category: 'physical', example: 'A large A2 wall poster with a scannable code and the "help the next patient" message, for the waiting room or corridor.', icon: 'poster', price: 4, qty: 3 },
  { id: 'sticker', name: 'QR sticker sheet', desc: 'Doors, mirrors, changing rooms', category: 'physical', example: 'Peel-and-stick codes for doors, mirrors and changing-room walls, so a patient can scan from wherever they happen to be.', icon: 'sticker', price: 7, qty: 1, unit: 'pack of 50' },
  { id: 'banner', name: 'Pull-up banner', desc: 'Foyers, atriums and events', category: 'physical', example: 'A free-standing roller banner about two metres tall for a foyer, atrium or open day. Rolls back into its own case between uses.', icon: 'banner', price: 45, qty: 0 },
  { id: 'tent', name: 'Table-tent cards', desc: 'Cafe tables and consult desks', category: 'physical', example: 'Folded cards that stand up on their own on a cafe table or a consultation desk, with the code facing the patient.', icon: 'tent', price: 8, qty: 0, unit: 'pack of 20' },
  { id: 'vinyl', name: 'Window and door vinyl', desc: 'Entrances and glass partitions', category: 'physical', example: 'Hard-wearing decals for a glass door or window, so people can scan on the way in or while they queue outside.', icon: 'window', price: 12, qty: 0, unit: 'pack of 6' },
  { id: 'lanyard', name: 'Lanyard code cards', desc: 'Worn by staff and volunteers', category: 'physical', example: 'A code card that clips onto a staff lanyard, so anyone from the team can offer it at the bedside or in a corridor.', icon: 'lanyard', price: 11, qty: 0, unit: 'pack of 10' },
  { id: 'insert', name: 'Appointment-letter inserts', desc: 'Posted and discharge packs', category: 'physical', example: 'Slips sized to drop into an appointment letter or discharge pack, so the invite reaches people who were not asked in person.', icon: 'letter', price: 15, qty: 0, unit: 'pack of 250' },

  // Digital
  { id: 'emailsig', name: 'Email-signature banner', desc: 'Under every team email', category: 'digital', example: 'A tidy banner that drops into your team email signatures, so every message you already send quietly carries the invite.', icon: 'mail', price: 0, qty: 1 },
  { id: 'smskit', name: 'SMS and confirmation link kit', desc: 'Booking and reminder texts', category: 'digital', example: 'A ready-made link and wording to add to your booking confirmations and reminder texts, so patients can give feedback from the message they already get.', icon: 'message', price: 0, qty: 1 },
  { id: 'screen', name: 'Waiting-room screen loop', desc: 'Any display with a browser', category: 'digital', example: 'A full-screen slide for a waiting-room display, showing the code and a rolling line of recent patient comments. Open it in a browser, no software to install.', icon: 'monitor', price: 0, qty: 1 },
  { id: 'embed', name: 'Website embed widget', desc: 'Your site and patient portal', category: 'digital', example: 'A small snippet that puts a "how was your visit" button on your own website or patient portal, styled to match your pages.', icon: 'code', price: 0, qty: 0 },

  // NFC
  { id: 'nfctag', name: 'NFC tap tags', desc: 'Tap a phone, no camera needed', category: 'nfc', example: 'Discreet tags that open your feedback page when a patient taps their phone against them, for anyone who finds scanning a QR fiddly.', icon: 'nfc', price: 14, qty: 0, unit: 'pack of 5' },
]

export const ANNUAL_FEE = 200

export const gbp = (n: number) => `£${n.toFixed(2)}`

/** Price label that reads "Included" for the zero-cost digital assets. */
export const priceLabel = (r: Resource) => (r.price === 0 ? 'Included' : gbp(r.price))

export const resourcesByCategory = (key: ResourceCategory) => RESOURCES.filter((r) => r.category === key)
