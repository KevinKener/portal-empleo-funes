"use server";

import { redirect } from "next/navigation";
import { AREA_POR_ROL } from "@/lib/auth";
import { borrarEmailPendiente, guardarEmailPendiente, leerEmailPendiente } from "@/lib/email-pendiente";
import { emailParaIngresar } from "@/lib/ingreso";
import { createClient } from "@/lib/supabase/server";
import { normalizarCodigo, validarCampo } from "@/lib/validaciones/auth";

/**
 * Password recovery with an emailed code (Phase 3). Anyone may call these.
 * The answers never reveal whether a DNI, CUIT or email has an account:
 * the flow always moves on to the code step and the email is never shown.
 */

export type EstadoRecuperacion = { error: string | null; aviso: string | null };

// Stored instead of an email when the identifier matched no account, so the
// code step looks the same either way.
const SIN_CUENTA = "sin-cuenta";
const CODIGO_INVALIDO = "El código no es correcto o ya venció. Revisalo o pedí uno nuevo.";
const SIN_PEDIDO = "Se venció el tiempo para cambiar la contraseña. Pedí un código nuevo.";

/** Step 1: sends a recovery code to the account's email, if there is one. */
export async function pedirCodigo(_previo: EstadoRecuperacion, formData: FormData): Promise<EstadoRecuperacion> {
  const identificador = formData.get("identificador");
  if (typeof identificador !== "string" || !identificador.trim() || identificador.length > 254) {
    return { error: "Completá tu DNI, CUIT o email.", aviso: null };
  }

  let email: string | null;
  try {
    email = await emailParaIngresar(identificador);
  } catch (error) {
    console.error(error);
    return { error: "No pudimos enviar el código. Probá de nuevo en unos minutos.", aviso: null };
  }

  if (email) await enviarCodigo(email);
  await guardarEmailPendiente("recuperar", email ?? SIN_CUENTA);
  redirect("/recuperar/codigo");
}

/** Step 2: checks the code and saves the new password, then opens the person's area. */
export async function cambiarContrasena(
  _previo: EstadoRecuperacion,
  formData: FormData,
): Promise<EstadoRecuperacion> {
  const email = await leerEmailPendiente("recuperar");
  if (!email) return { error: SIN_PEDIDO, aviso: null };

  const valorCodigo = formData.get("codigo");
  const contrasena = formData.get("contrasena");
  const codigo = typeof valorCodigo === "string" ? normalizarCodigo(valorCodigo) : null;
  if (!codigo) return { error: "Ingresá el código completo, solo los números.", aviso: null };
  if (typeof contrasena !== "string") return { error: "Creá una contraseña nueva.", aviso: null };
  const errorContrasena = validarCampo("contrasena", contrasena);
  if (errorContrasena) return { error: errorContrasena, aviso: null };
  if (email === SIN_CUENTA) return { error: CODIGO_INVALIDO, aviso: null };

  const supabase = await createClient();
  // A previous attempt may have accepted the code (it opens a session) and
  // then failed to save the password; the code is single-use, so reuse it.
  const { data: actual } = await supabase.auth.getUser();
  if (actual.user?.email !== email) {
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: "recovery" });
    if (error) {
      console.error("verifyOtp recovery failed:", error.code);
      return { error: CODIGO_INVALIDO, aviso: null };
    }
  }

  const { data, error } = await supabase.auth.updateUser({ password: contrasena });
  if (error || !data.user) {
    if (error?.code === "same_password") {
      return { error: "La contraseña nueva tiene que ser distinta de la anterior.", aviso: null };
    }
    console.error("updateUser failed:", error?.code);
    return { error: "No pudimos guardar la contraseña. Probá de nuevo.", aviso: null };
  }

  await borrarEmailPendiente("recuperar");
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", data.user.id).maybeSingle();
  redirect(perfil ? AREA_POR_ROL[perfil.rol] : "/");
}

/** Sends another code. Same answer whether or not the account exists. */
export async function reenviarCodigoRecuperacion(): Promise<EstadoRecuperacion> {
  const email = await leerEmailPendiente("recuperar");
  if (!email) return { error: SIN_PEDIDO, aviso: null };
  if (email !== SIN_CUENTA) await enviarCodigo(email);
  return { error: null, aviso: "Si hay una cuenta, te mandamos un código nuevo. Revisá también la carpeta de spam." };
}

// Errors are only logged: telling the person (e.g. "too many requests")
// would reveal that the account exists.
async function enviarCodigo(email: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) console.error("resetPasswordForEmail failed:", error.code);
}
