import "server-only"
import type { ExperienciaCandidato, FormacionCandidato } from "@/lib/candidatos-empresa"
import { ENCUADRE_INICIAL, type Encuadre } from "@/lib/encuadre"
import type { EstadoPostulacion, EstadoVerificacion, MotivoRechazoPostulacion } from "@/lib/estados"
import { urlsFotosPerfil } from "@/lib/foto-perfil"
import { createClient } from "@/lib/supabase/server"
import { Constants, type Enums } from "@/types/database"

/**
 * Job seekers as the Employment Office sees them (branch D2,
 * docs/research/admin.md §5): the search in /admin/postulantes and the
 * person's profile, shared with the application page of branch D1. Read with
 * the Admin's own session ("postulantes: admin ve todos"), never the secret
 * key. Callers check the role first with requerirRol("admin").
 */

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
  /** Signed URL (the Admin may see it, companies never), or null for initials. */
  foto: string | null
  encuadre: Encuadre
}

const ERROR_LECTURA = "No se pudieron leer los postulantes"

/** Lowercase without accents, so "perez" finds "Pérez". */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

/**
 * Whether a person matches the Office's search: a DNI typed with or without
 * dots ("38.150.362", "38150362" or a part of it), or every word of a name in
 * any order and without accents ("kener kevin" finds "Kevin Kener").
 */
export function coincideBusqueda(busqueda: string, persona: { nombre: string; apellido: string; dni: string }): boolean {
  const texto = normalizar(busqueda.trim())
  if (!texto) return true
  const digitos = texto.replace(/[.\s-]/g, "")
  if (/^\d+$/.test(digitos)) return persona.dni.includes(digitos)
  const nombre = normalizar(`${persona.nombre} ${persona.apellido}`)
  return texto.split(/\s+/).every((palabra) => nombre.includes(palabra))
}

type Supabase = Awaited<ReturnType<typeof createClient>>

/**
 * Profile, photo, categories and CV built on the platform of each job seeker,
 * by id. Photos are signed in a single request. Throws on database errors.
 */
export async function resumirPostulantes(supabase: Supabase, ids: string[]): Promise<Map<string, PostulanteResumen>> {
  const resumen = new Map<string, PostulanteResumen>()
  if (ids.length === 0) return resumen

  const [postulantes, categorias, experiencias, formaciones] = await Promise.all([
    supabase
      .from("postulantes")
      .select("id, nombre, apellido, dni, localidad, estado_domicilio, comprobante_url, cv_url, foto_url, foto_x, foto_y, foto_zoom")
      .in("id", ids),
    supabase.from("postulante_categorias").select("postulante_id, categorias(nombre)").in("postulante_id", ids),
    supabase.from("experiencias").select("id, postulante_id, puesto, empresa, desde, hasta, tareas").in("postulante_id", ids).order("desde", { ascending: false }),
    supabase.from("formaciones").select("id, postulante_id, nivel, titulo, institucion, estado").in("postulante_id", ids).order("created_at"),
  ])
  if (postulantes.error || categorias.error || experiencias.error || formaciones.error) throw new Error(ERROR_LECTURA)

  const fotos = await urlsFotosPerfil(postulantes.data.flatMap((p) => (p.foto_url ? [p.foto_url] : [])))
  for (const p of postulantes.data) {
    const foto = p.foto_url ? (fotos.get(p.foto_url) ?? null) : null
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
      foto,
      encuadre: foto ? { x: p.foto_x, y: p.foto_y, zoom: p.foto_zoom } : ENCUADRE_INICIAL,
    })
  }
  return resumen
}

export const FILTROS_LOCALIDAD = ["todas", ...Constants.public.Enums.localidad] as const
export type FiltroLocalidad = (typeof FILTROS_LOCALIDAD)[number]

/** `?localidad=` from the URL, defaulting to every town. */
export function filtroLocalidad(valor: string | string[] | undefined): FiltroLocalidad {
  return (FILTROS_LOCALIDAD as readonly string[]).includes(String(valor)) ? (valor as FiltroLocalidad) : "todas"
}

export const POSTULANTES_POR_PAGINA = 30

export const ORDENES_POSTULANTES = ["funes", "nombre", "recientes", "postulaciones"] as const
export type OrdenPostulantes = (typeof ORDENES_POSTULANTES)[number]

/** `?orden=` from the URL, defaulting to Funes first (Rule 4). */
export function ordenPostulantes(valor: string | string[] | undefined): OrdenPostulantes {
  return (ORDENES_POSTULANTES as readonly string[]).includes(String(valor)) ? (valor as OrdenPostulantes) : "funes"
}

export type FiltrosPostulantes = {
  localidad: FiltroLocalidad
  busqueda: string
  /** Category id, or null for every category. */
  rubro: string | null
  soloVerificados: boolean
  orden: OrdenPostulantes
  pagina: number
}

export type FilaPostulanteAdmin = PostulanteResumen & {
  /** When the account was created. */
  creado: string
  postulaciones: { total: number; enCurso: number }
}

export type ListadoPostulantes = {
  filas: FilaPostulanteAdmin[]
  conteo: Record<FiltroLocalidad, number>
  total: number
  totalPaginas: number
  /** The page actually shown (clamped to the last one). */
  pagina: number
}

type Liviano = { nombre: string; apellido: string; localidad: Enums<"localidad">; created_at: string; total: number }
const reciente = (a: Liviano, b: Liviano) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
const porNombre = (a: Liviano, b: Liviano) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")

// Each order the Office can pick by clicking a column header
const ORDEN: Record<OrdenPostulantes, (a: Liviano, b: Liviano) => number> = {
  // Rule 4: Funes residents first, then the newest accounts
  funes: (a, b) => Number(b.localidad === "funes") - Number(a.localidad === "funes") || reciente(a, b),
  nombre: porNombre,
  recientes: reciente,
  postulaciones: (a, b) => b.total - a.total || porNombre(a, b),
}

// Applications still moving: the Office may want to know before calling
const EN_CURSO: readonly EstadoPostulacion[] = ["pendiente", "preseleccionado", "entrevista"]

/**
 * Every registered job seeker, with or without applications, searched by name
 * or DNI and filtered by town, category and verified address in memory (a
 * municipal portal has thousands of people, not millions), in the chosen
 * order (Funes first by default, Rule 4). Only the page shown loads the CV
 * and photos.
 * Admin only; throws on database errors.
 */
export async function listarPostulantesAdmin(filtros: FiltrosPostulantes): Promise<ListadoPostulantes> {
  const supabase = await createClient()
  // TODO(phase-7): PostgREST returns at most 1000 rows by default; past that many
  // accounts, move the search into a database function
  const [postulantes, categorias, postulaciones] = await Promise.all([
    supabase.from("postulantes").select("id, nombre, apellido, dni, localidad, estado_domicilio, created_at"),
    filtros.rubro ? supabase.from("postulante_categorias").select("postulante_id").eq("categoria_id", filtros.rubro) : Promise.resolve({ data: null, error: null }),
    // Every application's owner and status: totals to sort by, and what is still moving
    supabase.from("postulaciones").select("postulante_id, estado"),
  ])
  if (postulantes.error || categorias.error || postulaciones.error) {
    console.error("listarPostulantesAdmin failed:", postulantes.error?.code ?? categorias.error?.code ?? postulaciones.error?.code)
    throw new Error(ERROR_LECTURA)
  }

  const cuentas = new Map<string, { total: number; enCurso: number }>()
  for (const { postulante_id, estado } of postulaciones.data) {
    const cuenta = cuentas.get(postulante_id) ?? { total: 0, enCurso: 0 }
    cuenta.total += 1
    if (EN_CURSO.includes(estado)) cuenta.enCurso += 1
    cuentas.set(postulante_id, cuenta)
  }

  const conRubro = categorias.data ? new Set(categorias.data.map((c) => c.postulante_id)) : null
  const buscados = postulantes.data
    .filter(
      (p) =>
        (!conRubro || conRubro.has(p.id)) &&
        (!filtros.soloVerificados || p.estado_domicilio === "verificado") &&
        coincideBusqueda(filtros.busqueda, p),
    )
    .map((p) => ({ ...p, total: cuentas.get(p.id)?.total ?? 0 }))
    .sort(ORDEN[filtros.orden])

  const conteo = Object.fromEntries(
    FILTROS_LOCALIDAD.map((l) => [l, l === "todas" ? buscados.length : buscados.filter((p) => p.localidad === l).length]),
  ) as Record<FiltroLocalidad, number>

  const enLocalidad = filtros.localidad === "todas" ? buscados : buscados.filter((p) => p.localidad === filtros.localidad)
  const totalPaginas = Math.max(1, Math.ceil(enLocalidad.length / POSTULANTES_POR_PAGINA))
  const pagina = Math.min(Math.max(1, filtros.pagina), totalPaginas)
  const visibles = enLocalidad.slice((pagina - 1) * POSTULANTES_POR_PAGINA, pagina * POSTULANTES_POR_PAGINA)

  const ids = visibles.map((p) => p.id)
  const resumen = await resumirPostulantes(supabase, ids)
  const filas = visibles.flatMap((p) => {
    const datos = resumen.get(p.id)
    if (!datos) return []
    return [
      {
        ...datos,
        creado: p.created_at,
        postulaciones: cuentas.get(p.id) ?? { total: 0, enCurso: 0 },
      },
    ]
  })

  return { filas, conteo, total: enLocalidad.length, totalPaginas, pagina }
}

export type PostulacionDePostulante = {
  id: string
  ofertaId: string
  titulo: string
  estado: EstadoPostulacion
  motivoRechazo: MotivoRechazoPostulacion | null
  creada: string
}

export type PerfilPostulanteAdmin = PostulanteResumen & {
  telefono: string
  direccion: string
  descripcion: string | null
  creado: string
  /** Every application, newest first. */
  postulaciones: PostulacionDePostulante[]
}

/**
 * One job seeker with everything the Office looks at: contact data, photo,
 * CV and every application. Null when the id does not exist. Admin only;
 * throws on database errors.
 */
export async function obtenerPerfilPostulante(id: string): Promise<PerfilPostulanteAdmin | null> {
  const supabase = await createClient()
  const [datos, postulaciones, resumen] = await Promise.all([
    supabase.from("postulantes").select("telefono, direccion, descripcion, created_at").eq("id", id).maybeSingle(),
    supabase
      .from("postulaciones")
      .select("id, oferta_id, estado, motivo_rechazo, created_at, ofertas(titulo)")
      .eq("postulante_id", id)
      .order("created_at", { ascending: false }),
    resumirPostulantes(supabase, [id]),
  ])
  if (datos.error || postulaciones.error) throw new Error(ERROR_LECTURA)
  const postulante = resumen.get(id)
  if (!datos.data || !postulante) return null

  const { created_at, ...contacto } = datos.data
  return {
    ...postulante,
    ...contacto,
    creado: created_at,
    postulaciones: postulaciones.data.map((p) => ({
      id: p.id,
      ofertaId: p.oferta_id,
      titulo: p.ofertas?.titulo ?? "Oferta",
      estado: p.estado,
      motivoRechazo: p.motivo_rechazo,
      creada: p.created_at,
    })),
  }
}
