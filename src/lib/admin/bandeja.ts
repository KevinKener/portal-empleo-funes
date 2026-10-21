import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

/**
 * The Employment Office's work queues (docs/research/admin.md §4.3, branch A).
 * Read with the signed-in Admin's own session: RLS (`es_admin()`) is what lets
 * these queries see every row, never the secret key (AGENTS.md §3).
 */

export type TipoCola = "ofertas" | "empresas" | "postulaciones" | "domicilios" | "sin-postulantes"

export type Cola = {
  tipo: TipoCola
  cantidad: number
  /** When the oldest item started waiting (ISO), null when the queue is empty. */
  desde: string | null
  /** Extra figure for the card, e.g. how many urgent offers or in how many offers. */
  detalle: number
}

/** A queue item is "overdue" after this many days (shown with the `aviso` token). */
export const DIAS_DEMORA = 3
// Published this long without a single application: the Office may want to call the company.
export const DIAS_SIN_POSTULANTES = 7
const DIA = 24 * 60 * 60 * 1000

const ERROR_BANDEJA = "No se pudo leer la bandeja de la Oficina de Empleo"

// Rows of a query or a generic error (details stay on the server, AGENTS.md §3)
function filas<T>({ data, error }: { data: T[] | null; error: unknown }): T[] {
  if (error || !data) throw new Error(ERROR_BANDEJA)
  return data
}

function masVieja(fechas: (string | null)[]): string | null {
  const validas = fechas.filter((f): f is string => Boolean(f)).sort()
  return validas[0] ?? null
}

/**
 * Every queue of the Bandeja, in a fixed order (the page sorts by urgency).
 * Admin only: other roles get empty results from RLS. Cached per request, so
 * the area layout (tab badges) and the page share one round of queries.
 */
export const obtenerColas = cache(async (): Promise<Cola[]> => {
  const supabase = await createClient()
  const limite = new Date(Date.now() - DIAS_SIN_POSTULANTES * DIA).toISOString()

  const [empresas, ofertas, postulaciones, domicilios, publicadas] = (await Promise.all([
    // Rule 3: companies waiting for verification
    supabase.from("empresas").select("created_at").eq("estado", "pendiente"),
    // Rule 2: offers sent for review; fecha_envio is stamped by the trigger
    supabase.from("ofertas").select("fecha_envio, updated_at, prioridad").eq("estado", "pendiente"),
    // Rule 1: applications the Office has not pre-selected or rejected yet
    supabase.from("postulaciones").select("oferta_id, created_at").eq("estado", "pendiente"),
    // Rule 4: only Funes residents upload a proof; a new one goes back to pendiente
    supabase
      .from("postulantes")
      .select("updated_at")
      .eq("localidad", "funes")
      .eq("estado_domicilio", "pendiente")
      .not("comprobante_url", "is", null),
    supabase.from("ofertas").select("id, fecha_publicacion").eq("estado", "publicada").lte("fecha_publicacion", limite),
  ]).then(([e, o, p, d, pub]) => [filas(e), filas(o), filas(p), filas(d), filas(pub)] as const))

  // Published offers without applications: one extra lookup over just those offers
  const idsPublicadas = publicadas.map((o) => o.id)
  let conPostulantes = new Set<string>()
  if (idsPublicadas.length > 0) {
    const conteo = filas(await supabase.from("postulaciones").select("oferta_id").in("oferta_id", idsPublicadas))
    conPostulantes = new Set(conteo.map((p) => p.oferta_id))
  }
  const sinPostulantes = publicadas.filter((o) => !conPostulantes.has(o.id))

  return [
    {
      tipo: "ofertas",
      cantidad: ofertas.length,
      // Offers sent before the column existed were backfilled; updated_at is only a fallback
      desde: masVieja(ofertas.map((o) => o.fecha_envio ?? o.updated_at)),
      detalle: ofertas.filter((o) => o.prioridad === "urgente").length,
    },
    {
      tipo: "empresas",
      cantidad: empresas.length,
      desde: masVieja(empresas.map((e) => e.created_at)),
      detalle: 0,
    },
    {
      tipo: "postulaciones",
      cantidad: postulaciones.length,
      desde: masVieja(postulaciones.map((p) => p.created_at)),
      detalle: new Set(postulaciones.map((p) => p.oferta_id)).size,
    },
    {
      tipo: "domicilios",
      cantidad: domicilios.length,
      // There is no upload date: updated_at moves when the proof (or the address) changes
      desde: masVieja(domicilios.map((p) => p.updated_at)),
      detalle: 0,
    },
    {
      tipo: "sin-postulantes",
      cantidad: sinPostulantes.length,
      desde: masVieja(sinPostulantes.map((o) => o.fecha_publicacion)),
      detalle: 0,
    },
  ]
})

/** Whole days an item has been waiting, from `desde` to `momento` (see `ahora()`). */
export function diasEsperando(desde: string, momento: number): number {
  return Math.max(0, Math.floor((momento - new Date(desde).getTime()) / DIA))
}

/** Pending counts for the area tabs: what each section has waiting. */
export type PendientesAdmin = { empresas: number; ofertas: number; postulantes: number }

/**
 * Tab badges: Empresas = companies to verify; Ofertas = offers to review plus
 * applications to review (pre-selection happens inside each offer, branch D);
 * Postulantes = proofs of address to verify.
 */
export function pendientesPorSeccion(colas: Cola[]): PendientesAdmin {
  const de = (tipo: TipoCola) => colas.find((c) => c.tipo === tipo)?.cantidad ?? 0
  return {
    empresas: de("empresas"),
    ofertas: de("ofertas") + de("postulaciones"),
    postulantes: de("domicilios"),
  }
}
