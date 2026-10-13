"use server";

import { revalidatePath } from "next/cache";
import { ARCHIVOS, rutaValida, type TipoArchivo } from "@/lib/archivos";
import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database";

/**
 * Server side of the job seeker's files. The browser uploads straight to
 * Storage (Vercel functions cap request bodies at 4.5 MB); these actions
 * only record, open or remove the file, always inside the owner's folder.
 */

type Resultado = { error: string | null };

const COLUMNA = { cv: "cv_url", comprobante: "comprobante_url", foto: "foto_url" } as const;

/** The postulantes update that stores (or clears) a file path. */
function cambio(tipo: TipoArchivo, ruta: string | null): TablesUpdate<"postulantes"> {
  if (tipo === "cv") return { cv_url: ruta };
  if (tipo === "comprobante") return { comprobante_url: ruta };
  return { foto_url: ruta };
}

function esTipo(tipo: string): tipo is TipoArchivo {
  return tipo === "cv" || tipo === "comprobante" || tipo === "foto";
}

async function contexto() {
  const { userId } = await requerirRol("postulante");
  const supabase = await createClient();
  const { data: postulante } = await supabase
    .from("postulantes")
    .select("id, cv_url, comprobante_url, foto_url, estado_domicilio")
    .eq("perfil_id", userId)
    .maybeSingle();
  return { userId, supabase, postulante };
}

/**
 * Records a file the browser already uploaded. A new proof of address sends
 * the address back to review (trigger on postulantes, Rule 4).
 */
export async function registrarArchivo(tipo: string, ruta: string): Promise<Resultado> {
  if (!esTipo(tipo)) return { error: "No pudimos guardar el archivo." };
  const { userId, supabase, postulante } = await contexto();
  if (!postulante || !rutaValida(tipo, userId, ruta)) return { error: "No pudimos guardar el archivo." };

  const anterior = postulante[COLUMNA[tipo]];
  const { error } = await supabase
    .from("postulantes")
    .update(cambio(tipo, ruta))
    .eq("id", postulante.id);
  if (error) {
    console.error("registrarArchivo failed:", error.code);
    return { error: "No pudimos guardar el archivo. Probá de nuevo." };
  }

  // Same name means the upload already replaced it; a new extension leaves the old file behind
  if (anterior && anterior !== ruta) {
    await supabase.storage.from(ARCHIVOS[tipo].bucket).remove([anterior]);
  }
  revalidatePath("/postulante", "layout");
  return { error: null };
}

/** Short-lived link (60 s) to open the person's own file. */
export async function abrirArchivo(tipo: string): Promise<{ url: string | null; error: string | null }> {
  if (!esTipo(tipo)) return { url: null, error: "No encontramos el archivo." };
  const { supabase, postulante } = await contexto();
  const ruta = postulante?.[COLUMNA[tipo]];
  if (!ruta) return { url: null, error: "No encontramos el archivo." };

  const { data, error } = await supabase.storage.from(ARCHIVOS[tipo].bucket).createSignedUrl(ruta, 60);
  if (error) {
    console.error("abrirArchivo failed:", error.message);
    return { url: null, error: "No pudimos abrir el archivo. Probá de nuevo." };
  }
  return { url: data.signedUrl, error: null };
}

/**
 * Removes a file, e.g. a wrong photo or the profile photo. A verified proof of address cannot be
 * removed (it was already checked); it can only be replaced by a new one.
 */
export async function eliminarArchivo(tipo: string): Promise<Resultado> {
  if (!esTipo(tipo)) return { error: "No pudimos borrar el archivo." };
  const { supabase, postulante } = await contexto();
  const ruta = postulante?.[COLUMNA[tipo]];
  if (!postulante || !ruta) return { error: null };
  if (tipo === "comprobante" && postulante.estado_domicilio === "verificado") {
    return { error: "Tu comprobante ya está verificado. Si te mudaste, subí uno nuevo." };
  }

  const { error } = await supabase
    .from("postulantes")
    .update(cambio(tipo, null))
    .eq("id", postulante.id);
  if (error) {
    console.error("eliminarArchivo failed:", error.code);
    return { error: "No pudimos borrar el archivo. Probá de nuevo." };
  }
  await supabase.storage.from(ARCHIVOS[tipo].bucket).remove([ruta]);
  revalidatePath("/postulante", "layout");
  return { error: null };
}
