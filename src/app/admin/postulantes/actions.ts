"use server";

import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { esUuid } from "@/lib/validaciones/ofertas";

export type ResultadoCv = { url: string | null; error: string | null };

/**
 * Short-lived link (60 s) to a job seeker's uploaded CV, for the Office. The
 * Storage policy "admin lee documentos" lets the Admin sign it; RLS lets only
 * the Admin read another person's row.
 */
export async function abrirCvPostulante(postulanteId: string): Promise<ResultadoCv> {
  const noEncontrado = { url: null, error: "No encontramos el CV." };
  if (!esUuid(postulanteId)) return noEncontrado;
  await requerirRol("admin");
  const supabase = await createClient();

  const { data: postulante } = await supabase.from("postulantes").select("cv_url").eq("id", postulanteId).maybeSingle();
  if (!postulante?.cv_url) return noEncontrado;

  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(postulante.cv_url, 60);
  if (error) {
    console.error("abrirCvPostulante failed:", error.message);
    return { url: null, error: "No pudimos abrir el CV. Probá de nuevo." };
  }
  return { url: data.signedUrl, error: null };
}
