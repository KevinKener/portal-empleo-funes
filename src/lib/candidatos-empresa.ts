import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { DecisionEmpresa, EstadoPostulacion, MotivoRechazoPostulacion } from "@/lib/estados"
import type { Enums, Tables } from "@/types/database"

/**
 * Pre-selected candidates of a company's offer, read from the
 * candidatos_empresa view: only rows the Admin pre-selected for the signed-in
 * company's own offers (Rule 1), with phone and email only from entrevista on
 * (20261020120000_candidatos_empresa.sql). Callers check the role first.
 */

export type ExperienciaCandidato = Pick<Tables<"experiencias">, "id" | "postulante_id" | "puesto" | "empresa" | "desde" | "hasta" | "tareas">
export type FormacionCandidato = Pick<Tables<"formaciones">, "id" | "postulante_id" | "nivel" | "titulo" | "institucion" | "estado">

export type Candidato = {
  postulacionId: string
  estado: EstadoPostulacion
  motivoRechazo: MotivoRechazoPostulacion | null
  decision: DecisionEmpresa | null
  nombre: string
  apellido: string
  localidad: Enums<"localidad"> | null
  descripcion: string | null
  tieneCvPdf: boolean
  categorias: string[]
  telefono: string | null
  email: string | null
  experiencias: ExperienciaCandidato[]
  formaciones: FormacionCandidato[]
}

/**
 * Every pre-selected candidate of the offer, oldest pre-selection first, with
 * the CV built on the platform. Empty for offers of other companies.
 * Throws on database errors.
 */
export async function listarCandidatos(ofertaId: string): Promise<Candidato[]> {
  const supabase = await createClient()
  const { data: filas, error } = await supabase
    .from("candidatos_empresa")
    .select(
      "postulacion_id, postulante_id, estado, motivo_rechazo, decision_empresa, nombre, apellido, localidad, descripcion, cv_url, categorias, telefono, email",
    )
    .eq("oferta_id", ofertaId)
    .order("fecha_preseleccion")
  if (error) throw new Error(`listarCandidatos: ${error.message}`)

  const ids = filas.map((fila) => fila.postulante_id).filter((id): id is string => id !== null)
  const [experiencias, formaciones] = await Promise.all([
    supabase
      .from("experiencias")
      .select("id, postulante_id, puesto, empresa, desde, hasta, tareas")
      .in("postulante_id", ids)
      .order("desde", { ascending: false }),
    supabase
      .from("formaciones")
      .select("id, postulante_id, nivel, titulo, institucion, estado")
      .in("postulante_id", ids)
      .order("created_at"),
  ])
  if (experiencias.error) throw new Error(`listarCandidatos experiencias: ${experiencias.error.message}`)
  if (formaciones.error) throw new Error(`listarCandidatos formaciones: ${formaciones.error.message}`)

  // View columns come back nullable in the generated types; the joins guarantee them.
  return filas.flatMap((fila) => {
    if (!fila.postulacion_id || !fila.estado || !fila.postulante_id) return []
    return [
      {
        postulacionId: fila.postulacion_id,
        estado: fila.estado,
        motivoRechazo: fila.motivo_rechazo,
        decision: fila.decision_empresa,
        nombre: fila.nombre ?? "",
        apellido: fila.apellido ?? "",
        localidad: fila.localidad,
        descripcion: fila.descripcion,
        tieneCvPdf: fila.cv_url !== null,
        categorias: fila.categorias ?? [],
        telefono: fila.telefono,
        email: fila.email,
        experiencias: experiencias.data.filter((item) => item.postulante_id === fila.postulante_id),
        formaciones: formaciones.data.filter((item) => item.postulante_id === fila.postulante_id),
      },
    ]
  })
}

/** How many candidates the Admin pre-selected for the offer. Throws on database errors. */
export async function contarCandidatos(ofertaId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("candidatos_empresa")
    .select("postulacion_id", { count: "exact", head: true })
    .eq("oferta_id", ofertaId)
  if (error) throw new Error(`contarCandidatos: ${error.message}`)
  return count ?? 0
}

export type ResumenCandidatos = {
  total: number
  /** Pre-selected with no draft decision yet. */
  porRevisar: number
  /** In the interview stage with no draft decision yet. */
  enEntrevista: number
  /** Drafted decisions waiting for confirmar_seleccion (Rule 11). */
  sinConfirmar: number
  contratados: number
}

const RESUMEN_VACIO: ResumenCandidatos = { total: 0, porRevisar: 0, enEntrevista: 0, sinConfirmar: 0, contratados: 0 }

/**
 * Candidates per offer for every offer of the signed-in company, in one
 * query (the view already keeps only its own). Throws on database errors.
 */
export async function resumirCandidatosPorOferta(): Promise<Map<string, ResumenCandidatos>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("candidatos_empresa").select("oferta_id, estado, decision_empresa")
  if (error) throw new Error(`resumirCandidatosPorOferta: ${error.message}`)

  const resumen = new Map<string, ResumenCandidatos>()
  for (const fila of data) {
    if (!fila.oferta_id) continue
    const actual = resumen.get(fila.oferta_id) ?? { ...RESUMEN_VACIO }
    actual.total += 1
    if (fila.decision_empresa !== null) actual.sinConfirmar += 1
    else if (fila.estado === "preseleccionado") actual.porRevisar += 1
    else if (fila.estado === "entrevista") actual.enEntrevista += 1
    if (fila.estado === "contratado") actual.contratados += 1
    resumen.set(fila.oferta_id, actual)
  }
  return resumen
}
