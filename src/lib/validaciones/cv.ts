import { Constants, type Enums } from "@/types/database"

/**
 * Validation for the CV built on the platform (Rule 6). Shared by the
 * browser and the Server Actions; limits mirror the CHECK constraints in
 * 20261013140000_perfil_postulante.sql. Messages reach the user.
 */

export type Resultado<T> = { ok: true; datos: T } | { ok: false; errores: Record<string, string> }

export const NIVELES_FORMACION = Constants.public.Enums.nivel_formacion
export const ESTADOS_FORMACION = Constants.public.Enums.estado_formacion

export const MAXIMO_ITEMS_CV = 20
export const MAXIMO_SOBRE_MI = 3000

export type DatosExperiencia = {
  puesto: string
  empresa: string | null
  desde: string // YYYY-MM-01
  hasta: string | null // null = current job
  tareas: string | null
}

export type DatosFormacion = {
  nivel: Enums<"nivel_formacion">
  titulo: string
  institucion: string | null
  estado: Enums<"estado_formacion">
}

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : ""
}

/** "YYYY-MM-01" from a month (1–12) and a year, or null when invalid or in the future. */
export function fechaDeMesAnio(mes: string, anio: string): string | null {
  if (!/^\d{1,2}$/.test(mes) || !/^\d{4}$/.test(anio)) return null
  const m = Number(mes)
  const a = Number(anio)
  const hoy = new Date()
  if (m < 1 || m > 12 || a < 1950 || a > hoy.getFullYear()) return null
  if (a === hoy.getFullYear() && m > hoy.getMonth() + 1) return null
  return `${anio}-${String(m).padStart(2, "0")}-01`
}

/** Validates the experience form (fields: puesto, empresa, desde_mes, desde_anio, actual, hasta_mes, hasta_anio, tareas). */
export function validarExperiencia(formData: FormData): Resultado<DatosExperiencia> {
  const errores: Record<string, string> = {}
  const puesto = texto(formData.get("puesto"))
  const empresa = texto(formData.get("empresa"))
  const tareas = texto(formData.get("tareas"))
  const actual = formData.get("actual") === "si"

  if (!puesto) errores.puesto = "Completá el puesto o la tarea que hacías."
  else if (puesto.length > 150) errores.puesto = "Usá como máximo 150 caracteres."
  if (empresa.length > 150) errores.empresa = "Usá como máximo 150 caracteres."
  if (tareas.length > 1000) errores.tareas = "Usá como máximo 1000 caracteres."

  const desde = fechaDeMesAnio(texto(formData.get("desde_mes")), texto(formData.get("desde_anio")))
  if (!desde) errores.desde = "Elegí el mes y el año en que empezaste."
  const hasta = actual ? null : fechaDeMesAnio(texto(formData.get("hasta_mes")), texto(formData.get("hasta_anio")))
  if (!actual && !hasta) errores.hasta = "Elegí el mes y el año en que terminaste, o marcá que trabajás ahí."
  if (desde && hasta && hasta < desde) errores.hasta = "La fecha de fin tiene que ser posterior al inicio."

  if (Object.keys(errores).length > 0) return { ok: false, errores }
  return { ok: true, datos: { puesto, empresa: empresa || null, desde: desde!, hasta, tareas: tareas || null } }
}

/** Validates the education form (fields: nivel, titulo, institucion, estado). */
export function validarFormacion(formData: FormData): Resultado<DatosFormacion> {
  const errores: Record<string, string> = {}
  const nivel = texto(formData.get("nivel"))
  const titulo = texto(formData.get("titulo"))
  const institucion = texto(formData.get("institucion"))
  const estado = texto(formData.get("estado"))

  if (!(NIVELES_FORMACION as readonly string[]).includes(nivel)) errores.nivel = "Elegí el nivel."
  if (!titulo) errores.titulo = "Completá el título o el nombre del curso."
  else if (titulo.length > 150) errores.titulo = "Usá como máximo 150 caracteres."
  if (institucion.length > 150) errores.institucion = "Usá como máximo 150 caracteres."
  if (!(ESTADOS_FORMACION as readonly string[]).includes(estado)) errores.estado = "Elegí si lo terminaste."

  if (Object.keys(errores).length > 0) return { ok: false, errores }
  return {
    ok: true,
    datos: {
      nivel: nivel as Enums<"nivel_formacion">,
      titulo,
      institucion: institucion || null,
      estado: estado as Enums<"estado_formacion">,
    },
  }
}
