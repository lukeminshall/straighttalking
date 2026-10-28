import { useCallback, useMemo, type ReactNode } from 'react'
import { DemoContext, STATIC, type DemoState, type SubmitPayload } from '@/demo/DemoContext'
import { hasSupabase } from '@/lib/supabase'
import { submitFeedback } from '@/lib/api'

/**
 * Production feedback provider. FeedbackFlow submits through the Demo context's
 * `submit`, so it stays backend-agnostic and the static single-file viewer never
 * bundles the backend client. Here that call persists to Supabase.
 *
 * Read-side state (feed, counters, board voices) still comes from the STATIC seed
 * for now — the dashboard and board live reads are wired separately — so every
 * surface renders sensibly before any real data exists. When no backend is
 * configured yet (e.g. a preview deploy before env vars are set) a submission is
 * acknowledged rather than erroring.
 */
export function LiveProvider({ children }: { children: ReactNode }) {
  const submit = useCallback(async (p: SubmitPayload) => {
    if (!hasSupabase) return
    await submitFeedback({
      reference: p.reference ?? '',
      rating: p.rating,
      recommend: p.recommend ?? 0,
      service: p.service,
      intent: p.intent,
      body: p.text,
      shareConsent: p.shareConsent ?? false,
      replyEmail: p.replyEmail,
    })
  }, [])

  const value = useMemo<DemoState>(() => ({ ...STATIC, submit }), [submit])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
