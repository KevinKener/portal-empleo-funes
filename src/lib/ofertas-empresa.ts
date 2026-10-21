import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

/**
 * The signed-in company and its own offers (Phase 5). RLS returns only the
 * company's own rows ("ofertas: empresa ve las propias"), but every query also
 * filters by empresa_id: published offers of other companies are readable too.
 * Callers check the role first with requerirRol("empresa").
 */

export type EmpresaActual = Pick<Tables<"empresas">, "id" | "nombre_comercial" | "estado" | "constancia_arca_url" | "logo_url" | "motivo_rechazo">

export type OfertaEmpresa = Pick<
  Tables<"ofertas">,
  | "id"
  | "titulo"
  | "descripcion"
  | "requisitos"
  | "jornada"
  | "categoria_id"
  | "prioridad"
  | "estado"
  | "motivo_rechazo"
  | "fecha_publicacion"
  | "fecha_envio"
  | "fecha_cierre"
  | "updated_at"
> & { categoria_nombre: string | null }

const COLUMNAS =
  "id, titulo, descripcion, requisitos, jornada, categoria_id, prioridad, estado, motivo_rechazo, fecha_publicacion, fecha_envio, fecha_cierre, updated_at, categorias(nombre)"

type FilaOferta = Omit<OfertaEmpresa, "categoria_nombre"> & { categorias: { nombre: string } | null }

function aplanar({ categorias, ...oferta }: FilaOferta): OfertaEmpresa {
  return { ...oferta, categoria_nombre: categorias?.nombre ?? null }
}

/** The signed-in company, or null when the row is missing. Throws on database errors. */
export async function obtenerEmpresaActual(userId: string): Promise<EmpresaActual | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre_comercial, estado, constancia_arca_url, logo_url, motivo_rechazo")
    .eq("perfil_id", userId)
    .maybeSingle()

  if (error) throw new Error(`obtenerEmpresaActual: ${error.message}`)
  return data
}

/** Every offer of the company, last touched first. Throws on database errors. */
export async function listarOfertasEmpresa(empresaId: string): Promise<OfertaEmpresa[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ofertas")
    .select(COLUMNAS)
    .eq("empresa_id", empresaId)
    .order("updated_at", { ascending: false })

  if (error) throw new Error(`listarOfertasEmpresa: ${error.message}`)
  return data.map(aplanar)
}

/** One offer of the company, or null when it is missing or belongs to another one. Throws on database errors. */
export async function obtenerOfertaEmpresa(empresaId: string, id: string): Promise<OfertaEmpresa | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ofertas")
    .select(COLUMNAS)
    .eq("empresa_id", empresaId)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`obtenerOfertaEmpresa: ${error.message}`)
  return data ? aplanar(data) : null
}
