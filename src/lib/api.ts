import { supabase } from './supabase'
import type { FeedbackRow, FeedbackSummary, Voice, SaidDid, SupportPost, SupportReply } from './types'

export type { FeedbackRow, FeedbackSummary, Voice, SaidDid, SupportPost, SupportReply } from './types'

// Default practice for the single-tenant demo / first customer. A per-site
// deployment overrides this via VITE_DEFAULT_PRACTICE or a /f/:slug route.
export const DEFAULT_PRACTICE =
  (import.meta.env.VITE_DEFAULT_PRACTICE as string | undefined) || 'sussex-imaging'

/** Practice for the current page: the slug in a /f/:slug QR link, else the default. */
export function currentPracticeSlug(): string {
  if (typeof window === 'undefined') return DEFAULT_PRACTICE
  const m = window.location.pathname.match(/^\/f\/([a-z0-9-]+)/i)
  return m ? m[1].toLowerCase() : DEFAULT_PRACTICE
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------
export interface SubmitFeedbackInput {
  practiceSlug?: string
  reference: string
  rating: number
  recommend: number
  service: string
  intent: 'compliment' | 'concern' | 'comment'
  body: string
  shareConsent: boolean
  replyEmail?: string
  followup?: string
}

/** Persist a feedback submission. Throws 'no-backend' when running in demo mode. */
export async function submitFeedback(i: SubmitFeedbackInput): Promise<string> {
  if (!supabase) throw new Error('no-backend')
  const { data, error } = await supabase.rpc('submit_feedback', {
    p_practice_slug: i.practiceSlug ?? currentPracticeSlug(),
    p_reference: i.reference,
    p_rating: i.rating,
    p_recommend: i.recommend,
    p_service: i.service,
    p_intent: i.intent,
    p_body: i.body,
    p_share_consent: i.shareConsent,
    p_reply_email: i.replyEmail || null,
    p_followup: i.followup || null,
  })
  if (error) throw error
  return data as string
}

/** Operator view: recent feedback rows (requires an authenticated session). */
export async function listFeedback(limit = 50): Promise<FeedbackRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as FeedbackRow[]
}

export async function getFeedbackSummary(practiceSlug?: string): Promise<FeedbackSummary | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('feedback_summary', {
    p_practice_slug: practiceSlug ?? null,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return (row ?? null) as FeedbackSummary | null
}

// ---------------------------------------------------------------------------
// Board content (published voices + you-said-we-did)
// ---------------------------------------------------------------------------
export async function getPublishedVoices(practiceSlug = DEFAULT_PRACTICE): Promise<Voice[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('feedback')
    .select('body, rating, service, created_at, practices!inner(slug)')
    .eq('practices.slug', practiceSlug)
    .eq('published', true)
    .eq('share_consent', true)
    .not('body', 'is', null)
    .order('created_at', { ascending: false })
    .limit(12)
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    quote: String(r.body),
    rating: Number(r.rating) || 5,
    service: String(r.service ?? 'Visit'),
    when: timeAgo(String(r.created_at)),
  }))
}

export async function getYouSaidWeDid(practiceSlug = DEFAULT_PRACTICE): Promise<SaidDid[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('you_said_we_did')
    .select('said, did, created_at, practices!inner(slug)')
    .eq('practices.slug', practiceSlug)
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({ said: String(r.said), did: String(r.did) }))
}

// ---------------------------------------------------------------------------
// Peer-to-peer support
// ---------------------------------------------------------------------------
export async function listSupportPosts(practiceSlug = DEFAULT_PRACTICE): Promise<SupportPost[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('support_posts')
    .select('id, alias, topic, body, hearts, created_at, support_replies(count), practices!inner(slug)')
    .eq('practices.slug', practiceSlug)
    .eq('status', 'visible')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    alias: String(r.alias),
    topic: (r.topic as string) ?? null,
    body: String(r.body),
    hearts: Number(r.hearts) || 0,
    created_at: String(r.created_at),
    reply_count: Array.isArray(r.support_replies) ? Number((r.support_replies[0] as { count?: number })?.count ?? 0) : 0,
  }))
}

export async function listReplies(postId: string): Promise<SupportReply[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('support_replies')
    .select('id, post_id, alias, body, hearts, created_at')
    .eq('post_id', postId)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as SupportReply[]
}

export async function submitSupportPost(input: {
  practiceSlug?: string
  alias: string
  topic: string
  body: string
}): Promise<string> {
  if (!supabase) throw new Error('no-backend')
  const { data, error } = await supabase.rpc('submit_support_post', {
    p_practice_slug: input.practiceSlug ?? DEFAULT_PRACTICE,
    p_alias: input.alias,
    p_topic: input.topic,
    p_body: input.body,
  })
  if (error) throw error
  return data as string
}

export async function submitSupportReply(input: {
  postId: string
  alias: string
  body: string
}): Promise<string> {
  if (!supabase) throw new Error('no-backend')
  const { data, error } = await supabase.rpc('submit_support_reply', {
    p_post_id: input.postId,
    p_alias: input.alias,
    p_body: input.body,
  })
  if (error) throw error
  return data as string
}

export async function heartPost(id: string): Promise<void> {
  if (!supabase) return
  await supabase.rpc('heart_post', { p_id: id })
}

export async function heartReply(id: string): Promise<void> {
  if (!supabase) return
  await supabase.rpc('heart_reply', { p_id: id })
}

export async function reportContent(targetType: 'post' | 'reply', targetId: string, reason?: string): Promise<void> {
  if (!supabase) return
  await supabase.rpc('report_content', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason ?? null,
  })
}

// ---------------------------------------------------------------------------
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'recently'
  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
