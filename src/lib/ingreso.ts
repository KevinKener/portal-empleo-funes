import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { soloDigitos } from "@/lib/validaciones/auth"

/**
 * Email behind a login identifier. Job seekers sign in with their DNI and
 * companies with their CUIT, but Supabase Auth works with emails, so the
 * email is resolved here, on the server, and never sent to the browser
 * (AGENTS.md §3: no endpoint returns "the email for this DNI").
 * Returns null when the identifier matches no account. Throws on errors.
 */
export async function emailParaIngresar(identificador: string): Promise<string | null> {
  const valor = identificador.trim()
  if (valor.includes("@")) return valor.toLowerCase()

  const digitos = soloDigitos(valor)
  const admin = createAdminClient()
  let consulta
  if (/^\d{7,8}$/.test(digitos)) {
    consulta = admin.from("postulantes").select("perfil_id").eq("dni", digitos)
  } else if (/^\d{11}$/.test(digitos)) {
    consulta = admin.from("empresas").select("perfil_id").eq("cuit", digitos)
  } else {
    return null
  }

  const { data, error } = await consulta.maybeSingle()
  if (error) throw error
  if (!data) return null

  const { data: usuario, error: errorUsuario } = await admin.auth.admin.getUserById(data.perfil_id)
  if (errorUsuario) throw errorUsuario
  return usuario.user.email ?? null
}
