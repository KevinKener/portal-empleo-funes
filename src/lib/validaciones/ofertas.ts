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

export type FiltrosOfertas = {
  categoria: string | null
  pagina: number
}

/** Whether `valor` is a UUID (ids of every table). */
export function esUuid(valor: string): boolean {
  return UUID.test(valor)
}

/**
 * Validates `?categoria=<uuid>&pagina=<n>` from the offers listing.
 * Both are optional; `pagina` defaults to 1. Error messages reach the user.
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

  return { ok: true, datos: { categoria, pagina } }
}

export const JORNADAS = Constants.public.Enums.jornada

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
}

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : ""
}

/**
 * Validates the company's offer form (fields: titulo, descripcion,
 * requisitos, jornada, categoria_id). Shared by the browser and the Server
 * Actions; messages reach the user.
 */
export function validarOferta(formData: FormData): Resultado<DatosOferta> {
  const errores: Record<string, string> = {}
  const titulo = texto(formData.get("titulo"))
  const descripcion = texto(formData.get("descripcion"))
  const requisitos = texto(formData.get("requisitos"))
  const jornada = texto(formData.get("jornada"))
  const categoria = texto(formData.get("categoria_id"))

  if (!titulo) errores.titulo = "Completá el puesto que buscás."
  else if (titulo.length > MAXIMO_TITULO) errores.titulo = `Usá como máximo ${MAXIMO_TITULO} caracteres.`
  if (!descripcion) errores.descripcion = "Contá de qué se trata el trabajo."
  else if (descripcion.length > MAXIMO_DESCRIPCION) errores.descripcion = `Usá como máximo ${MAXIMO_DESCRIPCION} caracteres.`
  if (requisitos.length > MAXIMO_REQUISITOS) errores.requisitos = `Usá como máximo ${MAXIMO_REQUISITOS} caracteres.`
  if (!(JORNADAS as readonly string[]).includes(jornada)) errores.jornada = "Elegí la jornada."
  if (!esUuid(categoria)) errores.categoria_id = "Elegí el rubro."

  if (Object.keys(errores).length > 0) return { ok: false, errores }
  return {
    ok: true,
    datos: {
      titulo,
      descripcion,
      requisitos: requisitos || null,
      jornada: jornada as Enums<"jornada">,
      categoria_id: categoria,
    },
  }
}
