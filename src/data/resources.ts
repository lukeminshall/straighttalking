// Materials catalogue, shared by first-time setup and admin reorder.
// Two groups: print materials (download and print your own, or order printed
// and shipped) and digital assets (no printing, included with the plan).
// Print item ids double as the printable size (see /api/printable?size=<id>).

import type { IconName } from '@/components/ui/Icon'

export type ResourceCategory = 'print' | 'digital'

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
  /** printable size for /api/printable (print items only) */
  size?: string
}

export interface CategoryMeta {
  key: ResourceCategory
  label: string
  note: string
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'print', label: 'Print materials', note: 'Download and print your own, or order them printed and shipped to each site.' },
  { key: 'digital', label: 'Digital', note: 'No printing, live the moment you go live. Included with your plan.' },
]

export const RESOURCES: Resource[] = [
  // Print (id doubles as the printable size)
  { id: 'a3', size: 'a3', name: 'A3 poster', desc: 'Waiting rooms and corridors', category: 'print', example: 'A large A3 poster with your code and the "help the next patient" message, for a waiting-room or corridor wall.', icon: 'poster', price: 3, qty: 2 },
  { id: 'a4', size: 'a4', name: 'A4 poster', desc: 'Desks, doors and noticeboards', category: 'print', example: 'A4 posters for reception desks, doors and noticeboards, wherever a patient waits or passes.', icon: 'poster', price: 2, qty: 3 },
  { id: 'a5', size: 'a5', name: 'A5 poster', desc: 'Handouts and letter packs', category: 'print', example: 'A5 sheets to hand over or drop into a letter or discharge pack, so the invite reaches people who were not asked in person.', icon: 'poster', price: 1.5, qty: 4 },
  { id: 'card', size: 'card', name: 'Business cards', desc: 'Handed out at the desk', category: 'print', example: 'Business-card-sized cards a receptionist hands over on the way out, with your code and "scan to tell us how today went".', icon: 'card', price: 12, qty: 1, unit: 'pack of 100' },
  { id: 'postcard', size: 'postcard', name: 'Postcards', desc: 'Handed out and posted', category: 'print', example: 'A6 postcards to hand out or post, with a little more room for the message than a business card.', icon: 'card', price: 9, qty: 1, unit: 'pack of 50' },

  // Digital
  { id: 'emailsig', name: 'Email-signature banner', desc: 'Under every team email', category: 'digital', example: 'A tidy banner that drops into your team email signatures, so every message you already send quietly carries the invite.', icon: 'mail', price: 0, qty: 1 },
  { id: 'smskit', name: 'SMS and confirmation link kit', desc: 'Booking and reminder texts', category: 'digital', example: 'A ready-made link and wording for your booking confirmations and reminder texts, so patients can give feedback from the message they already get.', icon: 'message', price: 0, qty: 1 },
  { id: 'screen', name: 'Waiting-room screen loop', desc: 'Any display with a browser', category: 'digital', example: 'A full-screen slide for a waiting-room display, showing the code and a rolling line of recent patient comments. Open it in a browser, no software to install.', icon: 'monitor', price: 0, qty: 1 },
  { id: 'embed', name: 'Website embed widget', desc: 'Your site and patient portal', category: 'digital', example: 'A small snippet that puts a "how was your visit" button on your own website or patient portal, styled to match your pages.', icon: 'code', price: 0, qty: 0 },
]

export const ANNUAL_FEE = 200

export const gbp = (n: number) => `£${n.toFixed(2)}`

/** Price label that reads "Included" for the zero-cost digital assets. */
export const priceLabel = (r: Resource) => (r.price === 0 ? 'Included' : gbp(r.price))

export const resourcesByCategory = (key: ResourceCategory) => RESOURCES.filter((r) => r.category === key)

/** The self-serve printable formats, in display order. */
export const PRINT_SIZES = RESOURCES.filter((r) => r.category === 'print' && r.size).map((r) => ({
  size: r.size as string,
  label: r.name,
}))
