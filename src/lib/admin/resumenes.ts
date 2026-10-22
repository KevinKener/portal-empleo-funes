import "server-only"
import { cache } from "react"
import { ofertaVencida } from "@/lib/cierre-oferta"
import { createClient } from "@/lib/supabase/server"

/**
 * Figures for the band at the top of each Office section (Empresas, Ofertas,
 * Postulantes): whole-portal totals, independent of what the list below is
 * searching, plus where the next action is. Read with the Admin's own
 * session; callers check the role first with requerirRol("admin").
 */

const ERROR_LECTURA = "No se pudo leer el resumen de la sección"
const DIA = 24 * 60 * 60 * 1000
// "Nuevos esta semana" on the job seekers' band
const DIAS_NUEVOS = 7

const fecha = (iso: string) => new Date(iso).getTime()

export type ResumenEmpresas = {
  pendientes: number
  verificadas: number
  rechazadas: number
  /** The company waiting longest (updated_at also moves when a rejected one sends fixes, D1). */
  proxima: { id: string; desde: string } | null
}

/** Companies by verification status and the next one to verify. Admin only; throws on database errors. */
export const resumirEmpresas = cache(async (): Promise<ResumenEmpresas> => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("empresas").select("id, estado, updated_at")
  if (error) throw new Error(ERROR_LECTURA)

  const pendientes = data.filter((e) => e.estado === "pendiente").sort((a, b) => fecha(a.updated_at) - fecha(b.updated_at))
  return {
    pendientes: pendientes.length,
    verificadas: data.filter((e) => e.estado === "verificado").length,
    rechazadas: data.filter((e) => e.estado === "rechazado").length,
    proxima: pendientes[0] ? { id: pendientes[0].id, desde: pendientes[0].updated_at } : null,
  }
})

export type ResumenOfertas = {
  porRevisar: number
  urgentes: number
  /** Published and still open (expired ones are out of the portal). */
  publicadas: number
  vencidas: number
  /** Pending applications and in how many offers. */
  postulaciones: { pendientes: number; ofertas: number }
  /** Where the Office should go next: an offer to review, else the offer with most applicants waiting. */
  proxima: { href: string; texto: string } | null
}

/**
 * Offers by stage, pending applications and the next thing to do: the offer
 * to review (urgent first, then oldest, as the queue), or else the published
 * offer with the most applications waiting. Admin only; throws on database errors.
 */
export const resumirOfertas = cache(async (momento: number): Promise<ResumenOfertas> => {
  const supabase = await createClient()
  const [ofertas, postulaciones] = await Promise.all([
    supabase.from("ofertas").select("id, estado, prioridad, fecha_envio, updated_at, fecha_cierre").neq("estado", "borrador"),
    supabase.from("postulaciones").select("oferta_id").eq("estado", "pendiente"),
  ])
  if (ofertas.error || postulaciones.error) throw new Error(ERROR_LECTURA)

  const porRevisar = ofertas.data
    .filter((o) => o.estado === "pendiente")
    .sort(
      (a, b) =>
        Number(b.prioridad === "urgente") - Number(a.prioridad === "urgente") ||
        fecha(a.fecha_envio ?? a.updated_at) - fecha(b.fecha_envio ?? b.updated_at),
    )
  const publicadas = ofertas.data.filter((o) => o.estado === "publicada")
  const vencidas = publicadas.filter((o) => ofertaVencida(o, momento)).length

  const esperando = new Map<string, number>()
  for (const { oferta_id } of postulaciones.data) esperando.set(oferta_id, (esperando.get(oferta_id) ?? 0) + 1)
  const masEsperando = [...esperando].sort((a, b) => b[1] - a[1])[0]

  return {
    porRevisar: porRevisar.length,
    urgentes: porRevisar.filter((o) => o.prioridad === "urgente").length,
    publicadas: publicadas.length - vencidas,
    vencidas,
    postulaciones: { pendientes: postulaciones.data.length, ofertas: esperando.size },
    proxima: porRevisar[0]
      ? { href: `/admin/ofertas/${porRevisar[0].id}`, texto: "Revisar la próxima" }
      : masEsperando
        ? { href: `/admin/ofertas/${masEsperando[0]}/postulantes`, texto: "Revisar postulantes" }
        : null,
  }
})

export type ResumenPostulantes = {
  total: number
  funes: number
  verificados: number
  nuevos: number
}

/** Registered job seekers, Funes residents, verified addresses and new accounts this week. Admin only. */
export const resumirPostulantes = cache(async (momento: number): Promise<ResumenPostulantes> => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("postulantes").select("localidad, estado_domicilio, created_at")
  if (error) throw new Error(ERROR_LECTURA)

  const desde = momento - DIAS_NUEVOS * DIA
  return {
    total: data.length,
    funes: data.filter((p) => p.localidad === "funes").length,
    verificados: data.filter((p) => p.estado_domicilio === "verificado").length,
    nuevos: data.filter((p) => fecha(p.created_at) >= desde).length,
  }
})
