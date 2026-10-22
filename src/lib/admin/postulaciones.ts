import "server-only"
import type { ExperienciaCandidato, FormacionCandidato } from "@/lib/candidatos-empresa"
import { ENCUADRE_INICIAL, type Encuadre } from "@/lib/encuadre"
import type { EstadoOferta, EstadoPostulacion, EstadoVerificacion, MotivoRechazoPostulacion } from "@/lib/estados"
import { urlFotoPerfil } from "@/lib/foto-perfil"
import { createClient } from "@/lib/supabase/server"
import type { Enums } from "@/types/database"

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

export type PostulanteResumen = {
  id: string
  nombre: string
  apellido: string
  dni: string
  localidad: Enums<"localidad">
  estadoDomicilio: EstadoVerificacion
  tieneComprobante: boolean
  tieneCvPdf: boolean
  categorias: string[]
  experiencias: ExperienciaCandidato[]
  formaciones: FormacionCandidato[]
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

// Lowercase without accents, so "perez" finds "Pérez"
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

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

type Supabase = Awaited<ReturnType<typeof createClient>>

/** Profile, categories and CV built on the platform of each job seeker, by id. */
async function resumirPostulantes(supabase: Supabase, ids: string[]): Promise<Map<string, PostulanteResumen>> {
  const resumen = new Map<string, PostulanteResumen>()
  if (ids.length === 0) return resumen

  const [postulantes, categorias, experiencias, formaciones] = await Promise.all([
    supabase.from("postulantes").select("id, nombre, apellido, dni, localidad, estado_domicilio, comprobante_url, cv_url").in("id", ids),
    supabase.from("postulante_categorias").select("postulante_id, categorias(nombre)").in("postulante_id", ids),
    supabase.from("experiencias").select("id, postulante_id, puesto, empresa, desde, hasta, tareas").in("postulante_id", ids).order("desde", { ascending: false }),
    supabase.from("formaciones").select("id, postulante_id, nivel, titulo, institucion, estado").in("postulante_id", ids).order("created_at"),
  ])
  if (postulantes.error || categorias.error || experiencias.error || formaciones.error) throw new Error(ERROR_LECTURA)

  for (const p of postulantes.data) {
    resumen.set(p.id, {
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      dni: p.dni,
      localidad: p.localidad,
      estadoDomicilio: p.estado_domicilio,
      tieneComprobante: p.comprobante_url !== null,
      tieneCvPdf: p.cv_url !== null,
      categorias: categorias.data
        .filter((c) => c.postulante_id === p.id && c.categorias)
        .map((c) => c.categorias?.nombre ?? "")
        .sort((a, b) => a.localeCompare(b, "es")),
      experiencias: experiencias.data.filter((e) => e.postulante_id === p.id),
      formaciones: formaciones.data.filter((f) => f.postulante_id === p.id),
    })
  }
  return resumen
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

  const texto = normalizar(busqueda.trim())
  const buscadas = todas.filter(
    (f) =>
      (!soloVerificados || f.postulante.estadoDomicilio === "verificado") &&
      (!texto || normalizar(`${f.postulante.nombre} ${f.postulante.apellido} ${f.postulante.dni}`).includes(texto)),
  )

  const conteo = Object.fromEntries(
    FILTROS_POSTULACIONES.map((estado) => [estado, estado === "todas" ? buscadas.length : buscadas.filter((f) => f.estado === estado).length]),
  ) as Record<FiltroPostulaciones, number>

  return {
    filas: buscadas.filter((f) => filtro === "todas" || f.estado === filtro).sort(ordenFunesPrimero),
    conteo,
  }
}

export type OtraPostulacion = {
  id: string
  ofertaId: string
  titulo: string
  estado: EstadoPostulacion
  motivoRechazo: MotivoRechazoPostulacion | null
  creada: string
}

export type FichaPostulacion = {
  id: string
  estado: EstadoPostulacion
  motivoRechazo: MotivoRechazoPostulacion | null
  notas: string
  creada: string
  fechaPreseleccion: string | null
  actualizada: string
  oferta: { id: string; titulo: string; estado: EstadoOferta; categoria: string | null }
  postulante: PostulanteResumen & {
    telefono: string
    direccion: string
    descripcion: string | null
    foto: string | null
    encuadre: Encuadre
  }
  /** The person's applications to other offers, newest first. */
  otras: OtraPostulacion[]
}

/**
 * One application with everything the Office needs to decide: the person's
 * data, photo (Admin may see it), CV, private notes and other applications.
 * Null when it does not exist or belongs to another offer. Admin only.
 */
export async function obtenerFichaPostulacion(ofertaId: string, postulacionId: string): Promise<FichaPostulacion | null> {
  const supabase = await createClient()
  const { data: postulacion, error } = await supabase
    .from("postulaciones_admin")
    .select("id, oferta_id, postulante_id, estado, motivo_rechazo, notas_admin, created_at, fecha_preseleccion, updated_at")
    .eq("id", postulacionId)
    .eq("oferta_id", ofertaId)
    .maybeSingle()
  if (error) throw new Error(ERROR_LECTURA)
  // View columns come back nullable in the generated types; the table guarantees them
  if (!postulacion?.id || !postulacion.postulante_id || !postulacion.estado || !postulacion.created_at || !postulacion.updated_at) return null
  const postulanteId = postulacion.postulante_id

  const [oferta, datos, otras, resumen] = await Promise.all([
    supabase.from("ofertas").select("id, titulo, estado, categorias(nombre)").eq("id", ofertaId).maybeSingle(),
    supabase.from("postulantes").select("telefono, direccion, descripcion, foto_url, foto_x, foto_y, foto_zoom").eq("id", postulanteId).maybeSingle(),
    supabase
      .from("postulaciones")
      .select("id, oferta_id, estado, motivo_rechazo, created_at, ofertas(titulo)")
      .eq("postulante_id", postulanteId)
      .neq("id", postulacionId)
      .order("created_at", { ascending: false }),
    resumirPostulantes(supabase, [postulanteId]),
  ])
  if (oferta.error || datos.error || otras.error) throw new Error(ERROR_LECTURA)
  const postulante = resumen.get(postulanteId)
  if (!oferta.data || !datos.data || !postulante) return null

  const { foto_url, foto_x, foto_y, foto_zoom, ...contacto } = datos.data
  return {
    id: postulacion.id,
    estado: postulacion.estado,
    motivoRechazo: postulacion.motivo_rechazo,
    notas: postulacion.notas_admin ?? "",
    creada: postulacion.created_at,
    fechaPreseleccion: postulacion.fecha_preseleccion,
    actualizada: postulacion.updated_at,
    oferta: { id: oferta.data.id, titulo: oferta.data.titulo, estado: oferta.data.estado, categoria: oferta.data.categorias?.nombre ?? null },
    postulante: {
      ...postulante,
      ...contacto,
      foto: await urlFotoPerfil(foto_url),
      encuadre: foto_url ? { x: foto_x, y: foto_y, zoom: foto_zoom } : ENCUADRE_INICIAL,
    },
    otras: otras.data.map((p) => ({
      id: p.id,
      ofertaId: p.oferta_id,
      titulo: p.ofertas?.titulo ?? "Oferta",
      estado: p.estado,
      motivoRechazo: p.motivo_rechazo,
      creada: p.created_at,
    })),
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
