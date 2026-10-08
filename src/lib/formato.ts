import type { Enums } from "@/types/database"

/** UI labels for the jornada enum (identifiers have no accents, labels do). */
export const ETIQUETAS_JORNADA: Record<Enums<"jornada">, string> = {
  completa: "Jornada completa",
  media_jornada: "Media jornada",
  por_horas: "Por horas",
  temporal: "Temporal",
}

// Fixed time zone so server and browser render the same date.
const FORMATO_FECHA = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
})

/** "6 de octubre de 2026" from an ISO timestamp; empty string when missing. */
export function formatearFecha(iso: string | null): string {
  return iso ? FORMATO_FECHA.format(new Date(iso)) : ""
}
