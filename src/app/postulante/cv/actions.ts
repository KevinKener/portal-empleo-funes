"use server";

import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { esUuid } from "@/lib/validaciones/ofertas";
import { MAXIMO_ITEMS_CV, MAXIMO_SOBRE_MI, validarExperiencia, validarFormacion } from "@/lib/validaciones/cv";

/**
 * Server Actions for the CV built on the platform (Rule 6). Role checked
 * first; RLS limits every row to the signed-in job seeker, and every query
 * also filters by their postulante id.
 */

export type EstadoCv = { errores: Record<string, string>; mensaje: string | null; guardado: boolean };

const ERROR_GUARDAR = "No pudimos guardar los cambios. Probá de nuevo en unos minutos.";

async function postulanteActual() {
  const { userId } = await requerirRol("postulante");
  const supabase = await createClient();
  const { data } = await supabase.from("postulantes").select("id").eq("perfil_id", userId).maybeSingle();
  return { supabase, postulanteId: data?.id ?? null };
}

function terminar(): EstadoCv {
  revalidatePath("/postulante", "layout");
  return { errores: {}, mensaje: null, guardado: true };
}

/** "Sobre mí": free text about the person (postulantes.descripcion). */
export async function guardarSobreMi(_previo: EstadoCv, formData: FormData): Promise<EstadoCv> {
  const valor = formData.get("descripcion");
  const descripcion = typeof valor === "string" ? valor.trim() : "";
  if (descripcion.length > MAXIMO_SOBRE_MI) {
    return { errores: { descripcion: `Usá como máximo ${MAXIMO_SOBRE_MI} caracteres.` }, mensaje: null, guardado: false };
  }

  const { supabase, postulanteId } = await postulanteActual();
  if (!postulanteId) return { errores: {}, mensaje: ERROR_GUARDAR, guardado: false };
  const { error } = await supabase
    .from("postulantes")
    .update({ descripcion: descripcion || null })
    .eq("id", postulanteId);
  if (error) {
    console.error("guardarSobreMi failed:", error.code);
    return { errores: {}, mensaje: ERROR_GUARDAR, guardado: false };
  }
  return terminar();
}

/** Creates or edits (when `id` comes in the form) one work experience. */
export async function guardarExperiencia(_previo: EstadoCv, formData: FormData): Promise<EstadoCv> {
  const resultado = validarExperiencia(formData);
  if (!resultado.ok) return { errores: resultado.errores, mensaje: "Revisá los datos marcados.", guardado: false };

  const destino = await prepararGuardado("experiencias", formData.get("id"));
  if ("estado" in destino) return destino.estado;
  const { supabase, postulanteId, id } = destino;
  const { error } = id
    ? await supabase.from("experiencias").update(resultado.datos).eq("id", id).eq("postulante_id", postulanteId)
    : await supabase.from("experiencias").insert({ ...resultado.datos, postulante_id: postulanteId });
  return resultadoGuardado("experiencias", error);
}

/** Creates or edits (when `id` comes in the form) one education item. */
export async function guardarFormacion(_previo: EstadoCv, formData: FormData): Promise<EstadoCv> {
  const resultado = validarFormacion(formData);
  if (!resultado.ok) return { errores: resultado.errores, mensaje: "Revisá los datos marcados.", guardado: false };

  const destino = await prepararGuardado("formaciones", formData.get("id"));
  if ("estado" in destino) return destino.estado;
  const { supabase, postulanteId, id } = destino;
  const { error } = id
    ? await supabase.from("formaciones").update(resultado.datos).eq("id", id).eq("postulante_id", postulanteId)
    : await supabase.from("formaciones").insert({ ...resultado.datos, postulante_id: postulanteId });
  return resultadoGuardado("formaciones", error);
}

/**
 * Who is saving and whether it is an edit (valid id) or a new item (under
 * the cap). Returns `estado` instead when the save must stop.
 */
type Destino =
  | { estado: EstadoCv }
  | { supabase: Awaited<ReturnType<typeof createClient>>; postulanteId: string; id: string | null };

async function prepararGuardado(
  tabla: "experiencias" | "formaciones",
  idForm: FormDataEntryValue | null,
): Promise<Destino> {
  const { supabase, postulanteId } = await postulanteActual();
  if (!postulanteId) return { estado: { errores: {}, mensaje: ERROR_GUARDAR, guardado: false } };

  if (typeof idForm === "string" && idForm) {
    if (!esUuid(idForm)) return { estado: { errores: {}, mensaje: ERROR_GUARDAR, guardado: false } };
    return { supabase, postulanteId, id: idForm };
  }

  const { count } = await supabase
    .from(tabla)
    .select("id", { count: "exact", head: true })
    .eq("postulante_id", postulanteId);
  if ((count ?? 0) >= MAXIMO_ITEMS_CV) {
    return { estado: { errores: {}, mensaje: `Podés cargar hasta ${MAXIMO_ITEMS_CV}.`, guardado: false } };
  }
  return { supabase, postulanteId, id: null };
}

function resultadoGuardado(tabla: string, error: { code: string } | null): EstadoCv {
  if (error) {
    console.error(`guardar ${tabla} failed:`, error.code);
    return { errores: {}, mensaje: ERROR_GUARDAR, guardado: false };
  }
  return terminar();
}

/** Deletes one experience or education item of the signed-in job seeker. */
export async function eliminarItemCv(tabla: "experiencias" | "formaciones", id: string): Promise<{ error: string | null }> {
  if ((tabla !== "experiencias" && tabla !== "formaciones") || !esUuid(id)) {
    return { error: "No pudimos borrarlo." };
  }
  const { supabase, postulanteId } = await postulanteActual();
  if (!postulanteId) return { error: "No pudimos borrarlo." };

  const { error } = await supabase.from(tabla).delete().eq("id", id).eq("postulante_id", postulanteId);
  if (error) {
    console.error(`eliminar ${tabla} failed:`, error.code);
    return { error: "No pudimos borrarlo. Probá de nuevo." };
  }
  revalidatePath("/postulante", "layout");
  return { error: null };
}
