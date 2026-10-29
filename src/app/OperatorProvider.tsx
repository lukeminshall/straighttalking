import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { hasSupabase } from '@/lib/supabase'
import { hasClerk } from './auth'
import { OperatorContext, OPERATOR_STATIC, type OperatorState } from './operator-context'
import type { FeedbackRow, FeedbackSummary, ReportRow } from '@/lib/types'
import {
  getSummary,
  listRecentFeedback,
  listFlaggedFeedback,
  listReports,
  resolveFeedback as apiResolveFeedback,
  setPostStatus as apiSetPostStatus,
  setReplyStatus as apiSetReplyStatus,
  resolveReport as apiResolveReport,
} from '@/lib/operator-api'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Supplies live, authenticated operator data (summary, recent feedback,
 * moderation queues) to Dashboard and Moderate. Live reads require BOTH Clerk and
 * Supabase; otherwise the static demo state is provided so every surface still
 * renders illustrative sample data. Imported only by the production router app.
 */
export function OperatorProvider({ children }: { children: ReactNode }) {
  if (hasClerk && hasSupabase) return <OperatorProviderLive>{children}</OperatorProviderLive>
  return <OperatorContext.Provider value={OPERATOR_STATIC}>{children}</OperatorContext.Provider>
}

function OperatorProviderLive({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)
  const [recent, setRecent] = useState<FeedbackRow[]>([])
  const [flagged, setFlagged] = useState<FeedbackRow[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])

  // A Supabase client whose Authorization header carries the Clerk session token.
  // Uses Clerk's native Supabase integration (not the deprecated JWT template):
  // the plain session token already carries role=authenticated once the Supabase
  // integration is enabled in the Clerk dashboard, so Supabase RLS admits operators.
  const db = useMemo<SupabaseClient | null>(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return null
    return createClient(SUPABASE_URL, SUPABASE_ANON, {
      // Native integration: no template. Empty string when signed out, so RLS
      // simply treats the request as anon.
      accessToken: async () => (await getToken()) ?? '',
    })
  }, [getToken])

  const refresh = useCallback(async () => {
    if (!db || !isSignedIn) return
    setLoading(true)
    try {
      const [s, r, f, rep] = await Promise.all([
        getSummary(db).catch(() => null),
        listRecentFeedback(db).catch(() => []),
        listFlaggedFeedback(db).catch(() => []),
        listReports(db).catch(() => []),
      ])
      setSummary(s)
      setRecent(r)
      setFlagged(f)
      setReports(rep)
    } finally {
      setLoading(false)
    }
  }, [db, isSignedIn])

  useEffect(() => {
    if (isLoaded && isSignedIn) void refresh()
  }, [isLoaded, isSignedIn, refresh])

  const resolveFeedback = useCallback(
    async (id: string) => {
      if (!db) return
      await apiResolveFeedback(db, id)
      setFlagged((prev) => prev.filter((f) => f.id !== id))
      setRecent((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'resolved' } : f)))
    },
    [db],
  )

  const setPostStatus = useCallback(
    async (id: string, status: 'visible' | 'removed') => {
      if (!db) return
      await apiSetPostStatus(db, id, status)
      await refresh()
    },
    [db, refresh],
  )

  const setReplyStatus = useCallback(
    async (id: string, status: 'visible' | 'removed') => {
      if (!db) return
      await apiSetReplyStatus(db, id, status)
      await refresh()
    },
    [db, refresh],
  )

  const resolveReport = useCallback(
    async (id: string) => {
      if (!db) return
      await apiResolveReport(db, id)
      setReports((prev) => prev.filter((r) => r.id !== id))
    },
    [db],
  )

  const value = useMemo<OperatorState>(
    () => ({
      live: true,
      loading,
      signedIn: Boolean(isSignedIn),
      summary,
      recent,
      flagged,
      reports,
      refresh,
      resolveFeedback,
      setPostStatus,
      setReplyStatus,
      resolveReport,
      signOut: () => signOut(),
    }),
    [loading, isSignedIn, summary, recent, flagged, reports, refresh, resolveFeedback, setPostStatus, setReplyStatus, resolveReport, signOut],
  )

  return <OperatorContext.Provider value={value}>{children}</OperatorContext.Provider>
}
