import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Supabase client with the secret key: bypasses RLS. Server only.
 * Allowed uses (AGENTS.md §3): lookups the public flows need but RLS cannot
 * grant to an anonymous visitor (e.g. "is this DNI already registered?"),
 * and creating Admin accounts after checking the caller is an Admin.
 * Never use it to skip a business rule.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set")
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
