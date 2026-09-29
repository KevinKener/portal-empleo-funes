import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Cliente de Supabase para Server Components, Route Handlers y Server Actions
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Llamado desde un Server Component: no se pueden escribir cookies.
            // Se puede ignorar si no se usa autenticación con refresco de sesión.
          }
        },
      },
    }
  )
}
