import type { Metadata } from "next";
import { FormularioEmpresa } from "@/components/auth/FormularioEmpresa";
import { VolverAOpciones } from "@/components/auth/VolverAOpciones";

export const metadata: Metadata = { title: "Crear cuenta de empresa" };

/** Company sign-up (Phase 3). The company starts pending review (Rule 3). */
export default function RegistroEmpresaPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <VolverAOpciones />
        <h1 className="font-heading text-2xl font-bold">Crear cuenta de empresa</h1>
        <p className="text-muted-foreground">
          La Oficina de Empleo revisa cada empresa antes de que pueda publicar ofertas. Tené el CUIT a mano.
        </p>
      </div>
      <FormularioEmpresa />
    </div>
  );
}
