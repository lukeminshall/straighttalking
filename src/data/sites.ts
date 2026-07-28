export type SiteStatus = 'good' | 'watch' | 'quiet'

export interface Site {
  id: string
  name: string
  /** Position on the schematic UK map, as viewport percentages. */
  map: { x: number; y: number }
  captureRate: number
  volume30d: number
  avgRating: number
  /** Sentiment split: [praise, neutral, concern] as percentages. */
  sentiment: [number, number, number]
  status: SiteStatus
  /** Four-week capture-rate delta, in points. */
  trend: number
}

export const STATUS_COLOUR: Record<SiteStatus, string> = {
  good: 'var(--st-teal-g)',
  watch: 'var(--st-amber)',
  quiet: 'var(--st-coral)',
}

export const STATUS_LABEL: Record<SiteStatus, string> = {
  good: 'On track',
  watch: 'Watch',
  quiet: 'Going quiet',
}

export const sites: Site[] = [
  { id: 'leeds', name: 'Leeds', map: { x: 54, y: 29 }, captureRate: 64, volume30d: 39, avgRating: 4.2, sentiment: [68, 17, 15], status: 'quiet', trend: -19 },
  { id: 'stockport', name: 'Stockport', map: { x: 45, y: 34 }, captureRate: 90, volume30d: 498, avgRating: 4.5, sentiment: [76, 15, 9], status: 'good', trend: 3 },
  { id: 'swansea', name: 'Swansea', map: { x: 29, y: 57 }, captureRate: 83, volume30d: 214, avgRating: 4.4, sentiment: [71, 18, 11], status: 'watch', trend: -6 },
  { id: 'london', name: 'London', map: { x: 61, y: 59 }, captureRate: 94, volume30d: 640, avgRating: 4.8, sentiment: [85, 11, 4], status: 'good', trend: 2 },
  { id: 'weybridge', name: 'Weybridge', map: { x: 56, y: 62 }, captureRate: 91, volume30d: 523, avgRating: 4.6, sentiment: [79, 14, 7], status: 'good', trend: 4 },
  { id: 'sussex', name: 'Sussex', map: { x: 60, y: 67 }, captureRate: 95, volume30d: 812, avgRating: 4.7, sentiment: [82, 12, 6], status: 'good', trend: 5 },
]
