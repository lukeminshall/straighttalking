import { useEffect, useState } from 'react'
import { ClinicBoard } from './ClinicBoard'
import { hasSupabase } from '@/lib/supabase'
import { getPublishedVoices, getYouSaidWeDid, DEFAULT_PRACTICE, type Voice, type SaidDid } from '@/lib/api'

const FORM_BASE = (import.meta.env.VITE_FORM_BASE_URL as string | undefined) || 'https://straighttalking.org.uk/f'

/**
 * Production clinic board: fetches published, consented voices and you-said-we-did
 * pairs over the public (anon) client and feeds them to the presentational
 * ClinicBoard. Falls back to the demo seed when nothing is published yet or no
 * backend is configured. The single-file viewer renders ClinicBoard directly, so
 * it never imports this module (and never bundles the backend client).
 */
export function BoardLive() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [saidDid, setSaidDid] = useState<SaidDid[]>([])

  useEffect(() => {
    if (!hasSupabase) return
    let active = true
    getPublishedVoices().then((v) => active && setVoices(v)).catch(() => {})
    getYouSaidWeDid().then((s) => active && setSaidDid(s)).catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return <ClinicBoard voices={voices} saidDid={saidDid} formUrl={`${FORM_BASE}/${DEFAULT_PRACTICE}`} />
}
