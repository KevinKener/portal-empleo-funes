"use server";

import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { MOTIVOS_RECHAZO_POSTULACION, type MotivoRechazoPostulacion } from "@/lib/estados";
import { createClient } from "@/lib/supabase/server";
import { esUuid, NOTAS_ADMIN_MAXIMO } from "@/lib/validaciones/ofertas";

/**
 * Server Actions of the Office's pre-selection (branch D). Each one checks the
 * Admin role and validates; RLS and the validar_cambios_postulacion trigger
 * are the real authority: the Office only moves pending applications, to
 * preseleccionado (Rule 1, the trigger stamps fecha_preseleccion) or to
 * rechazado with a reason (Rule 10).
 */

export type ResultadoPreseleccion = { error: string | null; cambiados: number };
export type ResultadoNotas = { error: string | null };

const ERROR_CAMBIO = "No pudimos hacer el cambio. Recargá la página y probá de nuevo.";
// Enough for any real offer; a cap keeps a single request small
const MAXIMO_POR_VEZ = 200;

function idsValidos(ofertaId: string, ids: unknown): string[] | null {
  if (!esUuid(ofertaId) || !Array.isArray(ids) || ids.length === 0 || ids.length > MAXIMO_POR_VEZ) return null;
  if (!ids.every((id) => typeof id === "string" && esUuid(id))) return null;
  return [...new Set(ids as string[])];
}

function revalidar(ofertaId: string) {
  revalidatePath("/admin", "layout");
  // The company sees new candidates, the job seeker their new status
  revalidatePath("/empresa", "layout");
  revalidatePath("/postulante", "layout");
  revalidatePath(`/admin/ofertas/${ofertaId}/postulantes`);
}

/** Moves pending applications of the offer to `estado`; rows that changed meanwhile are left out. */
async function mover(
  ofertaId: string,
  ids: unknown,
  cambios: { estado: "preseleccionado" } | { estado: "rechazado"; motivo_rechazo: MotivoRechazoPostulacion },
): Promise<ResultadoPreseleccion> {
  const lista = idsValidos(ofertaId, ids);
  if (!lista) return { error: ERROR_CAMBIO, cambiados: 0 };
  await requerirRol("admin");
  const supabase = await createClient();

  // Filtering by pendiente avoids acting on a stale screen
  const { data, error } = await supabase
    .from("postulaciones")
    .update(cambios)
    .in("id", lista)
    .eq("oferta_id", ofertaId)
    .eq("estado", "pendiente")
    .select("id");
  if (error) {
    console.error("preseleccion failed:", error.code);
    return { error: ERROR_CAMBIO, cambiados: 0 };
  }
  if (data.length === 0) {
    return { error: "Estas postulaciones ya cambiaron mientras las mirabas. Recargá la página para ver cómo quedaron.", cambiados: 0 };
  }

  revalidar(ofertaId);
  return { error: null, cambiados: data.length };
}

/** Sends pending candidates to the company: from now on it sees them (Rule 1). */
export async function preseleccionar(ofertaId: string, ids: string[]): Promise<ResultadoPreseleccion> {
  return mover(ofertaId, ids, { estado: "preseleccionado" });
}

/** Rejects pending applications with the reason the job seeker reads (Rule 10). */
export async function rechazarPostulaciones(ofertaId: string, ids: string[], motivo: string): Promise<ResultadoPreseleccion> {
  if (!(MOTIVOS_RECHAZO_POSTULACION as readonly string[]).includes(motivo)) {
    return { error: "Elegí el motivo del rechazo.", cambiados: 0 };
  }
  return mover(ofertaId, ids, { estado: "rechazado", motivo_rechazo: motivo as MotivoRechazoPostulacion });
}

/** Saves the Office's private notes on an application (never shown to the company or the job seeker). */
export async function guardarNotas(ofertaId: string, postulacionId: string, notas: string): Promise<ResultadoNotas> {
  if (!esUuid(ofertaId) || !esUuid(postulacionId) || typeof notas !== "string") return { error: ERROR_CAMBIO };
  const texto = notas.trim();
  if (texto.length > NOTAS_ADMIN_MAXIMO) return { error: `Las notas pueden tener hasta ${NOTAS_ADMIN_MAXIMO} caracteres.` };
  await requerirRol("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("postulaciones")
    .update({ notas_admin: texto || null })
    .eq("id", postulacionId)
    .eq("oferta_id", ofertaId)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("guardarNotas failed:", error.code);
    return { error: "No pudimos guardar las notas. Probá de nuevo." };
  }

  revalidatePath(`/admin/ofertas/${ofertaId}/postulantes/${postulacionId}`);
  return { error: null };
}
