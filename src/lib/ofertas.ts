import { createClient } from "@/lib/supabase/server"
import type { FiltrosOfertas } from "@/lib/validaciones/ofertas"
import type { Tables } from "@/types/database"

/**
 * Public offers, read from the ofertas_publicas view. The view already keeps
 * only `publicada` offers (Rule 2) and exposes no personal data or CUIT
 * (AGENTS.md §3), so these helpers are safe for anonymous visitors.
 * Shared by the Route Handlers and the public Server Components.
 */

export const OFERTAS_POR_PAGINA = 12

export type OfertaPublica = Tables<"ofertas_publicas">

export type PaginaOfertas = {
  ofertas: OfertaPublica[]
  total: number
  pagina: number
  porPagina: number
}

const COLUMNAS =
  "id, titulo, descripcion, requisitos, jornada, fecha_publicacion, categoria_id, categoria_nombre, empresa_nombre"

// PostgREST answers 416 with this code when the page starts past the last row.
const RANGO_FUERA_DE_LIMITE = "PGRST103"

/**
 * One page of published offers, newest first, optionally filtered by
 * category. A page past the end comes back empty with the real total.
 * Throws on database errors.
 */
export async function listarOfertasPublicas({
  categoria,
  pagina,
}: FiltrosOfertas): Promise<PaginaOfertas> {
  const supabase = await createClient()
  const desde = (pagina - 1) * OFERTAS_POR_PAGINA

  let consulta = supabase
    .from("ofertas_publicas")
    .select(COLUMNAS, { count: "exact" })
    .order("fecha_publicacion", { ascending: false })
    .order("id")
    .range(desde, desde + OFERTAS_POR_PAGINA - 1)
  if (categoria) consulta = consulta.eq("categoria_id", categoria)

  const { data, count, error } = await consulta

  if (error?.code === RANGO_FUERA_DE_LIMITE) {
    return { ofertas: [], total: await contarOfertasPublicas(categoria), pagina, porPagina: OFERTAS_POR_PAGINA }
  }
  if (error) throw new Error(`listarOfertasPublicas: ${error.message}`)

  return { ofertas: data, total: count ?? 0, pagina, porPagina: OFERTAS_POR_PAGINA }
}

async function contarOfertasPublicas(categoria: string | null): Promise<number> {
  const supabase = await createClient()
  let consulta = supabase.from("ofertas_publicas").select("id", { count: "exact", head: true })
  if (categoria) consulta = consulta.eq("categoria_id", categoria)

  const { count, error } = await consulta
  if (error) throw new Error(`contarOfertasPublicas: ${error.message}`)
  return count ?? 0
}

/**
 * A single published offer, or null when it does not exist or is not
 * published (both look the same to the public, Rule 2). Throws on database errors.
 */
export async function obtenerOfertaPublica(id: string): Promise<OfertaPublica | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ofertas_publicas")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`obtenerOfertaPublica: ${error.message}`)
  return data
}
