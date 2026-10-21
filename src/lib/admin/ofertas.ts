import "server-only"
import { DIAS_SIN_POSTULANTES } from "@/lib/admin/bandeja"
import { createClient } from "@/lib/supabase/server"
import type { EstadoOferta, EstadoPostulacion } from "@/lib/estados"
import type { Tables } from "@/types/database"

/**
 * Offers as the Employment Office sees them (branch B, docs/research/admin.md
 * §5). Read with the Admin's own session ("ofertas: admin ve todas").
 * Drafts stay out: they are the company's private work until it sends them
 * (Rule 9). Callers check the role first with requerirRol("admin").
 */

export const FILTROS_OFERTAS_ADMIN = ["pendiente", "publicada", "sin-postulantes", "rechazada", "cerrada", "todas"] as const
export type FiltroOfertasAdmin = (typeof FILTROS_OFERTAS_ADMIN)[number]

/** `?estado=` from the URL, defaulting to the review queue. */
export function filtroOfertasAdmin(valor: string | string[] | undefined): FiltroOfertasAdmin {
  return (FILTROS_OFERTAS_ADMIN as readonly string[]).includes(String(valor)) ? (valor as FiltroOfertasAdmin) : "pendiente"
}

const DIA = 24 * 60 * 60 * 1000

type Empresa = Pick<Tables<"empresas">, "id" | "nombre_comercial" | "logo_url">

export type FilaOfertaAdmin = Pick<
  Tables<"ofertas">,
  "id" | "titulo" | "estado" | "prioridad" | "fecha_envio" | "fecha_publicacion" | "updated_at"
> & {
  categoria: string | null
  empresa: Empresa | null
  postulaciones: { total: number; pendientes: number }
}

export type ListadoOfertasAdmin = { filas: FilaOfertaAdmin[]; conteo: Record<FiltroOfertasAdmin, number> }

const ERROR_LECTURA = "No se pudieron leer las ofertas"

// Lowercase without accents, so "gastronomia" finds "Gastronomía"
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function sinPostulantes(fila: FilaOfertaAdmin, momento: number): boolean {
  return (
    fila.estado === "publicada" &&
    fila.postulaciones.total === 0 &&
    fila.fecha_publicacion !== null &&
    momento - new Date(fila.fecha_publicacion).getTime() >= DIAS_SIN_POSTULANTES * DIA
  )
}

function enFiltro(fila: FilaOfertaAdmin, filtro: FiltroOfertasAdmin, momento: number): boolean {
  if (filtro === "todas") return true
  if (filtro === "sin-postulantes") return sinPostulantes(fila, momento)
  return fila.estado === filtro
}

const fecha = (iso: string | null) => (iso ? new Date(iso).getTime() : 0)

// Each list in the order the Office works it
const ORDEN: Record<FiltroOfertasAdmin, (a: FilaOfertaAdmin, b: FilaOfertaAdmin) => number> = {
  // Urgent first, then the one waiting longest
  pendiente: (a, b) =>
    Number(b.prioridad === "urgente") - Number(a.prioridad === "urgente") ||
    fecha(a.fecha_envio ?? a.updated_at) - fecha(b.fecha_envio ?? b.updated_at),
  // Offers with applications to review first (pre-selection, branch D)
  publicada: (a, b) => b.postulaciones.pendientes - a.postulaciones.pendientes || fecha(b.fecha_publicacion) - fecha(a.fecha_publicacion),
  "sin-postulantes": (a, b) => fecha(a.fecha_publicacion) - fecha(b.fecha_publicacion),
  rechazada: (a, b) => fecha(b.updated_at) - fecha(a.updated_at),
  cerrada: (a, b) => fecha(b.updated_at) - fecha(a.updated_at),
  todas: (a, b) => fecha(b.updated_at) - fecha(a.updated_at),
}

/**
 * Every non-draft offer with its company and application counts, filtered
 * and searched in memory (a municipal portal has hundreds of offers, not
 * millions), plus the count of each filter for the chips. `momento` from
 * `ahora()`. Admin only; throws on database errors.
 */
export async function listarOfertasAdmin(filtro: FiltroOfertasAdmin, busqueda: string, momento: number): Promise<ListadoOfertasAdmin> {
  const supabase = await createClient()
  const { data: ofertas, error } = await supabase
    .from("ofertas")
    .select("id, titulo, estado, prioridad, fecha_envio, fecha_publicacion, updated_at, categorias(nombre), empresas(id, nombre_comercial, logo_url)")
    .neq("estado", "borrador")
  if (error) throw new Error(ERROR_LECTURA)

  const ids = ofertas.filter((o) => o.estado !== "pendiente").map((o) => o.id)
  const porOferta = new Map<string, { total: number; pendientes: number }>()
  if (ids.length > 0) {
    const { data: postulaciones, error: errorPostulaciones } = await supabase.from("postulaciones").select("oferta_id, estado").in("oferta_id", ids)
    if (errorPostulaciones) throw new Error(ERROR_LECTURA)
    for (const { oferta_id, estado } of postulaciones) {
      const cuenta = porOferta.get(oferta_id) ?? { total: 0, pendientes: 0 }
      cuenta.total += 1
      if (estado === "pendiente") cuenta.pendientes += 1
      porOferta.set(oferta_id, cuenta)
    }
  }

  const todas: FilaOfertaAdmin[] = ofertas.map(({ categorias, empresas, ...oferta }) => ({
    ...oferta,
    categoria: categorias?.nombre ?? null,
    empresa: empresas,
    postulaciones: porOferta.get(oferta.id) ?? { total: 0, pendientes: 0 },
  }))

  const texto = normalizar(busqueda.trim())
  const buscadas = texto
    ? todas.filter((f) => normalizar(`${f.titulo} ${f.empresa?.nombre_comercial ?? ""} ${f.categoria ?? ""}`).includes(texto))
    : todas

  const conteo = Object.fromEntries(
    FILTROS_OFERTAS_ADMIN.map((f) => [f, buscadas.filter((fila) => enFiltro(fila, f, momento)).length]),
  ) as Record<FiltroOfertasAdmin, number>

  return { filas: buscadas.filter((f) => enFiltro(f, filtro, momento)).sort(ORDEN[filtro]), conteo }
}

export type OfertaAdmin = Tables<"ofertas"> & {
  categoria: string | null
  empresa: Pick<
    Tables<"empresas">,
    "id" | "razon_social" | "nombre_comercial" | "cuit" | "telefono" | "direccion" | "estado" | "logo_url" | "created_at"
  > | null
  /** Applications by status (only published or closed offers have any). */
  postulaciones: Record<EstadoPostulacion, number>
  /** Other offers of the same company the Office already published. */
  publicadasEmpresa: number
}

/** One offer for the review page, or null when it does not exist or is a draft. Admin only. */
export async function obtenerOfertaAdmin(id: string): Promise<OfertaAdmin | null> {
  const supabase = await createClient()
  const { data: oferta, error } = await supabase
    .from("ofertas")
    .select("*, categorias(nombre), empresas(id, razon_social, nombre_comercial, cuit, telefono, direccion, estado, logo_url, created_at)")
    .eq("id", id)
    .neq("estado", "borrador")
    .maybeSingle()
  if (error) throw new Error(ERROR_LECTURA)
  if (!oferta) return null

  const { categorias, empresas, ...resto } = oferta
  const [postulaciones, publicadas] = await Promise.all([
    supabase.from("postulaciones").select("estado").eq("oferta_id", id),
    empresas
      ? supabase.from("ofertas").select("id", { count: "exact", head: true }).eq("empresa_id", empresas.id).in("estado", ["publicada", "cerrada"]).neq("id", id)
      : Promise.resolve({ count: 0, error: null }),
  ])
  if (postulaciones.error || publicadas.error) throw new Error(ERROR_LECTURA)

  const conteo: Record<EstadoPostulacion, number> = { pendiente: 0, preseleccionado: 0, entrevista: 0, contratado: 0, rechazado: 0 }
  for (const { estado } of postulaciones.data) conteo[estado] += 1

  return { ...resto, categoria: categorias?.nombre ?? null, empresa: empresas, postulaciones: conteo, publicadasEmpresa: publicadas.count ?? 0 }
}

/**
 * Next offer waiting for review, other than `excluir`, in the queue's own
 * order (urgent first, then the oldest), so the Office can go on reviewing.
 */
export async function siguientePorRevisar(excluir: string): Promise<{ id: string; restantes: number } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ofertas")
    .select("id, prioridad, fecha_envio, updated_at")
    .eq("estado", "pendiente" satisfies EstadoOferta)
    .neq("id", excluir)
  if (error || data.length === 0) return null
  const [primera] = [...data].sort(
    (a, b) =>
      Number(b.prioridad === "urgente") - Number(a.prioridad === "urgente") ||
      fecha(a.fecha_envio ?? a.updated_at) - fecha(b.fecha_envio ?? b.updated_at),
  )
  return { id: primera.id, restantes: data.length }
}
