import type { Metadata } from "next";
import { FormularioPedirCodigo } from "@/components/auth/FormularioPedirCodigo";

export const metadata: Metadata = { title: "Recuperar contraseña" };

/** Password recovery, step 1. */
export default function RecuperarPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-muted-foreground">Te mandamos un código por email para que crees una contraseña nueva.</p>
      </div>
      <FormularioPedirCodigo />
    </div>
  );
}
