import { createContext, useContext } from 'react'
import type { FeedbackRow, FeedbackSummary, ReportRow } from '@/lib/types'

// The data + actions operator surfaces (Dashboard, Moderate) consume. This module
// has NO runtime imports beyond React + types, so importing it never pulls the
// Supabase or Clerk clients into a bundle. The live implementation lives in
// OperatorProvider (production only); the static default below drives the demo
// shell and the single-file viewer, which render illustrative sample data.

export interface OperatorState {
  /** true when backed by a live, authenticated session (real figures) */
  live: boolean
  loading: boolean
  /** true once an operator is signed in (always true in demo/no-auth mode) */
  signedIn: boolean
  summary: FeedbackSummary | null
  recent: FeedbackRow[]
  flagged: FeedbackRow[]
  reports: ReportRow[]
  refresh: () => void | Promise<void>
  resolveFeedback: (id: string) => Promise<void>
  setPostStatus: (id: string, status: 'visible' | 'removed') => Promise<void>
  setReplyStatus: (id: string, status: 'visible' | 'removed') => Promise<void>
  resolveReport: (id: string) => Promise<void>
  signOut: () => void | Promise<void>
}

const noop = async () => {}

export const OPERATOR_STATIC: OperatorState = {
  live: false,
  loading: false,
  signedIn: true,
  summary: null,
  recent: [],
  flagged: [],
  reports: [],
  refresh: noop,
  resolveFeedback: noop,
  setPostStatus: noop,
  setReplyStatus: noop,
  resolveReport: noop,
  signOut: noop,
}

export const OperatorContext = createContext<OperatorState>(OPERATOR_STATIC)

export const useOperator = () => useContext(OperatorContext)
