"use server";

import { revalidatePath } from "next/cache";
import { ARCHIVOS } from "@/lib/archivos";
import { requerirRol } from "@/lib/auth";
import { puedeCambiarEstado, type EstadoVerificacion } from "@/lib/estados";
import { createClient } from "@/lib/supabase/server";
import { esUuid, MOTIVO_RECHAZO } from "@/lib/validaciones/ofertas";

/**
 * Server Actions of the Office over companies (branch C). Each one checks the
 * Admin role and validates; RLS and the validar_cambios_empresa trigger are
 * the real authority (Rule 3: only the Admin verifies, only from pendiente;
 * a rejection carries a reason, 20261021140000_rechazo_empresa.sql).
 */

export type ResultadoVerificacion = { error: string | null };

const ERROR_CAMBIO = "No pudimos hacer el cambio. Recargá la página y probá de nuevo.";

async function mover(id: string, hacia: EstadoVerificacion, motivo: string | null): Promise<ResultadoVerificacion> {
  if (!esUuid(id)) return { error: ERROR_CAMBIO };
  await requerirRol("admin");
  const supabase = await createClient();

  const { data: empresa } = await supabase.from("empresas").select("estado").eq("id", id).maybeSingle();
  if (!empresa || !puedeCambiarEstado("verificacion", empresa.estado, hacia, "admin")) {
    return { error: "Esta empresa cambió mientras la mirabas. Recargá la página para ver cómo quedó." };
  }

  // The trigger clears the reason on verification; filtering by the status just read avoids a stale screen
  const { data, error } = await supabase
    .from("empresas")
    .update({ estado: hacia, ...(motivo ? { motivo_rechazo: motivo } : {}) })
    .eq("id", id)
    .eq("estado", empresa.estado)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("verificacion de empresa failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidatePath("/admin", "layout");
  // The company's own area changes too (notice, "Nueva oferta" enabled)
  revalidatePath("/empresa", "layout");
  return { error: null };
}

/** Verifies a pending company: from now on it can post offers (Rule 3). */
export async function verificarEmpresa(id: string): Promise<ResultadoVerificacion> {
  return mover(id, "verificado", null);
}

/** Rejects a pending company with the reason it reads in its area (D1: fixing its data sends it back to review). */
export async function rechazarEmpresa(id: string, motivo: string): Promise<ResultadoVerificacion> {
  const texto = typeof motivo === "string" ? motivo.trim() : "";
  if (texto.length < MOTIVO_RECHAZO.minimo) {
    return { error: `Escribí el motivo para la empresa (al menos ${MOTIVO_RECHAZO.minimo} caracteres), así sabe qué corregir.` };
  }
  if (texto.length > MOTIVO_RECHAZO.maximo) return { error: `El motivo puede tener hasta ${MOTIVO_RECHAZO.maximo} caracteres.` };
  return mover(id, "rechazado", texto);
}

/** Short-lived link (60 s) to the company's ARCA certificate (private bucket, Admin read policy). */
export async function abrirConstancia(id: string): Promise<{ url: string | null; error: string | null }> {
  if (!esUuid(id)) return { url: null, error: "No encontramos el archivo." };
  await requerirRol("admin");
  const supabase = await createClient();

  const { data: empresa } = await supabase.from("empresas").select("constancia_arca_url").eq("id", id).maybeSingle();
  if (!empresa?.constancia_arca_url) return { url: null, error: "La empresa no subió la constancia." };

  const { data, error } = await supabase.storage.from(ARCHIVOS.arca.bucket).createSignedUrl(empresa.constancia_arca_url, 60);
  if (error) {
    console.error("abrirConstancia failed:", error.message);
    return { url: null, error: "No pudimos abrir el archivo. Probá de nuevo." };
  }
  return { url: data.signedUrl, error: null };
}
