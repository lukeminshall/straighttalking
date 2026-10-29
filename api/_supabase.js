// Server-side Supabase admin client, for Vercel functions only. Uses the service
// role key (full bypass of RLS) so it must NEVER be imported into client code.
// Returns null when the service env vars are not set, so callers degrade cleanly.
import { createClient } from '@supabase/supabase-js'

let cached = null

export function adminClient() {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}

/** Find a practice id by slug, or null. */
export async function practiceIdBySlug(db, slug) {
  if (!db || !slug) return null
  const { data } = await db.from('practices').select('id').eq('slug', slug).maybeSingle()
  return data ? data.id : null
}
