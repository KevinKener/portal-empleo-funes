"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirRol } from "@/lib/auth";
import { ESTADOS_OFERTA, puedeCambiarEstado, type EstadoOferta } from "@/lib/estados";
import { obtenerEmpresaActual } from "@/lib/ofertas-empresa";
import { createClient } from "@/lib/supabase/server";
import { esUuid, validarOferta } from "@/lib/validaciones/ofertas";

/**
 * Server Actions of the company's offers (Phase 5). Each one checks the role,
 * then validates; RLS and the validar_cambios_oferta trigger are the real
 * authority (Rules 2, 3 and 9), these checks only give clearer messages.
 */

export type EstadoFormularioOferta = { errores: Record<string, string>; mensaje: string | null };
export type ResultadoAccion = { error: string | null };

const ERROR_GUARDAR = "No pudimos guardar la oferta. Probá de nuevo en unos minutos.";
const ERROR_CAMBIO = "No pudimos hacer el cambio. Recargá la página y probá de nuevo.";
const SIN_VERIFICAR = "Vas a poder cargar ofertas cuando la Oficina de Empleo verifique tu empresa.";

// Offers the company may copy into a new draft: final states nobody can move out of.
const ESTADOS_COPIABLES: readonly EstadoOferta[] = ["rechazada", "cerrada"];

async function empresaActual() {
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  return { supabase: await createClient(), empresa };
}

function revalidar() {
  revalidatePath("/empresa", "layout");
  // Published or closed offers also change the public portal.
  revalidatePath("/ofertas");
}

/**
 * Creates a draft, or edits one when `id` comes in the form (Rule 9: only
 * while `borrador`). Goes to the offer's page once saved.
 */
export async function guardarOferta(
  _previo: EstadoFormularioOferta,
  formData: FormData,
): Promise<EstadoFormularioOferta> {
  const resultado = validarOferta(formData);
  if (!resultado.ok) return { errores: resultado.errores, mensaje: "Revisá los datos marcados." };

  const idTexto = formData.get("id");
  const id = typeof idTexto === "string" && idTexto !== "" ? idTexto : null;
  if (id !== null && !esUuid(id)) return { errores: {}, mensaje: ERROR_GUARDAR };

  const { supabase, empresa } = await empresaActual();
  if (!empresa) return { errores: {}, mensaje: ERROR_GUARDAR };

  let guardada: string;
  if (id) {
    const { data, error } = await supabase
      .from("ofertas")
      .update(resultado.datos)
      .eq("id", id)
      .eq("empresa_id", empresa.id)
      .eq("estado", "borrador")
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("guardarOferta update failed:", error.code);
      return { errores: {}, mensaje: ERROR_GUARDAR };
    }
    // No row: it was sent to review (or deleted) in another tab.
    if (!data) return { errores: {}, mensaje: "Esta oferta ya no es un borrador, así que no se puede editar." };
    guardada = data.id;
  } else {
    // Rule 3: RLS rejects it anyway; this gives a clear message.
    if (empresa.estado !== "verificado") return { errores: {}, mensaje: SIN_VERIFICAR };
    const { data, error } = await supabase
      .from("ofertas")
      .insert({ ...resultado.datos, empresa_id: empresa.id })
      .select("id")
      .single();
    if (error) {
      console.error("guardarOferta insert failed:", error.code);
      return { errores: {}, mensaje: ERROR_GUARDAR };
    }
    guardada = data.id;
  }

  revalidar();
  redirect(`/empresa/ofertas/${guardada}`);
}

/**
 * Moves an own offer to `hacia` when the company may (src/lib/estados.ts):
 * send to review, take back to draft, or close a published one.
 */
export async function cambiarEstadoOferta(id: string, hacia: string): Promise<ResultadoAccion> {
  if (!esUuid(id) || !(ESTADOS_OFERTA as readonly string[]).includes(hacia)) return { error: ERROR_CAMBIO };
  const destino = hacia as EstadoOferta;

  const { supabase, empresa } = await empresaActual();
  if (!empresa) return { error: ERROR_CAMBIO };

  const { data: oferta } = await supabase
    .from("ofertas")
    .select("estado")
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (!oferta || !puedeCambiarEstado("oferta", oferta.estado, destino, "empresa")) return { error: ERROR_CAMBIO };

  // Filtering by the status just read avoids acting on a stale screen.
  const { data, error } = await supabase
    .from("ofertas")
    .update({ estado: destino })
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .eq("estado", oferta.estado)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("cambiarEstadoOferta failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidar();
  return { error: null };
}

/** Deletes an own draft (RLS only lets the company delete drafts) and goes back to the list. */
export async function eliminarBorrador(id: string): Promise<ResultadoAccion> {
  if (!esUuid(id)) return { error: ERROR_CAMBIO };

  const { supabase, empresa } = await empresaActual();
  if (!empresa) return { error: ERROR_CAMBIO };

  const { data, error } = await supabase
    .from("ofertas")
    .delete()
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .eq("estado", "borrador")
    .select("id");
  if (error || data.length === 0) {
    if (error) console.error("eliminarBorrador failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidar();
  redirect("/empresa/ofertas");
}

/**
 * Copies a rejected or closed offer into a new draft, so the company fixes
 * it (or posts the same job again) without typing everything. Live offers
 * are never copied: the same job would show twice on the portal.
 */
export async function usarComoBase(id: string): Promise<ResultadoAccion> {
  if (!esUuid(id)) return { error: ERROR_CAMBIO };

  const { supabase, empresa } = await empresaActual();
  if (!empresa) return { error: ERROR_CAMBIO };
  if (empresa.estado !== "verificado") return { error: SIN_VERIFICAR };

  const { data: original } = await supabase
    .from("ofertas")
    .select("titulo, descripcion, requisitos, jornada, categoria_id, prioridad, estado")
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (!original || !ESTADOS_COPIABLES.includes(original.estado)) return { error: ERROR_CAMBIO };

  const { titulo, descripcion, requisitos, jornada, categoria_id, prioridad } = original;
  const { data, error } = await supabase
    .from("ofertas")
    .insert({ titulo, descripcion, requisitos, jornada, categoria_id, prioridad, empresa_id: empresa.id })
    .select("id")
    .single();
  if (error) {
    console.error("usarComoBase failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidar();
  redirect(`/empresa/ofertas/${data.id}/editar`);
}
