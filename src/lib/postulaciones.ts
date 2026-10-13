import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Enums } from "@/types/database"

/**
 * The signed-in job seeker's applications. Only columns the job seeker may
 * read are listed (notas_admin and decision_empresa are hidden by column
 * grants, Rules 1 and 11; select("*") would fail).
 */

export type MiPostulacion = {
  id: string
  estado: Enums<"estado_postulacion">
  motivo_rechazo: Enums<"motivo_rechazo_postulacion"> | null
  created_at: string
  oferta: {
    id: string
    titulo: string
    estado: Enums<"estado_oferta">
    categoria: string | null
  } | null
}

/** Newest first; `limite` for the panel preview. Throws on errors. */
export async function listarMisPostulaciones(postulanteId: string, limite?: number): Promise<MiPostulacion[]> {
  const supabase = await createClient()
  let consulta = supabase
    .from("postulaciones")
    .select("id, estado, motivo_rechazo, created_at, ofertas(id, titulo, estado, categorias(nombre))")
    .eq("postulante_id", postulanteId)
    .order("created_at", { ascending: false })
  if (limite) consulta = consulta.limit(limite)

  const { data, error } = await consulta
  if (error) throw error
  return data.map(({ ofertas, ...postulacion }) => ({
    ...postulacion,
    oferta: ofertas
      ? { id: ofertas.id, titulo: ofertas.titulo, estado: ofertas.estado, categoria: ofertas.categorias?.nombre ?? null }
      : null,
  }))
}

/** Whether the job seeker already applied to this offer (Rule 8). */
export async function yaSePostulo(postulanteId: string, ofertaId: string): Promise<boolean> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("postulaciones")
    .select("id", { count: "exact", head: true })
    .eq("postulante_id", postulanteId)
    .eq("oferta_id", ofertaId)
  if (error) throw error
  return (count ?? 0) > 0
}
