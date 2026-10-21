import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { EstadoOferta, EstadoVerificacion } from "@/lib/estados"
import type { Tables } from "@/types/database"

/**
 * Companies as the Employment Office sees them (branch C, docs/research/admin.md
 * §5). Read with the Admin's own session ("empresas: admin ve todas").
 * Callers check the role first with requerirRol("admin").
 */

export const FILTROS_EMPRESAS_ADMIN = ["pendiente", "verificado", "rechazado", "todas"] as const
export type FiltroEmpresasAdmin = (typeof FILTROS_EMPRESAS_ADMIN)[number]

/** `?estado=` from the URL, defaulting to the companies waiting for verification. */
export function filtroEmpresasAdmin(valor: string | string[] | undefined): FiltroEmpresasAdmin {
  return (FILTROS_EMPRESAS_ADMIN as readonly string[]).includes(String(valor)) ? (valor as FiltroEmpresasAdmin) : "pendiente"
}

export type FilaEmpresaAdmin = Pick<
  Tables<"empresas">,
  "id" | "nombre_comercial" | "razon_social" | "cuit" | "estado" | "logo_url" | "created_at" | "updated_at" | "motivo_rechazo"
> & {
  tieneArca: boolean
  /** Offers the company sent (drafts are its private work and do not count). */
  ofertas: number
}

export type ListadoEmpresasAdmin = { filas: FilaEmpresaAdmin[]; conteo: Record<FiltroEmpresasAdmin, number> }

const ERROR_LECTURA = "No se pudieron leer las empresas"

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

const fecha = (iso: string) => new Date(iso).getTime()

const ORDEN: Record<FiltroEmpresasAdmin, (a: FilaEmpresaAdmin, b: FilaEmpresaAdmin) => number> = {
  // Waiting longest first; updated_at moves when a rejected company sends its fixes (D1)
  pendiente: (a, b) => fecha(a.updated_at) - fecha(b.updated_at),
  verificado: (a, b) => a.nombre_comercial.localeCompare(b.nombre_comercial, "es"),
  rechazado: (a, b) => fecha(b.updated_at) - fecha(a.updated_at),
  todas: (a, b) => a.nombre_comercial.localeCompare(b.nombre_comercial, "es"),
}

/**
 * Every company with its sent offers, searched by trade name, legal name or
 * CUIT (with or without dashes) in memory, plus the count of each filter.
 * Admin only; throws on database errors.
 */
export async function listarEmpresasAdmin(filtro: FiltroEmpresasAdmin, busqueda: string): Promise<ListadoEmpresasAdmin> {
  const supabase = await createClient()
  const [empresas, ofertas] = await Promise.all([
    supabase.from("empresas").select("id, nombre_comercial, razon_social, cuit, estado, logo_url, created_at, updated_at, motivo_rechazo, constancia_arca_url"),
    supabase.from("ofertas").select("empresa_id").neq("estado", "borrador"),
  ])
  if (empresas.error || ofertas.error) throw new Error(ERROR_LECTURA)

  const porEmpresa = new Map<string, number>()
  for (const { empresa_id } of ofertas.data) porEmpresa.set(empresa_id, (porEmpresa.get(empresa_id) ?? 0) + 1)

  const todas: FilaEmpresaAdmin[] = empresas.data.map(({ constancia_arca_url, ...empresa }) => ({
    ...empresa,
    tieneArca: Boolean(constancia_arca_url),
    ofertas: porEmpresa.get(empresa.id) ?? 0,
  }))

  const texto = normalizar(busqueda.trim())
  const digitos = busqueda.replace(/\D/g, "")
  const buscadas = texto
    ? todas.filter(
        (e) => normalizar(`${e.nombre_comercial} ${e.razon_social}`).includes(texto) || (digitos.length >= 3 && e.cuit.includes(digitos)),
      )
    : todas

  const enFiltro = (e: FilaEmpresaAdmin, f: FiltroEmpresasAdmin) => f === "todas" || e.estado === f
  const conteo = Object.fromEntries(FILTROS_EMPRESAS_ADMIN.map((f) => [f, buscadas.filter((e) => enFiltro(e, f)).length])) as Record<
    FiltroEmpresasAdmin,
    number
  >

  return { filas: buscadas.filter((e) => enFiltro(e, filtro)).sort(ORDEN[filtro]), conteo }
}

export type OfertaDeEmpresa = Pick<Tables<"ofertas">, "id" | "titulo" | "estado" | "updated_at">

export type EmpresaAdmin = Tables<"empresas"> & {
  /** Offers it sent, newest first (drafts stay private). */
  ofertas: OfertaDeEmpresa[]
}

/** One company for its review page, or null when it does not exist. Admin only. */
export async function obtenerEmpresaAdmin(id: string): Promise<EmpresaAdmin | null> {
  const supabase = await createClient()
  const [empresa, ofertas] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("ofertas")
      .select("id, titulo, estado, updated_at")
      .eq("empresa_id", id)
      .neq("estado", "borrador" satisfies EstadoOferta)
      .order("updated_at", { ascending: false }),
  ])
  if (empresa.error || ofertas.error) throw new Error(ERROR_LECTURA)
  return empresa.data ? { ...empresa.data, ofertas: ofertas.data } : null
}

/** Next company waiting for verification other than `excluir` (the one waiting longest). */
export async function siguienteEmpresaPendiente(excluir: string): Promise<{ id: string; restantes: number } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("empresas")
    .select("id")
    .eq("estado", "pendiente" satisfies EstadoVerificacion)
    .neq("id", excluir)
    .order("updated_at", { ascending: true })
  if (error || data.length === 0) return null
  return { id: data[0].id, restantes: data.length }
}
