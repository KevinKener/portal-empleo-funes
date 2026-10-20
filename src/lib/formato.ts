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

/**
 * How the company reads each offer status, with what happens next.
 * "pendiente" reads "En revisión": the Employment Office is looking at it (Rule 2).
 */
export const ESTADO_OFERTA_PARA_EMPRESA: Record<Enums<"estado_oferta">, { titulo: string; detalle: string }> = {
  borrador: { titulo: "Borrador", detalle: "Solo la ves vos. Cuando esté lista, enviala a revisión." },
  pendiente: { titulo: "En revisión", detalle: "La Oficina de Empleo la está revisando antes de publicarla." },
  publicada: { titulo: "Publicada", detalle: "Se ve en el portal y recibe postulaciones." },
  rechazada: { titulo: "Rechazada", detalle: "La Oficina de Empleo no la aprobó. Podés usarla como base para una nueva." },
  cerrada: { titulo: "Cerrada", detalle: "Ya no se ve en el portal ni recibe postulaciones." },
}

/**
 * Company's selection stages (Rule 11): the label of each group and what
 * "tomar" means in it. Rejected and hired candidates are read-only.
 */
export const ETAPAS_SELECCION = [
  { estado: "preseleccionado", titulo: "Preseleccionados por la Oficina", tomar: "Entrevistar" },
  { estado: "entrevista", titulo: "En entrevista", tomar: "Contratar" },
  { estado: "contratado", titulo: "Contratados", tomar: null },
  { estado: "rechazado", titulo: "No seleccionados", tomar: null },
] as const satisfies readonly { estado: Enums<"estado_postulacion">; titulo: string; tomar: string | null }[]

/** UI labels for the localidad enum. */
export const ETIQUETAS_LOCALIDAD: Record<Enums<"localidad">, string> = {
  funes: "Funes",
  roldan: "Roldán",
  rosario: "Rosario",
  otra: "Otra localidad",
}

/** UI labels for the education level enum. */
export const ETIQUETAS_NIVEL_FORMACION: Record<Enums<"nivel_formacion">, string> = {
  primario: "Primario",
  secundario: "Secundario",
  terciario: "Terciario",
  universitario: "Universitario",
  curso: "Curso o capacitación",
}

/** UI labels for the education status enum. */
export const ETIQUETAS_ESTADO_FORMACION: Record<Enums<"estado_formacion">, string> = {
  completo: "Completo",
  en_curso: "En curso",
  incompleto: "Incompleto",
}

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const

/** "marzo 2024" from a "YYYY-MM-DD" date column (no time zone involved). */
export function formatearMesAnio(fecha: string): string {
  const [anio, mes] = fecha.split("-")
  return `${MESES[Number(mes) - 1]} ${anio}`
}

/**
 * How the job seeker reads each application status (plain words, Spanish).
 * Rejections are told apart by motivo_rechazo: a full quota reads softer (Rule 10).
 */
export const ESTADO_POSTULACION_PARA_POSTULANTE: Record<
  Enums<"estado_postulacion"> | "cupo_completo" | "no_seleccionado",
  { titulo: string; detalle: string }
> = {
  pendiente: { titulo: "Enviada", detalle: "La Oficina de Empleo está revisando tu perfil." },
  preseleccionado: { titulo: "Preseleccionada", detalle: "La Oficina envió tu perfil a la empresa." },
  entrevista: { titulo: "Entrevista", detalle: "La empresa quiere conocerte. Te van a contactar." },
  contratado: { titulo: "¡Contratado/a!", detalle: "¡Felicitaciones! La Oficina va a hacer un seguimiento." },
  rechazado: { titulo: "No seleccionada", detalle: "Esta vez no avanzaste. Seguí postulándote." },
  cupo_completo: {
    titulo: "Cupo completo",
    detalle: "Se completaron los puestos de esta oferta. Tu perfil sigue activo para otras.",
  },
  no_seleccionado: { titulo: "No seleccionada", detalle: "Esta vez no avanzaste. Seguí postulándote." },
}

/** Plain-words status of an application, using the rejection reason when there is one. */
export function textoEstadoPostulacion(
  estado: Enums<"estado_postulacion">,
  motivo: Enums<"motivo_rechazo_postulacion"> | null,
): { titulo: string; detalle: string } {
  return ESTADO_POSTULACION_PARA_POSTULANTE[estado === "rechazado" && motivo ? motivo : estado]
}
