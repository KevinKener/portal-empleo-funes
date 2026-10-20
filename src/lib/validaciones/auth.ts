import type { Enums } from "@/types/database"

/**
 * Validation for the sign-up and code forms. Pure functions shared by the
 * browser (inline feedback on blur) and the Server Actions (the authority,
 * AGENTS.md §3). Limits mirror the CHECK constraints in the initial migration.
 * Messages reach the user, so they say how to fix the value.
 */

export type CampoPostulante =
  | "dni"
  | "nombre"
  | "apellido"
  | "localidad"
  | "direccion"
  | "telefono"
  | "email"
  | "contrasena"

export type CampoEmpresa =
  | "razon_social"
  | "cuit"
  | "nombre_comercial"
  | "telefono"
  | "direccion"
  | "email"
  | "contrasena"

export type CampoRegistro = CampoPostulante | CampoEmpresa

export type Errores<K extends string> = Partial<Record<K, string>>

/** What a form's Server Action returns: field errors, a general error and an optional confirmation. */
export type EstadoFormulario<K extends string> = {
  errores: Errores<K>
  mensaje: string | null
  aviso?: string | null
}

export const CAMPOS_POSTULANTE = [
  "dni",
  "nombre",
  "apellido",
  "localidad",
  "direccion",
  "telefono",
  "email",
  "contrasena",
] as const satisfies readonly CampoPostulante[]

export const CAMPOS_EMPRESA = [
  "razon_social",
  "cuit",
  "nombre_comercial",
  "telefono",
  "direccion",
  "email",
  "contrasena",
] as const satisfies readonly CampoEmpresa[]

/** Personal data the job seeker can edit after signing up (DNI and email are fixed). */
export type CampoDatos = Extract<CampoPostulante, "nombre" | "apellido" | "localidad" | "direccion" | "telefono">

export const CAMPOS_DATOS = [
  "nombre",
  "apellido",
  "localidad",
  "direccion",
  "telefono",
] as const satisfies readonly CampoDatos[]

/** Company data editable after signing up (CUIT and email are fixed; razon_social only while pending). */
export type CampoDatosEmpresa = Extract<CampoEmpresa, "razon_social" | "nombre_comercial" | "telefono" | "direccion">

export const CAMPOS_DATOS_EMPRESA = [
  "razon_social",
  "nombre_comercial",
  "telefono",
  "direccion",
] as const satisfies readonly CampoDatosEmpresa[]

export const LOCALIDADES = ["funes", "roldan", "rosario", "otra"] as const satisfies readonly Enums<"localidad">[]

// Supabase is configured with the same minimum; 72 is the bcrypt limit it enforces.
export const CONTRASENA_MINIMA = 8
const CONTRASENA_MAXIMA = 72

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Keeps only digits: people type DNI "30.123.456" and CUIT "30-12345678-9". */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "")
}

function texto(valor: string, nombre: string, maximo: number): string | null {
  const limpio = valor.trim()
  if (!limpio) return `Completá ${nombre}.`
  if (limpio.length > maximo) return `Usá como máximo ${maximo} caracteres.`
  return null
}

/** CUIT/CUIL check digit (AFIP/ARCA modulo 11 algorithm). */
export function cuitValido(cuit: string): boolean {
  if (!/^\d{11}$/.test(cuit)) return false
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = pesos.reduce((total, peso, i) => total + peso * Number(cuit[i]), 0)
  const resto = 11 - (suma % 11)
  const verificador = resto === 11 ? 0 : resto === 10 ? 9 : resto
  return verificador === Number(cuit[10])
}

const VALIDADORES: Record<CampoRegistro, (valor: string) => string | null> = {
  dni: (valor) =>
    /^\d{7,8}$/.test(soloDigitos(valor)) ? null : "El DNI tiene 7 u 8 números (con o sin puntos).",
  nombre: (valor) => texto(valor, "tu nombre", 100),
  apellido: (valor) => texto(valor, "tu apellido", 100),
  localidad: (valor) =>
    (LOCALIDADES as readonly string[]).includes(valor) ? null : "Elegí dónde vivís.",
  direccion: (valor) => texto(valor, "la dirección", 200),
  telefono: (valor) => {
    if (!/^[\d\s()+-]*$/.test(valor)) return "Usá solo números, espacios, guiones o el signo +."
    const digitos = soloDigitos(valor).length
    return digitos >= 8 && digitos <= 15 && valor.trim().length <= 30
      ? null
      : "Ingresá el teléfono con característica, por ejemplo 341 555 1234."
  },
  email: (valor) => {
    const limpio = valor.trim()
    if (!limpio) return "Completá tu email."
    return EMAIL.test(limpio) && limpio.length <= 254
      ? null
      : "Revisá el email, por ejemplo nombre@gmail.com."
  },
  contrasena: (valor) => {
    if (valor.length < CONTRASENA_MINIMA) return `Usá al menos ${CONTRASENA_MINIMA} caracteres.`
    if (valor.length > CONTRASENA_MAXIMA) return `Usá como máximo ${CONTRASENA_MAXIMA} caracteres.`
    return null
  },
  razon_social: (valor) => texto(valor, "la razón social", 200),
  cuit: (valor) => {
    const digitos = soloDigitos(valor)
    if (digitos.length !== 11) return "El CUIT tiene 11 números (con o sin guiones)."
    return cuitValido(digitos) ? null : "El CUIT no es válido. Revisá los números."
  },
  nombre_comercial: (valor) => texto(valor, "el nombre comercial", 200),
}

/** Error message for one field, or null when the value is valid. */
export function validarCampo(campo: CampoRegistro, valor: string): string | null {
  return VALIDADORES[campo](valor)
}

/** Value as it is stored: digits only for DNI/CUIT, lowercase email, trimmed text. */
export function normalizarCampo(campo: CampoRegistro, valor: string): string {
  if (campo === "dni" || campo === "cuit") return soloDigitos(valor)
  if (campo === "email") return valor.trim().toLowerCase()
  if (campo === "contrasena") return valor
  return valor.trim()
}

/** Validates several fields at once; `errores` is empty when all are valid. */
export function validarCampos<K extends CampoRegistro>(
  campos: readonly K[],
  valores: Partial<Record<K, string>>
): Errores<K> {
  const errores: Errores<K> = {}
  for (const campo of campos) {
    const error = validarCampo(campo, valores[campo] ?? "")
    if (error) errores[campo] = error
  }
  return errores
}

/**
 * The email code, spaces tolerated when pasted. Its length is a Supabase
 * setting (Email OTP Length, 6 to 10), so any length in that range is accepted.
 */
export function normalizarCodigo(valor: string): string | null {
  const codigo = valor.replace(/\s/g, "")
  return /^\d{6,10}$/.test(codigo) ? codigo : null
}
