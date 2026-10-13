"use server";

import { redirect } from "next/navigation";
import { borrarEmailPendiente, guardarEmailPendiente, leerEmailPendiente } from "@/lib/email-pendiente";
import { documentoOcupado } from "@/lib/registro";
import { createClient } from "@/lib/supabase/server";
import {
  CAMPOS_EMPRESA,
  CAMPOS_POSTULANTE,
  normalizarCampo,
  normalizarCodigo,
  validarCampos,
  type CampoEmpresa,
  type CampoPostulante,
  type Errores,
} from "@/lib/validaciones/auth";

/**
 * Server Actions for the public sign-up (Phase 3). Anyone may call them:
 * they validate every field again (the browser checks are only for UX),
 * and Postgres enforces formats, uniqueness and the starting statuses.
 */

export type EstadoRegistro<K extends string> = {
  errores: Errores<K>;
  mensaje: string | null;
};

export type EstadoCodigo = {
  error: string | null;
  aviso: string | null;
  confirmada: boolean;
  rol: "postulante" | "empresa" | null;
};

const ERROR_GENERICO = "No pudimos crear la cuenta. Probá de nuevo en unos minutos.";

/** Sign-up for job seekers. Redirects to the code step on success. */
export async function registrarPostulante(
  _previo: EstadoRegistro<CampoPostulante>,
  formData: FormData,
): Promise<EstadoRegistro<CampoPostulante>> {
  return crearCuenta("postulante", CAMPOS_POSTULANTE, formData);
}

/** Sign-up for companies; the company starts `pendiente` (Rule 3). */
export async function registrarEmpresa(
  _previo: EstadoRegistro<CampoEmpresa>,
  formData: FormData,
): Promise<EstadoRegistro<CampoEmpresa>> {
  return crearCuenta("empresa", CAMPOS_EMPRESA, formData);
}

async function crearCuenta<K extends CampoPostulante | CampoEmpresa>(
  rol: "postulante" | "empresa",
  campos: readonly K[],
  formData: FormData,
): Promise<EstadoRegistro<K>> {
  const valores: Partial<Record<K, string>> = {};
  for (const campo of campos) {
    const valor = formData.get(campo);
    valores[campo] = typeof valor === "string" ? valor : "";
  }

  const errores = validarCampos(campos, valores);
  if (Object.keys(errores).length > 0) {
    return { errores, mensaje: "Revisá los datos marcados." };
  }

  const datos = Object.fromEntries(
    campos.map((campo) => [campo, normalizarCampo(campo, valores[campo] ?? "")]),
  ) as Record<K, string>;
  const { email, contrasena, ...perfil } = datos as Record<string, string>;
  const tipoDocumento = rol === "postulante" ? "dni" : "cuit";

  try {
    if (await documentoOcupado(tipoDocumento, perfil[tipoDocumento])) {
      const error =
        tipoDocumento === "dni"
          ? "Ya existe una cuenta con este DNI. Si es tuya, ingresá con tu contraseña."
          : "Ya existe una cuenta con este CUIT. Si es de tu empresa, ingresá con su contraseña.";
      return { errores: { [tipoDocumento]: error } as Errores<K>, mensaje: null };
    }
  } catch (error) {
    console.error(error);
    return { errores: {}, mensaje: ERROR_GENERICO };
  }

  const supabase = await createClient();
  // The sign-up trigger turns this metadata into the postulantes/empresas row
  // (migration 20261013120000_registro_completo.sql)
  const { data, error } = await supabase.auth.signUp({
    email,
    password: contrasena,
    options: { data: { rol, ...perfil } },
  });

  if (error) {
    // Only the code: the payload may carry personal data (AGENTS.md §3)
    console.error("signUp failed:", error.code);
    return { errores: {}, mensaje: mensajeErrorAuth(error.code) };
  }

  // Supabase answers with a user without identities when the email is
  // already registered, to avoid revealing it to bots; we tell the person.
  if (data.user?.identities?.length === 0) {
    return {
      errores: { email: "Ya existe una cuenta con este email. Si es tuya, ingresá con tu contraseña." } as Errores<K>,
      mensaje: null,
    };
  }

  await guardarEmailPendiente("registro", email);
  redirect("/registro/verificar");
}

/**
 * Confirms the email with the code sent by Supabase. On success Supabase opens the
 * session (cookies set by the server client) and the account is ready.
 */
export async function verificarCodigo(_previo: EstadoCodigo, formData: FormData): Promise<EstadoCodigo> {
  const email = await leerEmailPendiente("registro");
  if (!email) {
    return { ...SIN_CAMBIOS, error: "Se venció el tiempo para confirmar. Volvé a crear la cuenta." };
  }

  const valor = formData.get("codigo");
  const codigo = typeof valor === "string" ? normalizarCodigo(valor) : null;
  if (!codigo) {
    return { ...SIN_CAMBIOS, error: "Ingresá el código completo, solo los números." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token: codigo, type: "email" });
  if (error || !data.user) {
    console.error("verifyOtp failed:", error?.code);
    return { ...SIN_CAMBIOS, error: mensajeErrorAuth(error?.code) };
  }

  await borrarEmailPendiente("registro");
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", data.user.id).maybeSingle();
  const rol = perfil?.rol === "postulante" || perfil?.rol === "empresa" ? perfil.rol : null;
  return { error: null, aviso: null, confirmada: true, rol };
}

/** Sends a new code to the pending email. Supabase allows one every 60 s. */
export async function reenviarCodigo(): Promise<EstadoCodigo> {
  const email = await leerEmailPendiente("registro");
  if (!email) {
    return { ...SIN_CAMBIOS, error: "Se venció el tiempo para confirmar. Volvé a crear la cuenta." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) {
    console.error("resend failed:", error.code);
    return { ...SIN_CAMBIOS, error: mensajeErrorAuth(error.code) };
  }
  return { ...SIN_CAMBIOS, aviso: "Te mandamos un código nuevo. Revisá también la carpeta de spam." };
}

const SIN_CAMBIOS: EstadoCodigo = { error: null, aviso: null, confirmada: false, rol: null };

/** Supabase Auth error codes → Spanish messages without internal details. */
function mensajeErrorAuth(codigo: string | undefined): string {
  switch (codigo) {
    case "otp_expired":
      return "El código no es correcto o ya venció. Revisalo o pedí uno nuevo.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Hiciste muchos intentos seguidos. Esperá un minuto y probá de nuevo.";
    case "weak_password":
      return "La contraseña es muy débil. Usá al menos 8 caracteres.";
    case "email_address_invalid":
      return "No podemos enviar mails a esa dirección. Revisá el email.";
    default:
      return ERROR_GENERICO;
  }
}
