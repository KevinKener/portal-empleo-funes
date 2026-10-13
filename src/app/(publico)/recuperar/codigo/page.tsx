import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioNuevaContrasena } from "@/components/auth/FormularioNuevaContrasena";
import { leerEmailPendiente } from "@/lib/email-pendiente";

export const metadata: Metadata = { title: "Contraseña nueva" };

/** Password recovery, step 2. Without a pending request there is no code to check. */
export default async function RecuperarCodigoPage() {
  if (!(await leerEmailPendiente("recuperar"))) redirect("/recuperar");
  return <FormularioNuevaContrasena />;
}
