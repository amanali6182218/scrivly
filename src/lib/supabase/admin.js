import { createClient } from '@supabase/supabase-js'

// Uses the service role key — ONLY use in server-side code (API routes, Server Components).
// Never import this in client components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
