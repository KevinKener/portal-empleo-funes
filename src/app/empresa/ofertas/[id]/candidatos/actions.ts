"use server";

import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { DECISIONES_EMPRESA, type DecisionEmpresa } from "@/lib/estados";
import { createClient } from "@/lib/supabase/server";
import { esUuid } from "@/lib/validaciones/ofertas";

/**
 * Server Actions of the company's selection (Rule 11). RLS only lets the
 * company touch candidates the Admin pre-selected for its own offers, and the
 * validar_cambios_postulacion trigger only accepts a draft decision while the
 * candidate is preseleccionado or entrevista.
 */

export type ResultadoSeleccion = { error: string | null };
export type ResultadoConfirmacion = { error: string | null; cambiados: number };
export type ResultadoCv = { url: string | null; error: string | null };

const ERROR_GUARDAR = "No pudimos guardar tu decisión. Recargá la página y probá de nuevo.";

/**
 * Drafts (or clears, with null) the company's decision on one candidate.
 * The job seeker does not see it until confirmarSeleccion.
 */
export async function marcarDecision(
  ofertaId: string,
  postulacionId: string,
  decision: string | null,
): Promise<ResultadoSeleccion> {
  if (!esUuid(ofertaId) || !esUuid(postulacionId)) return { error: ERROR_GUARDAR };
  if (decision !== null && !(DECISIONES_EMPRESA as readonly string[]).includes(decision)) return { error: ERROR_GUARDAR };
  await requerirRol("empresa");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .update({ decision_empresa: decision as DecisionEmpresa | null })
    .eq("id", postulacionId)
    .eq("oferta_id", ofertaId)
    .in("estado", ["preseleccionado", "entrevista"])
    .select("id");
  if (error || data.length === 0) {
    if (error) console.error("marcarDecision failed:", error.code);
    return { error: ERROR_GUARDAR };
  }

  revalidatePath(`/empresa/ofertas/${ofertaId}/candidatos`);
  return { error: null };
}

/**
 * Applies every drafted decision of the offer at once through
 * confirmar_seleccion(): tomar moves a candidate one step forward
 * (entrevista, then contratado), descartar rejects it as no_seleccionado.
 */
export async function confirmarSeleccion(ofertaId: string): Promise<ResultadoConfirmacion> {
  if (!esUuid(ofertaId)) return { error: ERROR_GUARDAR, cambiados: 0 };
  await requerirRol("empresa");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirmar_seleccion", { p_oferta_id: ofertaId });
  if (error) {
    console.error("confirmarSeleccion failed:", error.code);
    return { error: "No pudimos confirmar la selección. Probá de nuevo en unos minutos.", cambiados: 0 };
  }

  revalidatePath("/empresa", "layout");
  return { error: null, cambiados: data };
}

/**
 * Short-lived link (60 s) to a candidate's PDF CV. The Storage policy only
 * lets a company read CVs of candidates pre-selected for its offers (Rule 1).
 */
export async function abrirCvCandidato(postulacionId: string): Promise<ResultadoCv> {
  const noEncontrado = { url: null, error: "No encontramos el CV." };
  if (!esUuid(postulacionId)) return noEncontrado;
  await requerirRol("empresa");

  const supabase = await createClient();
  const { data: candidato } = await supabase
    .from("candidatos_empresa")
    .select("cv_url")
    .eq("postulacion_id", postulacionId)
    .maybeSingle();
  if (!candidato?.cv_url) return noEncontrado;

  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(candidato.cv_url, 60);
  if (error) {
    console.error("abrirCvCandidato failed:", error.message);
    return { url: null, error: "No pudimos abrir el CV. Probá de nuevo." };
  }
  return { url: data.signedUrl, error: null };
}
