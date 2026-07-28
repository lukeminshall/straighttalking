export type Route = 'google' | 'datix' | 'note'

export interface FeedbackItem {
  route: Route
  routeLabel: string
  quote: string
  location: string
  rating: number
  /** True when the item was just submitted by the person using the demo. */
  you?: boolean
}

export interface FunnelStep {
  label: string
  value: number
  colour: string
}

export interface Driver {
  label: string
  score: number
  colour: string
}

export const funnel: FunnelStep[] = [
  { label: 'Eligible visits', value: 3700, colour: '#155e56' },
  { label: 'Prompted to scan', value: 3610, colour: '#0e857d' },
  { label: 'Opened form', value: 3502, colour: '#13a093' },
  { label: 'Captured feedback', value: 3418, colour: '#1fbfa9' },
]

export const drivers: Driver[] = [
  { label: 'Bedside manner', score: 86, colour: '#2ad8be' },
  { label: 'Communication', score: 72, colour: '#1fbfa9' },
  { label: 'Cleanliness', score: 64, colour: '#13a093' },
  { label: 'Wait times', score: 41, colour: '#f0b44a' },
  { label: 'Reporting delay', score: 28, colour: '#ff7a66' },
]

export const captureTrend: number[] = [74, 76, 75, 79, 80, 82, 83, 85, 87, 88, 90.5, 92.4]
export const networkAverage = 82

export const feedbackStream: FeedbackItem[] = [
  { route: 'google', routeLabel: 'Google', quote: 'The radiographer explained every step and settled my nerves completely.', location: 'Sussex · MRI', rating: 5 },
  { route: 'datix', routeLabel: 'Datix', quote: 'Waited 40 minutes past my slot with no update. Felt forgotten.', location: 'Stockport · CT', rating: 2 },
  { route: 'note', routeLabel: 'Comment', quote: 'Parking was tricky but the scan was quick and staff were kind.', location: 'Weybridge · Ultrasound', rating: 4 },
  { route: 'google', routeLabel: 'Google', quote: 'Booked, scanned and out within half an hour. Lovely team.', location: 'London · X-ray', rating: 5 },
  { route: 'datix', routeLabel: 'Radar', quote: 'My report took longer than I was told and nobody rang to explain.', location: 'Swansea · MRI', rating: 2 },
  { route: 'google', routeLabel: 'Google', quote: 'Genuinely the calmest MRI I have had. Thank you to the whole team.', location: 'Sussex · MRI', rating: 5 },
  { route: 'note', routeLabel: 'Comment', quote: 'Reception was warm and the DEXA scan was painless and fast.', location: 'London · DEXA', rating: 4 },
  { route: 'datix', routeLabel: 'Datix', quote: 'Signage to the department was confusing, I nearly missed my slot.', location: 'Leeds · MRI', rating: 3 },
]
