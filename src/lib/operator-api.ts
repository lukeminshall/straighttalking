// Operator-only data access. Every function takes an explicit (authenticated)
// Supabase client — the Clerk-backed client built in OperatorProvider — rather
// than the module-level anon client. This file is imported ONLY by
// OperatorProvider, so it never reaches the public/viewer bundles.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FeedbackRow, FeedbackSummary, ReportRow } from './types'

/** Aggregate counts for the operator dashboard (authenticated session). */
export async function getSummary(db: SupabaseClient, slug?: string): Promise<FeedbackSummary | null> {
  const { data, error } = await db.rpc('feedback_summary', { p_practice_slug: slug ?? null })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return (row ?? null) as FeedbackSummary | null
}

/** Recent feedback, newest first. RLS requires an authenticated session. */
export async function listRecentFeedback(db: SupabaseClient, limit = 40): Promise<FeedbackRow[]> {
  const { data, error } = await db
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as FeedbackRow[]
}

/** Open, flagged feedback that still needs an operator's eyes. */
export async function listFlaggedFeedback(db: SupabaseClient): Promise<FeedbackRow[]> {
  const { data, error } = await db
    .from('feedback')
    .select('*')
    .eq('flagged', true)
    .neq('status', 'resolved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as FeedbackRow[]
}

export async function resolveFeedback(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('feedback').update({ status: 'resolved' }).eq('id', id)
  if (error) throw error
}

export async function setPostStatus(db: SupabaseClient, id: string, status: 'visible' | 'removed'): Promise<void> {
  const { error } = await db.from('support_posts').update({ status }).eq('id', id)
  if (error) throw error
}

export async function setReplyStatus(db: SupabaseClient, id: string, status: 'visible' | 'removed'): Promise<void> {
  const { error } = await db.from('support_replies').update({ status }).eq('id', id)
  if (error) throw error
}

export async function resolveReport(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('support_reports').update({ status: 'actioned' }).eq('id', id)
  if (error) throw error
}

/** Open reports, enriched with the reported content so an operator can judge it. */
export async function listReports(db: SupabaseClient): Promise<ReportRow[]> {
  const { data, error } = await db
    .from('support_reports')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as Array<{
    id: string
    target_type: 'post' | 'reply'
    target_id: string
    reason: string | null
    status: 'open' | 'actioned'
    created_at: string
  }>

  // Resolve the content each report points at, in two grouped lookups.
  const postIds = rows.filter((r) => r.target_type === 'post').map((r) => r.target_id)
  const replyIds = rows.filter((r) => r.target_type === 'reply').map((r) => r.target_id)

  const posts = postIds.length
    ? (await db.from('support_posts').select('id, body, alias, status').in('id', postIds)).data ?? []
    : []
  const replies = replyIds.length
    ? (await db.from('support_replies').select('id, body, alias, status').in('id', replyIds)).data ?? []
    : []

  const byId = new Map<string, { body: string; alias: string; status: string }>()
  for (const p of posts as Array<Record<string, unknown>>) {
    byId.set(String(p.id), { body: String(p.body), alias: String(p.alias), status: String(p.status) })
  }
  for (const r of replies as Array<Record<string, unknown>>) {
    byId.set(String(r.id), { body: String(r.body), alias: String(r.alias), status: String(r.status) })
  }

  return rows.map((r) => {
    const hit = byId.get(r.target_id)
    return {
      ...r,
      content: hit ? hit.body : null,
      alias: hit ? hit.alias : null,
      content_status: hit ? (hit.status as ReportRow['content_status']) : null,
    }
  })
}
