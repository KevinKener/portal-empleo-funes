import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CuentaConfirmada } from "@/components/auth/CuentaConfirmada";
import { FormularioCodigo } from "@/components/auth/FormularioCodigo";
import { leerEmailPendiente } from "@/lib/email-pendiente";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Confirmá tu cuenta" };

/**
 * Code step after sign-up. Once the code is accepted the pending email is
 * gone and a session exists, so the page shows the success state; with
 * neither there is nothing to confirm.
 */
export default async function VerificarPage() {
  const email = await leerEmailPendiente("registro");
  if (email) return <FormularioCodigo email={email} />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/registro");

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).maybeSingle();
  const rol = perfil?.rol === "postulante" || perfil?.rol === "empresa" ? perfil.rol : null;
  return <CuentaConfirmada rol={rol} />;
}
