import "server-only"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Server helpers for the public sign-up (Phase 3).
 * Anonymous visitors cannot read postulantes/empresas through RLS, so the
 * duplicate check uses the secret-key client and returns only a yes/no,
 * never data about the existing account (AGENTS.md §3).
 */

const COOKIE_EMAIL = "registro_email"

/**
 * Whether a DNI (postulantes) or CUIT (empresas) already belongs to a
 * confirmed account. An account that never confirmed its email is deleted
 * and the document is reported as free: it is the usual result of a typo in
 * the email, and keeping it would lock that DNI/CUIT out of the portal.
 * Throws on database errors.
 */
export async function documentoOcupado(tipo: "dni" | "cuit", documento: string): Promise<boolean> {
  const admin = createAdminClient()
  const consulta =
    tipo === "dni"
      ? admin.from("postulantes").select("perfil_id").eq("dni", documento)
      : admin.from("empresas").select("perfil_id").eq("cuit", documento)

  const { data, error } = await consulta.maybeSingle()
  if (error) throw error
  if (!data) return false

  const { data: usuario, error: errorUsuario } = await admin.auth.admin.getUserById(data.perfil_id)
  if (errorUsuario) throw errorUsuario
  if (usuario.user.email_confirmed_at) return true

  // Cascades to perfiles and postulantes/empresas (ON DELETE CASCADE)
  const { error: errorBorrado } = await admin.auth.admin.deleteUser(data.perfil_id)
  if (errorBorrado) throw errorBorrado
  return false
}

/**
 * Remembers which email is waiting for its confirmation code, so the
 * address never travels in the URL. httpOnly: only the server reads it.
 */
export async function guardarEmailPendiente(email: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_EMAIL, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/registro",
    maxAge: 60 * 60, // same as the code expiry in Supabase
  })
}

/** Email waiting for confirmation in this browser, or null. */
export async function leerEmailPendiente(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_EMAIL)?.value ?? null
}

/** Forgets the pending email once the account is confirmed. */
export async function borrarEmailPendiente(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete({ name: COOKIE_EMAIL, path: "/registro" })
}
