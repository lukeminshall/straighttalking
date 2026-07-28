export interface Theme {
  label: string
  count: number
  negative: boolean
  delta: string
}

export const themes: Theme[] = [
  { label: 'Felt reassured', count: 214, negative: false, delta: '+22%' },
  { label: 'Quick & efficient', count: 188, negative: false, delta: '+14%' },
  { label: 'Warm reception', count: 151, negative: false, delta: '+9%' },
  { label: 'Clear explanation', count: 133, negative: false, delta: '+7%' },
  { label: 'Wait times', count: 96, negative: true, delta: '+31%' },
  { label: 'Report delays', count: 54, negative: true, delta: '+18%' },
  { label: 'Parking', count: 47, negative: true, delta: '-5%' },
]

export interface YouSaidWeDid {
  said: string
  did: string
}

export const youSaidWeDid: YouSaidWeDid[] = [
  { said: 'Parking felt confusing on arrival.', did: 'New signage from the car park and a map added to your appointment letter.' },
  { said: 'I waited without any update on time.', did: 'Reception now gives a wait-time update every 15 minutes.' },
  { said: 'Changing felt a little exposing.', did: 'Private changing and warmer gowns added in every MRI suite.' },
  { said: 'My report felt slow to arrive.', did: 'Same-week reporting introduced for routine scans.' },
]

export interface BoardVoice {
  quote: string
  rating: number
  service: string
  when: string
}

export const boardVoices: BoardVoice[] = [
  { quote: 'The radiographer explained every step and completely settled my nerves.', rating: 5, service: 'MRI', when: '2 hours ago' },
  { quote: 'Booked, scanned and out within half an hour. Genuinely lovely team.', rating: 5, service: 'X-ray', when: 'today' },
  { quote: 'The calmest MRI I have ever had. Thank you to everyone there.', rating: 5, service: 'MRI', when: 'yesterday' },
  { quote: 'Reception was so warm it made an anxious morning feel easy.', rating: 5, service: 'Ultrasound', when: 'yesterday' },
  { quote: 'Someone actually listened. I felt cared for from start to finish.', rating: 5, service: 'CT', when: '2 days ago' },
  { quote: 'Quick, kind, and clear about exactly what happens next.', rating: 4, service: 'DEXA', when: '3 days ago' },
]

export const clinics = [
  'Sussex (Haywards Heath)',
  'Weybridge',
  'London (Harley Street)',
  'Stockport',
  'Swansea (Singleton)',
  'Leeds',
]

export const services = ['MRI', 'CT', 'Ultrasound', 'X-ray', 'DEXA (bone density)', 'Consultation / clinic']
