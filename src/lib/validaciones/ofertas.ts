/**
 * Input validation for the public offers endpoints (AGENTS.md §3: validate
 * every input before it reaches the database).
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
