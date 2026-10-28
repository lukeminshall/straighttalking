import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// The app runs in two modes:
//  - demo (no env set): everything falls back to the seeded sample data, so the
//    marketing surfaces and the interactive demo work with zero configuration.
//  - live (env set): the patient app persists real feedback and the operator
//    surfaces read live data.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabase = Boolean(url && anon)

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anon as string, { auth: { persistSession: false } })
  : null
