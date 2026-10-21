import { CIERRE, diasParaCierre } from "@/lib/cierre-oferta"
import type { Enums } from "@/types/database"

/**
 * Badges of a published offer (docs/research/admin.md §4.8): the company's
 * priority and the demand bucket computed by the ofertas_publicas view
 * (20261021130000_prioridad_ofertas.sql), plus "Nueva". The view never
 * exposes the application count, only the bucket, so neither do the badges.
 * "Cierra pronto" comes from the closing date (20261021150000_fecha_cierre_ofertas.sql).
 */

export type InsigniaOferta = "urgente" | "cierra" | "solicitada" | "pocos" | "nueva"

const DIAS_NUEVA = 3
const MILISEGUNDOS_DIA = 24 * 60 * 60 * 1000

// nivel_demanda as computed by the view
const DEMANDA_ALTA = 2
const DEMANDA_BAJA = 0

type DatosInsignias = {
  prioridad: Enums<"prioridad_oferta"> | null
  nivel_demanda: number | null
  fecha_publicacion: string | null
  fecha_cierre?: string | null
}

/**
 * The badges an offer shows, most important first, at most `maximo` (cards
 * keep two so they never wrap into a wall of pills). `ahora` is passed in so
 * components stay pure. Callable from the server and the browser.
 */
export function insigniasOferta(oferta: DatosInsignias, ahora: number, maximo = 2): InsigniaOferta[] {
  const insignias: InsigniaOferta[] = []
  if (oferta.prioridad === "urgente") insignias.push("urgente")
  // Last days to apply: worth more than demand or novelty
  if (oferta.fecha_cierre && diasParaCierre(oferta.fecha_cierre, ahora) <= CIERRE.pronto) insignias.push("cierra")
  if (oferta.nivel_demanda === DEMANDA_ALTA) insignias.push("solicitada")
  else if (oferta.nivel_demanda === DEMANDA_BAJA) insignias.push("pocos")
  if (oferta.fecha_publicacion && ahora - new Date(oferta.fecha_publicacion).getTime() < DIAS_NUEVA * MILISEGUNDOS_DIA) {
    insignias.push("nueva")
  }
  return insignias.slice(0, maximo)
}
