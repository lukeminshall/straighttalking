// Shared data shapes with NO runtime imports. Safe to import (as types) from any
// surface — including the ones the single-file viewer bundles — because a
// type-only import is erased at build time and never pulls in the Supabase client.

export interface FeedbackRow {
  id: string
  created_at: string
  reference: string
  rating: number | null
  recommend: number | null
  service: string | null
  intent: 'compliment' | 'concern' | 'comment'
  body: string | null
  flagged: boolean
  status: 'new' | 'seen' | 'resolved'
  share_consent: boolean
  published: boolean
}

export interface FeedbackSummary {
  captured: number
  compliments: number
  concerns: number
  comments: number
  open_flags: number
  avg_rating: number | null
  recommend_pct: number | null
}

export interface Voice {
  quote: string
  rating: number
  service: string
  when: string
}

export interface SaidDid {
  said: string
  did: string
}

export interface SupportPost {
  id: string
  alias: string
  topic: string | null
  body: string
  hearts: number
  created_at: string
  reply_count?: number
}

export interface SupportReply {
  id: string
  post_id: string
  alias: string
  body: string
  hearts: number
  created_at: string
}

/** A moderation report, enriched with the content it points at. */
export interface ReportRow {
  id: string
  target_type: 'post' | 'reply'
  target_id: string
  reason: string | null
  status: 'open' | 'actioned'
  created_at: string
  // Resolved content for the operator to judge (null if already removed/missing).
  content: string | null
  alias: string | null
  content_status: 'visible' | 'pending' | 'removed' | null
}
