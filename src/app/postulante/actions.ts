"use server";

import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { esUuid } from "@/lib/validaciones/ofertas";
import {
  CAMPOS_DATOS,
  normalizarCampo,
  validarCampos,
  type CampoDatos,
  type EstadoFormulario,
} from "@/lib/validaciones/auth";
import type { Enums } from "@/types/database";

/**
 * Server Actions of the job seeker area (Phase 4). Each one checks the role
 * first; RLS limits every query to the person's own rows, and the
 * postulantes trigger owns the address status rules (Rule 4).
 */

const ERROR_GUARDAR = "No pudimos guardar los cambios. Probá de nuevo en unos minutos.";

/** Updates the personal data. The DNI and the email are not editable here. */
export async function actualizarDatos(
  _previo: EstadoFormulario<CampoDatos>,
  formData: FormData,
): Promise<EstadoFormulario<CampoDatos>> {
  const { userId } = await requerirRol("postulante");

  const valores: Partial<Record<CampoDatos, string>> = {};
  for (const campo of CAMPOS_DATOS) {
    const valor = formData.get(campo);
    valores[campo] = typeof valor === "string" ? valor : "";
  }
  const errores = validarCampos(CAMPOS_DATOS, valores);
  if (Object.keys(errores).length > 0) return { errores, mensaje: "Revisá los datos marcados." };

  const datos = Object.fromEntries(
    CAMPOS_DATOS.map((campo) => [campo, normalizarCampo(campo, valores[campo] ?? "")]),
  ) as Record<CampoDatos, string>;

  const supabase = await createClient();
  const { data: anterior } = await supabase
    .from("postulantes")
    .select("localidad, direccion")
    .eq("perfil_id", userId)
    .maybeSingle();

  const { error } = await supabase
    .from("postulantes")
    // localidad was checked against LOCALIDADES by validarCampos
    .update({ ...datos, localidad: datos.localidad as Enums<"localidad"> })
    .eq("perfil_id", userId);
  if (error) {
    console.error("actualizarDatos failed:", error.code);
    return { errores: {}, mensaje: ERROR_GUARDAR };
  }

  revalidatePath("/postulante", "layout");
  const cambioDomicilio =
    anterior && (anterior.localidad !== datos.localidad || anterior.direccion !== datos.direccion);
  return {
    errores: {},
    mensaje: null,
    aviso:
      cambioDomicilio && datos.localidad === "funes"
        ? "Guardamos tus datos. Como cambiaste tu domicilio, la Oficina de Empleo lo va a revisar de nuevo."
        : "Guardamos tus datos.",
  };
}

export type EstadoRubros = { error: string | null; aviso: string | null };

/** Replaces the selected categories (Rule 5: as many as the person wants, at least one). */
export async function guardarRubros(_previo: EstadoRubros, formData: FormData): Promise<EstadoRubros> {
  const { userId } = await requerirRol("postulante");

  const elegidos = [...new Set(formData.getAll("categoria").filter((v): v is string => typeof v === "string"))];
  if (elegidos.length === 0) return { error: "Elegí al menos un rubro.", aviso: null };
  if (elegidos.length > 50 || !elegidos.every(esUuid)) return { error: "Algún rubro no es válido.", aviso: null };

  const supabase = await createClient();
  const { data: postulante } = await supabase.from("postulantes").select("id").eq("perfil_id", userId).maybeSingle();
  if (!postulante) return { error: ERROR_GUARDAR, aviso: null };

  const { data: actuales, error: errorLectura } = await supabase
    .from("postulante_categorias")
    .select("categoria_id")
    .eq("postulante_id", postulante.id);
  if (errorLectura) {
    console.error("guardarRubros read failed:", errorLectura.code);
    return { error: ERROR_GUARDAR, aviso: null };
  }

  const yaTiene = new Set(actuales.map((fila) => fila.categoria_id));
  const agregar = elegidos.filter((id) => !yaTiene.has(id));
  const quitar = [...yaTiene].filter((id) => !elegidos.includes(id));

  // Add first: a failure halfway never leaves the person with zero categories
  if (agregar.length > 0) {
    const { error } = await supabase
      .from("postulante_categorias")
      .insert(agregar.map((categoria_id) => ({ postulante_id: postulante.id, categoria_id })));
    if (error) {
      console.error("guardarRubros insert failed:", error.code);
      return { error: ERROR_GUARDAR, aviso: null };
    }
  }
  if (quitar.length > 0) {
    const { error } = await supabase
      .from("postulante_categorias")
      .delete()
      .eq("postulante_id", postulante.id)
      .in("categoria_id", quitar);
    if (error) {
      console.error("guardarRubros delete failed:", error.code);
      return { error: ERROR_GUARDAR, aviso: null };
    }
  }

  revalidatePath("/postulante", "layout");
  return { error: null, aviso: "Guardamos tus rubros." };
}
