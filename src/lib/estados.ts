import { Constants, type Enums } from "@/types/database"

/**
 * Single source of truth for statuses and their transitions in the app
 * (AGENTS.md §2). The database enforces the same rules with triggers in
 * supabase/migrations/*_esquema_inicial.sql; keep both in sync.
 */

export type Rol = Enums<"rol_usuario">
export type EstadoVerificacion = Enums<"estado_verificacion">
export type EstadoOferta = Enums<"estado_oferta">
export type EstadoPostulacion = Enums<"estado_postulacion">
export type MotivoRechazoPostulacion = Enums<"motivo_rechazo_postulacion">
export type DecisionEmpresa = Enums<"decision_empresa">

export const ROLES = Constants.public.Enums.rol_usuario
export const ESTADOS_VERIFICACION = Constants.public.Enums.estado_verificacion
export const ESTADOS_OFERTA = Constants.public.Enums.estado_oferta
export const ESTADOS_POSTULACION = Constants.public.Enums.estado_postulacion
export const MOTIVOS_RECHAZO_POSTULACION = Constants.public.Enums.motivo_rechazo_postulacion
export const DECISIONES_EMPRESA = Constants.public.Enums.decision_empresa

type Transicion<E extends string> = {
  desde: E
  hacia: E
  roles: readonly Rol[]
}

// Shared by empresas.estado and postulantes.estado_domicilio (Rules 3 and 4).
const TRANSICIONES_VERIFICACION: readonly Transicion<EstadoVerificacion>[] = [
  { desde: "pendiente", hacia: "verificado", roles: ["admin"] },
  { desde: "pendiente", hacia: "rechazado", roles: ["admin"] },
]

// Rule 2: only the Admin approves; a rejection needs motivo_rechazo.
// The company edits only while borrador, and may take a pending offer back.
const TRANSICIONES_OFERTA: readonly Transicion<EstadoOferta>[] = [
  { desde: "borrador", hacia: "pendiente", roles: ["empresa"] },
  { desde: "pendiente", hacia: "borrador", roles: ["empresa"] },
  { desde: "pendiente", hacia: "publicada", roles: ["admin"] },
  { desde: "pendiente", hacia: "rechazada", roles: ["admin"] },
  { desde: "publicada", hacia: "cerrada", roles: ["admin", "empresa"] },
]

// Rule 1: the Admin pre-selects before the company sees the candidate.
// Every move to rechazado carries a MotivoRechazoPostulacion; the company
// applies its tomar/descartar draft in bulk via confirmar_seleccion().
const TRANSICIONES_POSTULACION: readonly Transicion<EstadoPostulacion>[] = [
  { desde: "pendiente", hacia: "preseleccionado", roles: ["admin"] },
  { desde: "pendiente", hacia: "rechazado", roles: ["admin"] },
  { desde: "preseleccionado", hacia: "entrevista", roles: ["empresa"] },
  { desde: "preseleccionado", hacia: "rechazado", roles: ["empresa"] },
  { desde: "entrevista", hacia: "contratado", roles: ["empresa"] },
  { desde: "entrevista", hacia: "rechazado", roles: ["empresa"] },
]

type EstadosPorEntidad = {
  verificacion: EstadoVerificacion
  oferta: EstadoOferta
  postulacion: EstadoPostulacion
}

export type Entidad = keyof EstadosPorEntidad

// Mapped type so TRANSICIONES[entidad] keeps the link between entity and its statuses.
const TRANSICIONES: {
  [K in Entidad]: readonly Transicion<EstadosPorEntidad[K]>[]
} = {
  verificacion: TRANSICIONES_VERIFICACION,
  oferta: TRANSICIONES_OFERTA,
  postulacion: TRANSICIONES_POSTULACION,
}

/**
 * Whether `rol` may move an entity from `desde` to `hacia`.
 * Use it in Route Handlers before updating, and in the UI to show actions.
 */
export function puedeCambiarEstado<T extends Entidad>(
  entidad: T,
  desde: EstadosPorEntidad[T],
  hacia: EstadosPorEntidad[T],
  rol: Rol
): boolean {
  return TRANSICIONES[entidad].some(
    (t) => t.desde === desde && t.hacia === hacia && t.roles.includes(rol)
  )
}

/**
 * Statuses `rol` can move an entity to from `desde` (e.g. to render action
 * buttons). Empty when the role has nothing to do in that status.
 */
export function siguientesEstados<T extends Entidad>(
  entidad: T,
  desde: EstadosPorEntidad[T],
  rol: Rol
): EstadosPorEntidad[T][] {
  return TRANSICIONES[entidad]
    .filter((t) => t.desde === desde && t.roles.includes(rol))
    .map((t) => t.hacia)
}
