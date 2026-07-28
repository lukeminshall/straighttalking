// Patient-reported outcomes, instrument coverage and the clinical journey.
// Sample data shaped like a real PROMs/PREMs backend would return.

export interface Pathway {
  id: string
  name: string
  instrument: string
  cohort: number
  preScore: number
  postScore: number
  scoreMax: number
  gain: number
  benchmarkGain: number
  /** pre/post pairing completion, % */
  completion: number
  /** relative cost index, 0-100 (x-axis of the value plot) */
  cost: number
  /** normalised health-gain index, 0-100 (y-axis of the value plot) */
  value: number
}

export const pathways: Pathway[] = [
  { id: 'cataract', name: 'Cataract surgery', instrument: 'Cat-PROM5', cohort: 402, preScore: 30, postScore: 74, scoreMax: 100, gain: 44, benchmarkGain: 40, completion: 84, cost: 34, value: 92 },
  { id: 'hip', name: 'Hip replacement', instrument: 'Oxford Hip Score', cohort: 214, preScore: 18, postScore: 41, scoreMax: 48, gain: 23, benchmarkGain: 21, completion: 78, cost: 72, value: 88 },
  { id: 'hernia', name: 'Groin hernia repair', instrument: 'EQ-5D-5L', cohort: 120, preScore: 62, postScore: 86, scoreMax: 100, gain: 24, benchmarkGain: 22, completion: 66, cost: 40, value: 80 },
  { id: 'knee', name: 'Knee replacement', instrument: 'Oxford Knee Score', cohort: 186, preScore: 20, postScore: 37, scoreMax: 48, gain: 17, benchmarkGain: 16, completion: 71, cost: 70, value: 72 },
  { id: 'shoulder', name: 'Shoulder decompression', instrument: 'Oxford Shoulder Score', cohort: 74, preScore: 22, postScore: 33, scoreMax: 48, gain: 11, benchmarkGain: 15, completion: 63, cost: 66, value: 46 },
]

export type InstrumentKind = 'PREM' | 'PROM'
export type PhinState = 'Submitting' | 'Ready' | 'Pilot' | 'n/a'

export interface Instrument {
  name: string
  kind: InstrumentKind
  scope: string
  timepoint: string
  response: number
  phin: PhinState
}

export const instruments: Instrument[] = [
  { name: 'Friends & Family Test', kind: 'PREM', scope: 'All touchpoints', timepoint: 'Point of care', response: 34, phin: 'n/a' },
  { name: 'PHIN satisfaction (QPROMs)', kind: 'PREM', scope: 'Admitted care', timepoint: 'Post-discharge', response: 61, phin: 'Submitting' },
  { name: 'EQ-5D-5L', kind: 'PROM', scope: 'Generic', timepoint: 'Baseline + 6mo', response: 68, phin: 'Submitting' },
  { name: 'Oxford Hip Score', kind: 'PROM', scope: 'Hip replacement', timepoint: 'Pre-op + 6mo', response: 78, phin: 'Submitting' },
  { name: 'Oxford Knee Score', kind: 'PROM', scope: 'Knee replacement', timepoint: 'Pre-op + 6mo', response: 71, phin: 'Submitting' },
  { name: 'Cat-PROM5', kind: 'PROM', scope: 'Cataract', timepoint: 'Pre + post', response: 84, phin: 'Submitting' },
  { name: 'ICHOM Low Back Pain set', kind: 'PROM', scope: 'MSK pathway', timepoint: 'Multi-point', response: 22, phin: 'Pilot' },
]

export interface JourneyStage {
  label: string
  capture: string
  kind: InstrumentKind | 'Governance' | 'Baseline'
}

export const journey: JourneyStage[] = [
  { label: 'Referral & triage', capture: 'Access experience', kind: 'PREM' },
  { label: 'Diagnosis (imaging)', capture: 'FFT + baseline EQ-5D', kind: 'Baseline' },
  { label: 'Decision to treat', capture: 'Pre-op PROM + expectations', kind: 'PROM' },
  { label: 'Treatment', capture: 'Experience + FFT', kind: 'PREM' },
  { label: 'Recovery', capture: 'Concerns to governance', kind: 'Governance' },
  { label: 'Outcome', capture: 'Post-op PROM, health gain', kind: 'PROM' },
]

export const outcomeSummary = {
  pairingRate: 74,
  phinReadyCount: 6,
  phinTotal: 7,
  healthGainVsNational: 12,
  eligibleForProm: 996,
  preCaptured: 921,
  postCaptured: 738,
}
