import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { feedbackStream, type FeedbackItem, type Route } from '@/data/feedback'
import { boardVoices as seedVoices, type BoardVoice } from '@/data/board'

export interface SubmitPayload {
  intent: 'compliment' | 'concern' | 'comment'
  rating: number
  text: string
  service: string
  site: string
}

export interface DemoEvent {
  id: number
  route: Route
  label: string
  praise: boolean
}

interface DemoState {
  feed: FeedbackItem[]
  capturedCount: number
  googlePushed: number
  concernsLogged: number
  boardVoices: BoardVoice[]
  lastEvent: DemoEvent | null
  /** true inside the interactive demo shell, false in the production app */
  live: boolean
  submit: (payload: SubmitPayload) => void
  clearEvent: () => void
}

const SEED = { captured: 3418, google: 312, concerns: 37 }

const STATIC: DemoState = {
  feed: feedbackStream,
  capturedCount: SEED.captured,
  googlePushed: SEED.google,
  concernsLogged: SEED.concerns,
  boardVoices: seedVoices,
  lastEvent: null,
  live: false,
  submit: () => {},
  clearEvent: () => {},
}

const DemoContext = createContext<DemoState>(STATIC)

export const useDemo = () => useContext(DemoContext)

const routeFor = (intent: SubmitPayload['intent']): Route =>
  intent === 'compliment' ? 'google' : intent === 'concern' ? 'datix' : 'note'

const labelFor = (route: Route) => (route === 'google' ? 'Google' : route === 'datix' ? 'Datix / Radar' : 'the site')

const fallbackQuote = (intent: SubmitPayload['intent']) =>
  intent === 'concern'
    ? 'Something about my visit could have gone better.'
    : intent === 'comment'
      ? 'A quick thought about my visit today.'
      : 'A really positive experience today, thank you.'

export function DemoProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<FeedbackItem[]>(feedbackStream)
  const [capturedCount, setCaptured] = useState(SEED.captured)
  const [googlePushed, setGoogle] = useState(SEED.google)
  const [concernsLogged, setConcerns] = useState(SEED.concerns)
  const [boardVoices, setVoices] = useState<BoardVoice[]>(seedVoices)
  const [lastEvent, setLastEvent] = useState<DemoEvent | null>(null)

  const submit = useCallback((p: SubmitPayload) => {
    const route = routeFor(p.intent)
    const quote = p.text.trim() || fallbackQuote(p.intent)
    const rating = p.rating || (p.intent === 'concern' ? 2 : 5)
    const item: FeedbackItem = {
      route,
      routeLabel: route === 'datix' ? 'Datix' : route === 'google' ? 'Google' : 'Comment',
      quote,
      location: `${p.site || 'Sussex'} · ${p.service || 'Visit'}`,
      rating,
      you: true,
    }
    setFeed((f) => [item, ...f].slice(0, 12))
    setCaptured((c) => c + 1)
    if (route === 'google') {
      setGoogle((g) => g + 1)
      setVoices((v) => [{ quote, rating, service: p.service || 'Visit', when: 'just now' }, ...v].slice(0, 8))
    }
    if (route === 'datix') setConcerns((c) => c + 1)
    setLastEvent({ id: Date.now(), route, label: labelFor(route), praise: route === 'google' })
  }, [])

  const clearEvent = useCallback(() => setLastEvent(null), [])

  const value = useMemo<DemoState>(
    () => ({ feed, capturedCount, googlePushed, concernsLogged, boardVoices, lastEvent, live: true, submit, clearEvent }),
    [feed, capturedCount, googlePushed, concernsLogged, boardVoices, lastEvent, submit, clearEvent],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
