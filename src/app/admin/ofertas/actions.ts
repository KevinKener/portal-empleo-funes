"use server";

import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { CIERRE, diasParaCierre } from "@/lib/cierre-oferta";
import { ahora } from "@/lib/formato";
import { puedeCambiarEstado, type EstadoOferta } from "@/lib/estados";
import { createClient } from "@/lib/supabase/server";
import { esUuid, MOTIVO_RECHAZO } from "@/lib/validaciones/ofertas";

/**
 * Server Actions of the Office over offers (branch B). Each one checks the
 * Admin role and validates; RLS and the validar_cambios_oferta trigger are
 * the real authority (Rule 2: only the Admin publishes or rejects, and a
 * rejection always carries a reason).
 */

export type ResultadoRevision = { error: string | null };

const ERROR_CAMBIO = "No pudimos hacer el cambio. Recargá la página y probá de nuevo.";

function revalidar() {
  revalidatePath("/admin", "layout");
  // Publishing or closing changes the public portal and the company's area
  revalidatePath("/", "layout");
}

/** Moves an offer from the status the screen showed to `hacia`, with extra columns (the reason). */
async function mover(id: string, hacia: EstadoOferta, extra: { motivo_rechazo?: string } = {}): Promise<ResultadoRevision> {
  if (!esUuid(id)) return { error: ERROR_CAMBIO };
  await requerirRol("admin");
  const supabase = await createClient();

  const { data: oferta } = await supabase.from("ofertas").select("estado").eq("id", id).maybeSingle();
  if (!oferta || !puedeCambiarEstado("oferta", oferta.estado, hacia, "admin")) {
    return { error: "Esta oferta cambió mientras la mirabas. Recargá la página para ver cómo quedó." };
  }

  // Filtering by the status just read avoids acting on a stale screen (e.g. the company took it back)
  const { data, error } = await supabase
    .from("ofertas")
    .update({ estado: hacia, ...extra })
    .eq("id", id)
    .eq("estado", oferta.estado)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("revision de oferta failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidar();
  return { error: null };
}

/** Publishes a pending offer: it shows on the portal and the trigger stamps fecha_publicacion. */
export async function publicarOferta(id: string): Promise<ResultadoRevision> {
  return mover(id, "publicada");
}

/** Rejects a pending offer with the reason the company will read next to "Usar como base". */
export async function rechazarOferta(id: string, motivo: string): Promise<ResultadoRevision> {
  const texto = typeof motivo === "string" ? motivo.trim() : "";
  if (texto.length < MOTIVO_RECHAZO.minimo) {
    return { error: `Escribí el motivo para la empresa (al menos ${MOTIVO_RECHAZO.minimo} caracteres), así sabe qué corregir.` };
  }
  if (texto.length > MOTIVO_RECHAZO.maximo) return { error: `El motivo puede tener hasta ${MOTIVO_RECHAZO.maximo} caracteres.` };
  return mover(id, "rechazada", { motivo_rechazo: texto });
}

/** Closes a published offer: it leaves the portal and takes no more applications. */
export async function cerrarOferta(id: string): Promise<ResultadoRevision> {
  return mover(id, "cerrada");
}

/**
 * Switches the priority of a pending or published offer, e.g. when a company
 * marks every offer as urgent (docs/research/admin.md §4.8).
 */
export async function cambiarPrioridad(id: string, urgente: boolean): Promise<ResultadoRevision> {
  if (!esUuid(id) || typeof urgente !== "boolean") return { error: ERROR_CAMBIO };
  await requerirRol("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ofertas")
    .update({ prioridad: urgente ? "urgente" : "normal" })
    .eq("id", id)
    .in("estado", ["pendiente", "publicada"])
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("cambiarPrioridad failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidar();
  return { error: null };
}

/**
 * Moves the closing date of a published offer, also once expired ("reabrirla"):
 * from today up to CIERRE.maximo days ahead. Only the Office does it
 * (decision 2026-10-21); the trigger checks the same window.
 */
export async function extenderOferta(id: string, fechaCierre: string): Promise<ResultadoRevision> {
  if (!esUuid(id) || typeof fechaCierre !== "string") return { error: ERROR_CAMBIO };
  const momento = ahora();
  const dias = /^\d{4}-\d{2}-\d{2}$/.test(fechaCierre) ? diasParaCierre(fechaCierre, momento) : Number.NaN;
  if (!(dias >= 0 && dias <= CIERRE.maximo)) return { error: `Elegí una fecha entre hoy y los próximos ${CIERRE.maximo} días.` };
  await requerirRol("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ofertas")
    .update({ fecha_cierre: fechaCierre })
    .eq("id", id)
    .eq("estado", "publicada")
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("extenderOferta failed:", error.code);
    return { error: ERROR_CAMBIO };
  }

  revalidar();
  return { error: null };
}
