import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/database"

/**
 * Refreshes the Supabase session once per request, before any Server
 * Component runs (Server Components cannot write cookies). Returns the
 * response that carries the refreshed cookies and whether a session exists.
 */
export async function actualizarSesion(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          // Cache headers that keep CDNs from storing a response with auth cookies
          Object.entries(headers ?? {}).forEach(([nombre, valor]) => response.headers.set(nombre, valor))
        },
      },
    }
  )

  // getClaims() verifies the JWT; getSession() alone would trust the cookie.
  const { data } = await supabase.auth.getClaims()
  return { response, conSesion: Boolean(data?.claims) }
}
