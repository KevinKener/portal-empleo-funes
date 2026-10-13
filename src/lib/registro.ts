import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Server helpers for the public sign-up (Phase 3).
 * Anonymous visitors cannot read postulantes/empresas through RLS, so the
 * duplicate check uses the secret-key client and returns only a yes/no,
 * never data about the existing account (AGENTS.md §3).
 */

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
