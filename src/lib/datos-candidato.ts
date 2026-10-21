import type { Candidato } from "@/lib/candidatos-empresa"
import { ETIQUETAS_ESTADO_FORMACION, ETIQUETAS_NIVEL_FORMACION } from "@/lib/formato"
import type { Enums } from "@/types/database"

/**
 * Key facts of a pre-selected candidate, computed from the CV built on the
 * platform, so the company can scan before reading (ATS cards lead with
 * years of experience, last job, education and fit with the offer). Never
 * a score: the Office decides who is pre-selected (docs/research/mejoras.md).
 */

export type DatosClave = {
  /** "3 años de experiencia", "8 meses de experiencia", or null without experience loaded. */
  experiencia: string | null
  ultimoPuesto: string | null
  /** Highest level reached, e.g. "Secundario completo"; courses do not count as a level. */
  formacion: string | null
  /** Whether the person chose the offer's category among theirs (Rule 5). */
  coincideRubro: boolean
}

const MESES_POR_ANIO = 12

// Courses are not a level: they count only when nothing else is loaded
const ORDEN_NIVEL: Record<Enums<"nivel_formacion">, number> = {
  universitario: 4,
  terciario: 3,
  secundario: 2,
  primario: 1,
  curso: 0,
}

function meses(desde: string, hasta: string | null, ahora: number): number {
  const inicio = new Date(desde)
  const fin = hasta ? new Date(hasta) : new Date(ahora)
  return Math.max(0, (fin.getFullYear() - inicio.getFullYear()) * MESES_POR_ANIO + fin.getMonth() - inicio.getMonth())
}

function textoExperiencia(total: number): string {
  if (total < MESES_POR_ANIO) return total <= 1 ? "Menos de 1 año de experiencia" : `${total} meses de experiencia`
  const anios = Math.floor(total / MESES_POR_ANIO)
  return anios === 1 ? "1 año de experiencia" : `${anios} años de experiencia`
}

/** The key facts of `candidato` for an offer in `rubroOferta`; `ahora` keeps components pure. */
export function datosClave(candidato: Candidato, rubroOferta: string | null, ahora: number): DatosClave {
  const { experiencias, formaciones } = candidato
  // Overlapping jobs are added up: good enough for a hint, the detail is one tap away
  const total = experiencias.reduce((suma, item) => suma + meses(item.desde, item.hasta, ahora), 0)
  const mejor = [...formaciones].sort((a, b) => ORDEN_NIVEL[b.nivel] - ORDEN_NIVEL[a.nivel])[0]

  return {
    experiencia: experiencias.length > 0 ? textoExperiencia(total) : null,
    // Experiences come newest first
    ultimoPuesto: experiencias[0]?.puesto ?? null,
    formacion: mejor ? `${ETIQUETAS_NIVEL_FORMACION[mejor.nivel]} ${ETIQUETAS_ESTADO_FORMACION[mejor.estado].toLowerCase()}` : null,
    coincideRubro: rubroOferta !== null && candidato.categorias.includes(rubroOferta),
  }
}

/** Initials for the avatar: companies never see the photo (Rule 1). */
export function iniciales(nombre: string, apellido: string): string {
  return `${nombre.trim().charAt(0)}${apellido.trim().charAt(0)}`.toUpperCase() || "?"
}
