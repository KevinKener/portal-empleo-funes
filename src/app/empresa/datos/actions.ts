"use server";

import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  CAMPOS_DATOS_EMPRESA,
  normalizarCampo,
  validarCampos,
  type CampoDatosEmpresa,
  type EstadoFormulario,
} from "@/lib/validaciones/auth";

const ERROR_GUARDAR = "No pudimos guardar los cambios. Probá de nuevo en unos minutos.";

/**
 * Updates the signed-in company's data. CUIT and email are never editable
 * here; razon_social only until the company is verified (the
 * validar_cambios_empresa trigger enforces both, 20261020130000_datos_empresa.sql).
 */
export async function actualizarDatosEmpresa(
  _previo: EstadoFormulario<CampoDatosEmpresa>,
  formData: FormData,
): Promise<EstadoFormulario<CampoDatosEmpresa>> {
  const { userId } = await requerirRol("empresa");
  const supabase = await createClient();
  const { data: empresa } = await supabase.from("empresas").select("id, estado").eq("perfil_id", userId).maybeSingle();
  if (!empresa) return { errores: {}, mensaje: ERROR_GUARDAR };

  // A verified company's legal name is fixed, so it is not even read from the form.
  const campos = CAMPOS_DATOS_EMPRESA.filter((c) => c !== "razon_social" || empresa.estado !== "verificado");
  const valores: Partial<Record<CampoDatosEmpresa, string>> = {};
  for (const campo of campos) {
    const valor = formData.get(campo);
    valores[campo] = typeof valor === "string" ? valor : "";
  }
  const errores = validarCampos(campos, valores);
  if (Object.keys(errores).length > 0) return { errores, mensaje: "Revisá los datos marcados." };

  const datos: Partial<Record<CampoDatosEmpresa, string>> = Object.fromEntries(
    campos.map((campo) => [campo, normalizarCampo(campo, valores[campo] ?? "")]),
  );
  const { error } = await supabase.from("empresas").update(datos).eq("id", empresa.id);
  if (error) {
    console.error("actualizarDatosEmpresa failed:", error.code);
    return { errores: {}, mensaje: ERROR_GUARDAR };
  }

  revalidatePath("/empresa", "layout");
  // The trade name shows on published offers.
  revalidatePath("/ofertas");
  return { errores: {}, mensaje: null, aviso: "Guardamos los datos de tu empresa." };
}
