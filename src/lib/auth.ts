import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Rol } from "@/lib/estados"

/**
 * Session and role helpers for Server Components, Server Actions and
 * layouts. The real authorization is still RLS in Postgres (AGENTS.md §3);
 * these decide where each person may navigate.
 */

export type Sesion = { userId: string; rol: Rol }

/** Home of each role's private area. */
export const AREA_POR_ROL: Record<Rol, string> = {
  postulante: "/postulante",
  empresa: "/empresa",
  admin: "/admin",
}

/**
 * Current user and role, or null without a session or without a profile
 * (e.g. the seed Admin before it is promoted). Cached per request, so the
 * header and the layout share one lookup.
 */
export const obtenerSesion = cache(async (): Promise<Sesion | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims.sub
  if (!userId) return null

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", userId).maybeSingle()
  return perfil ? { userId, rol: perfil.rol } : null
})

/**
 * Guard for a private area's layout: without a session goes to the login
 * page, with another role goes to that role's own area.
 */
export async function requerirRol(rol: Rol): Promise<Sesion> {
  const sesion = await obtenerSesion()
  if (!sesion) redirect(`/ingresar?siguiente=${encodeURIComponent(AREA_POR_ROL[rol])}`)
  if (sesion.rol !== rol) redirect(AREA_POR_ROL[sesion.rol])
  return sesion
}

/**
 * Where to go after signing in: the requested page when it is a local path
 * (never another site: "//evil.com" is rejected), otherwise the role's area.
 */
export function destinoTrasIngresar(siguiente: string | null, rol: Rol): string {
  if (siguiente && /^\/(?![/\\])/.test(siguiente)) return siguiente
  return AREA_POR_ROL[rol]
}
