"use server";

import { redirect } from "next/navigation";
import { destinoTrasIngresar } from "@/lib/auth";
import { emailParaIngresar } from "@/lib/ingreso";
import { guardarEmailPendiente } from "@/lib/email-pendiente";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign-in and sign-out Server Actions (Phase 3). Anyone may call them.
 * Every failure gives the same message, so the form never reveals whether
 * a DNI, CUIT or email has an account.
 */

export type EstadoIngreso = { error: string | null };

const CREDENCIALES_INVALIDAS = "El DNI, CUIT o email no coincide con la contraseña. Revisalos y probá de nuevo.";

/** Signs in with DNI, CUIT or email plus password; redirects on success. */
export async function ingresar(_previo: EstadoIngreso, formData: FormData): Promise<EstadoIngreso> {
  const identificador = formData.get("identificador");
  const contrasena = formData.get("contrasena");
  const siguiente = formData.get("siguiente");
  if (typeof identificador !== "string" || typeof contrasena !== "string" || !identificador.trim() || !contrasena) {
    return { error: "Completá tu DNI, CUIT o email y tu contraseña." };
  }
  if (identificador.length > 254 || contrasena.length > 72) {
    return { error: CREDENCIALES_INVALIDAS };
  }

  let email: string | null;
  try {
    email = await emailParaIngresar(identificador);
  } catch (error) {
    console.error(error);
    return { error: "No pudimos ingresar. Probá de nuevo en unos minutos." };
  }
  if (!email) return { error: CREDENCIALES_INVALIDAS };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: contrasena });

  if (error?.code === "email_not_confirmed") {
    // Right password but the code step was never finished: send a fresh code
    // and take the person back to it instead of a dead end.
    await supabase.auth.resend({ type: "signup", email });
    await guardarEmailPendiente("registro", email);
    redirect("/registro/verificar");
  }
  if (error?.code === "over_request_rate_limit") {
    return { error: "Hiciste muchos intentos seguidos. Esperá unos minutos y probá de nuevo." };
  }
  if (error || !data.user) {
    if (error && error.code !== "invalid_credentials") console.error("signIn failed:", error.code);
    return { error: CREDENCIALES_INVALIDAS };
  }

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", data.user.id).maybeSingle();
  if (!perfil) {
    // An auth user without a profile has no area (e.g. seed Admin not promoted yet)
    await supabase.auth.signOut();
    return { error: "Tu cuenta todavía no está habilitada. Comunicate con la Oficina de Empleo." };
  }

  redirect(destinoTrasIngresar(typeof siguiente === "string" ? siguiente : null, perfil.rol));
}

/** Signs out and goes back to the landing page. */
export async function salir(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
