import { errorFechaCierre } from "@/lib/cierre-oferta"
import { Constants, type Enums } from "@/types/database"
import type { Resultado } from "@/lib/validaciones/cv"

/**
 * Input validation for the public offers endpoints and the company's offer
 * form (AGENTS.md §3: validate every input before it reaches the database).
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Generous cap: it only guards against absurd offsets, the listing is small.
const PAGINA_MAXIMA = 1000

export type Validacion<T> = { ok: true; datos: T } | { ok: false; error: string }

/** How the public listing can be sorted (`?orden=`); the first one is the default. */
export const ORDENES_OFERTAS = ["recientes", "urgentes", "solicitadas"] as const
export type OrdenOfertas = (typeof ORDENES_OFERTAS)[number]

export type FiltrosOfertas = {
  categoria: string | null
  pagina: number
  orden: OrdenOfertas
}

/** Whether `valor` is a UUID (ids of every table). */
export function esUuid(valor: string): boolean {
  return UUID.test(valor)
}

/**
 * The offer a job seeker should go back to (`?volver=<offer id>` on profile
 * pages), as its public path, or null. Only ids are accepted, never a free
 * path, so the param cannot send anyone to another site.
 */
export function rutaDeOferta(volver: string | string[] | undefined): string | null {
  return typeof volver === "string" && esUuid(volver) ? `/ofertas/${volver}` : null
}

/**
 * Validates `?categoria=<uuid>&pagina=<n>&orden=<orden>` from the offers
 * listing. All are optional; `pagina` defaults to 1 and `orden` to
 * "recientes". Error messages reach the user.
 */
export function validarFiltrosOfertas(params: URLSearchParams): Validacion<FiltrosOfertas> {
  const categoria = params.get("categoria")
  if (categoria !== null && !esUuid(categoria)) {
    return { ok: false, error: "La categoría no es válida." }
  }

  const paginaTexto = params.get("pagina")
  let pagina = 1
  if (paginaTexto !== null) {
    pagina = /^\d{1,4}$/.test(paginaTexto) ? Number(paginaTexto) : 0
    if (pagina < 1 || pagina > PAGINA_MAXIMA) {
      return { ok: false, error: "El número de página no es válido." }
    }
  }

  const ordenTexto = params.get("orden") ?? ORDENES_OFERTAS[0]
  if (!(ORDENES_OFERTAS as readonly string[]).includes(ordenTexto)) {
    return { ok: false, error: "El orden no es válido." }
  }

  return { ok: true, datos: { categoria, pagina, orden: ordenTexto as OrdenOfertas } }
}

/** URL of the public listing with these filters, leaving defaults out so links stay short. */
export function hrefOfertas({ categoria = null, pagina = 1, orden = ORDENES_OFERTAS[0] }: Partial<FiltrosOfertas>): string {
  const params = new URLSearchParams()
  if (categoria) params.set("categoria", categoria)
  if (orden !== ORDENES_OFERTAS[0]) params.set("orden", orden)
  if (pagina > 1) params.set("pagina", String(pagina))
  const query = params.toString()
  return query ? `/ofertas?${query}` : "/ofertas"
}

export const JORNADAS = Constants.public.Enums.jornada
export const PRIORIDADES = Constants.public.Enums.prioridad_oferta

// Mirror the CHECK constraints on public.ofertas (initial migration).
export const MAXIMO_TITULO = 150
export const MAXIMO_DESCRIPCION = 5000
export const MAXIMO_REQUISITOS = 3000

export type DatosOferta = {
  titulo: string
  descripcion: string
  requisitos: string | null
  jornada: Enums<"jornada">
  categoria_id: string
  prioridad: Enums<"prioridad_oferta">
  /** Last day to apply ("YYYY-MM-DD"), or null for the default on publication. */
  fecha_cierre: string | null
}

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : ""
}

/**
 * Validates the company's offer form (fields: titulo, descripcion,
 * requisitos, jornada, categoria_id, prioridad). Shared by the browser and the Server
 * Actions; messages reach the user.
 */
export function validarOferta(formData: FormData, momento: number): Resultado<DatosOferta> {
  const errores: Record<string, string> = {}
  const titulo = texto(formData.get("titulo"))
  const descripcion = texto(formData.get("descripcion"))
  const requisitos = texto(formData.get("requisitos"))
  const jornada = texto(formData.get("jornada"))
  const categoria = texto(formData.get("categoria_id"))
  // Missing means "normal": the field is optional and older forms do not send it
  const prioridad = texto(formData.get("prioridad")) || "normal"
  // Optional: empty means the 30-day default once published
  const fechaCierre = texto(formData.get("fecha_cierre"))

  if (!titulo) errores.titulo = "Completá el puesto que buscás."
  else if (titulo.length > MAXIMO_TITULO) errores.titulo = `Usá como máximo ${MAXIMO_TITULO} caracteres.`
  if (!descripcion) errores.descripcion = "Contá de qué se trata el trabajo."
  else if (descripcion.length > MAXIMO_DESCRIPCION) errores.descripcion = `Usá como máximo ${MAXIMO_DESCRIPCION} caracteres.`
  if (requisitos.length > MAXIMO_REQUISITOS) errores.requisitos = `Usá como máximo ${MAXIMO_REQUISITOS} caracteres.`
  if (!(JORNADAS as readonly string[]).includes(jornada)) errores.jornada = "Elegí la jornada."
  if (!esUuid(categoria)) errores.categoria_id = "Elegí el rubro."
  if (!(PRIORIDADES as readonly string[]).includes(prioridad)) errores.prioridad = "Elegí qué tan rápido la necesitás cubrir."
  const errorCierre = fechaCierre ? errorFechaCierre(fechaCierre, momento) : null
  if (errorCierre) errores.fecha_cierre = errorCierre

  if (Object.keys(errores).length > 0) return { ok: false, errores }
  return {
    ok: true,
    datos: {
      titulo,
      descripcion,
      requisitos: requisitos || null,
      jornada: jornada as Enums<"jornada">,
      categoria_id: categoria,
      prioridad: prioridad as Enums<"prioridad_oferta">,
      fecha_cierre: fechaCierre || null,
    },
  }
}

/** Length of the reason the Office writes when rejecting an offer or a company (motivo_rechazo checks). */
export const MOTIVO_RECHAZO = { minimo: 10, maximo: 1000 } as const
