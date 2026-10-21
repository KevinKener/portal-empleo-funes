"use server";

import { revalidatePath } from "next/cache";
import { ARCHIVOS, rutaValida } from "@/lib/archivos";
import { requerirRol } from "@/lib/auth";
import { BUCKET_LOGOS, rutaLogoValida } from "@/lib/logo-empresa";
import { createClient } from "@/lib/supabase/server";

/**
 * Server side of the company's files: the ARCA certificate (optional, Rule 12)
 * and the logo (optional, public). The browser uploads straight to Storage;
 * these actions record, open or remove them, always inside the owner's
 * folder. The certificate ones have the same shape as the job seeker's
 * (src/app/postulante/archivos.ts) so SubidaArchivo serves both.
 */

type Resultado = { error: string | null };

const BUCKET = ARCHIVOS.arca.bucket;

async function contexto() {
  const { userId } = await requerirRol("empresa");
  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, constancia_arca_url, logo_url")
    .eq("perfil_id", userId)
    .maybeSingle();
  return { userId, supabase, empresa };
}

/** Records the certificate the browser already uploaded. */
export async function registrarArchivo(tipo: string, ruta: string): Promise<Resultado> {
  const { userId, supabase, empresa } = await contexto();
  if (tipo !== "arca" || !empresa || !rutaValida("arca", userId, ruta)) return { error: "No pudimos guardar el archivo." };

  const { error } = await supabase.from("empresas").update({ constancia_arca_url: ruta }).eq("id", empresa.id);
  if (error) {
    console.error("registrarArchivo (empresa) failed:", error.code);
    return { error: "No pudimos guardar el archivo. Probá de nuevo." };
  }
  revalidatePath("/empresa", "layout");
  return { error: null };
}

/** Short-lived link (60 s) to open the company's own certificate. */
export async function abrirArchivo(tipo: string): Promise<{ url: string | null; error: string | null }> {
  const { supabase, empresa } = await contexto();
  const ruta = empresa?.constancia_arca_url;
  if (tipo !== "arca" || !ruta) return { url: null, error: "No encontramos el archivo." };

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 60);
  if (error) {
    console.error("abrirArchivo (empresa) failed:", error.message);
    return { url: null, error: "No pudimos abrir el archivo. Probá de nuevo." };
  }
  return { url: data.signedUrl, error: null };
}

/** Removes the certificate; it is optional, so the company can take it back. */
export async function eliminarArchivo(tipo: string): Promise<Resultado> {
  const { supabase, empresa } = await contexto();
  const ruta = empresa?.constancia_arca_url;
  if (tipo !== "arca") return { error: "No pudimos borrar el archivo." };
  if (!empresa || !ruta) return { error: null };

  const { error } = await supabase.from("empresas").update({ constancia_arca_url: null }).eq("id", empresa.id);
  if (error) {
    console.error("eliminarArchivo (empresa) failed:", error.code);
    return { error: "No pudimos borrar el archivo. Probá de nuevo." };
  }
  await supabase.storage.from(BUCKET).remove([ruta]);
  revalidatePath("/empresa", "layout");
  return { error: null };
}

/**
 * Records the logo the browser already uploaded (public bucket, see
 * src/lib/logo-empresa.ts) and removes the previous one. The trigger checks
 * the path is in the owner's folder.
 */
export async function registrarLogo(ruta: string): Promise<Resultado> {
  const { userId, supabase, empresa } = await contexto();
  if (!empresa || !rutaLogoValida(userId, ruta)) return { error: "No pudimos guardar el logo." };

  const anterior = empresa.logo_url;
  const { error } = await supabase.from("empresas").update({ logo_url: ruta }).eq("id", empresa.id);
  if (error) {
    console.error("registrarLogo failed:", error.code);
    return { error: "No pudimos guardar el logo. Probá de nuevo." };
  }
  if (anterior && anterior !== ruta) await supabase.storage.from(BUCKET_LOGOS).remove([anterior]);
  // The logo also shows on the public offers
  revalidatePath("/empresa", "layout");
  revalidatePath("/ofertas", "layout");
  revalidatePath("/");
  return { error: null };
}

/** Removes the logo: the company's initial shows again. */
export async function quitarLogo(): Promise<Resultado> {
  const { supabase, empresa } = await contexto();
  if (!empresa?.logo_url) return { error: null };

  const { error } = await supabase.from("empresas").update({ logo_url: null }).eq("id", empresa.id);
  if (error) {
    console.error("quitarLogo failed:", error.code);
    return { error: "No pudimos quitar el logo. Probá de nuevo." };
  }
  await supabase.storage.from(BUCKET_LOGOS).remove([empresa.logo_url]);
  revalidatePath("/empresa", "layout");
  revalidatePath("/ofertas", "layout");
  revalidatePath("/");
  return { error: null };
}
