import "server-only"
import {
  coincideBusqueda,
  obtenerPerfilPostulante,
  resumirPostulantes,
  type PerfilPostulanteAdmin,
  type PostulacionDePostulante,
  type PostulanteResumen,
} from "@/lib/admin/postulantes"
import type { EstadoOferta, EstadoPostulacion, MotivoRechazoPostulacion } from "@/lib/estados"
import { createClient } from "@/lib/supabase/server"

/**
 * Applications as the Employment Office sees them (branch D,
 * docs/research/admin.md §5). Read with the Admin's own session: the
 * postulaciones_admin view and "admin ve todos" policies, never the secret
 * key. Callers check the role first with requerirRol("admin").
 */

export const FILTROS_POSTULACIONES = ["pendiente", "preseleccionado", "entrevista", "contratado", "rechazado", "todas"] as const
export type FiltroPostulaciones = (typeof FILTROS_POSTULACIONES)[number]

/** `?estado=` from the URL, defaulting to the applications the Office still has to review. */
export function filtroPostulaciones(valor: string | string[] | undefined): FiltroPostulaciones {
  return (FILTROS_POSTULACIONES as readonly string[]).includes(String(valor)) ? (valor as FiltroPostulaciones) : "pendiente"
}

export type FilaPostulacion = {
  id: string
  estado: EstadoPostulacion
  motivoRechazo: MotivoRechazoPostulacion | null
  /** When the person applied. */
  creada: string
  postulante: PostulanteResumen
}

export type ListadoPostulaciones = {
  filas: FilaPostulacion[]
  conteo: Record<FiltroPostulaciones, number>
}

const ERROR_LECTURA = "No se pudieron leer las postulaciones"

/**
 * Rule 4 (decision 2026-10-13): Funes residents first, then other towns,
 * each group oldest application first, so nobody waits at the bottom.
 */
export function ordenFunesPrimero(a: FilaPostulacion, b: FilaPostulacion): number {
  return (
    Number(b.postulante.localidad === "funes") - Number(a.postulante.localidad === "funes") ||
    new Date(a.creada).getTime() - new Date(b.creada).getTime()
  )
}

/**
 * Every application of an offer with its job seeker, searched by name or DNI
 * and optionally only verified addresses, in the Funes-first order (Rule 4),
 * plus the count of each status for the chips. Admin only; throws on
 * database errors.
 */
export async function listarPostulacionesOferta(
  ofertaId: string,
  filtro: FiltroPostulaciones,
  { busqueda, soloVerificados }: { busqueda: string; soloVerificados: boolean },
): Promise<ListadoPostulaciones> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("postulaciones")
    .select("id, postulante_id, estado, motivo_rechazo, created_at")
    .eq("oferta_id", ofertaId)
  if (error) throw new Error(ERROR_LECTURA)

  const postulantes = await resumirPostulantes(supabase, [...new Set(data.map((p) => p.postulante_id))])
  const todas: FilaPostulacion[] = data.flatMap((p) => {
    const postulante = postulantes.get(p.postulante_id)
    if (!postulante) return []
    return [{ id: p.id, estado: p.estado, motivoRechazo: p.motivo_rechazo, creada: p.created_at, postulante }]
  })

  const buscadas = todas.filter(
    (f) =>
      (!soloVerificados || f.postulante.estadoDomicilio === "verificado") &&
      coincideBusqueda(busqueda, f.postulante),
  )

  const conteo = Object.fromEntries(
    FILTROS_POSTULACIONES.map((estado) => [estado, estado === "todas" ? buscadas.length : buscadas.filter((f) => f.estado === estado).length]),
  ) as Record<FiltroPostulaciones, number>

  return {
    filas: buscadas.filter((f) => filtro === "todas" || f.estado === filtro).sort(ordenFunesPrimero),
    conteo,
  }
}

export type FichaPostulacion = {
  id: string
  estado: EstadoPostulacion
  motivoRechazo: MotivoRechazoPostulacion | null
  notas: string
  creada: string
  fechaPreseleccion: string | null
  oferta: { id: string; titulo: string; estado: EstadoOferta; categoria: string | null }
  postulante: PerfilPostulanteAdmin
  /** The person's applications to other offers, newest first. */
  otras: PostulacionDePostulante[]
}

/**
 * One application with everything the Office needs to decide: the person's
 * profile (obtenerPerfilPostulante), private notes and other applications.
 * Null when it does not exist or belongs to another offer. Admin only.
 */
export async function obtenerFichaPostulacion(ofertaId: string, postulacionId: string): Promise<FichaPostulacion | null> {
  const supabase = await createClient()
  const { data: postulacion, error } = await supabase
    .from("postulaciones_admin")
    .select("id, oferta_id, postulante_id, estado, motivo_rechazo, notas_admin, created_at, fecha_preseleccion")
    .eq("id", postulacionId)
    .eq("oferta_id", ofertaId)
    .maybeSingle()
  if (error) throw new Error(ERROR_LECTURA)
  // View columns come back nullable in the generated types; the table guarantees them
  if (!postulacion?.id || !postulacion.postulante_id || !postulacion.estado || !postulacion.created_at) return null

  const [oferta, postulante] = await Promise.all([
    supabase.from("ofertas").select("id, titulo, estado, categorias(nombre)").eq("id", ofertaId).maybeSingle(),
    obtenerPerfilPostulante(postulacion.postulante_id),
  ])
  if (oferta.error) throw new Error(ERROR_LECTURA)
  if (!oferta.data || !postulante) return null

  return {
    id: postulacion.id,
    estado: postulacion.estado,
    motivoRechazo: postulacion.motivo_rechazo,
    notas: postulacion.notas_admin ?? "",
    creada: postulacion.created_at,
    fechaPreseleccion: postulacion.fecha_preseleccion,
    oferta: { id: oferta.data.id, titulo: oferta.data.titulo, estado: oferta.data.estado, categoria: oferta.data.categorias?.nombre ?? null },
    postulante,
    otras: postulante.postulaciones.filter((p) => p.id !== postulacion.id),
  }
}

/**
 * Next application still to review in the offer, other than `excluir`, in
 * the Funes-first order, so the Office can go on from the candidate page.
 */
export async function siguientePorPreseleccionar(ofertaId: string, excluir: string): Promise<{ id: string; restantes: number } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("postulaciones")
    .select("id, created_at, postulantes(localidad)")
    .eq("oferta_id", ofertaId)
    .eq("estado", "pendiente" satisfies EstadoPostulacion)
    .neq("id", excluir)
  if (error || data.length === 0) return null
  const [primera] = [...data].sort(
    (a, b) =>
      Number(b.postulantes?.localidad === "funes") - Number(a.postulantes?.localidad === "funes") ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
  return { id: primera.id, restantes: data.length }
}
