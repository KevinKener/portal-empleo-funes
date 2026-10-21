import type { Enums } from "@/types/database"

/**
 * Closing date of an offer (20261021150000_fecha_cierre_ofertas.sql): a
 * plain day ("YYYY-MM-DD") in Funes time, the last one that takes
 * applications. "Vencida" is derived (published and past the date), never
 * a status. Mirrors the database rules; callable from server and browser.
 */

export const CIERRE = {
  /** Days a published offer stays open when the company picks no date. */
  porDefecto: 30,
  /** Furthest date the company (and the Office, when extending) can pick, in days from today. */
  maximo: 60,
  /** From this many days left the offer shows "Cierra pronto". */
  pronto: 3,
} as const

const DIA = 24 * 60 * 60 * 1000

// en-CA formats as YYYY-MM-DD
const DIA_ARGENTINA = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
// Date-only values are formatted in UTC, otherwise "2026-11-20" would read as the 19th in Argentina
const DIA_LARGO = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" })

/** Today in Funes as "YYYY-MM-DD"; `momento` from `ahora()`. */
export function hoyArgentina(momento: number): string {
  return DIA_ARGENTINA.format(momento)
}

/** `dia` moved `dias` days ("YYYY-MM-DD"). */
export function sumarDias(dia: string, dias: number): string {
  return new Date(Date.parse(`${dia}T00:00:00Z`) + dias * DIA).toISOString().slice(0, 10)
}

/** Whole days from today to the closing date: 0 is the last day, negative once it passed. */
export function diasParaCierre(fechaCierre: string, momento: number): number {
  return Math.round((Date.parse(`${fechaCierre}T00:00:00Z`) - Date.parse(`${hoyArgentina(momento)}T00:00:00Z`)) / DIA)
}

/** "20 de noviembre" from "2026-11-20". */
export function formatearDia(dia: string): string {
  return DIA_LARGO.format(new Date(`${dia}T00:00:00Z`))
}

type ConCierre = { estado?: Enums<"estado_oferta"> | null; fecha_cierre: string | null }

/** Published but past its closing date: hidden from the portal, takes no applications. */
export function ofertaVencida(oferta: ConCierre, momento: number): boolean {
  return oferta.estado === "publicada" && oferta.fecha_cierre !== null && diasParaCierre(oferta.fecha_cierre, momento) < 0
}

/** "Cierra hoy", "Cierra mañana", "Cierra en 5 días", "Cierra el 20 de noviembre" or "Venció el …". */
export function textoCierre(fechaCierre: string, momento: number): string {
  const dias = diasParaCierre(fechaCierre, momento)
  if (dias < 0) return `Venció el ${formatearDia(fechaCierre)}`
  if (dias === 0) return "Cierra hoy"
  if (dias === 1) return "Cierra mañana"
  if (dias <= 14) return `Cierra en ${dias} días`
  return `Cierra el ${formatearDia(fechaCierre)}`
}

/**
 * The closing date a company picked in the form: empty (the 30-day default)
 * or a day from tomorrow to CIERRE.maximo days ahead. Returns the error text
 * or null.
 */
export function errorFechaCierre(dia: string, momento: number): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || Number.isNaN(Date.parse(`${dia}T00:00:00Z`))) return "Elegí una fecha válida."
  const dias = diasParaCierre(dia, momento)
  if (dias < 1) return "Elegí una fecha a partir de mañana."
  if (dias > CIERRE.maximo) return `Elegí una fecha dentro de los próximos ${CIERRE.maximo} días.`
  return null
}
