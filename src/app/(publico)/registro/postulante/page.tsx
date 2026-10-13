import type { Metadata } from "next";
import { FormularioPostulante } from "@/components/auth/FormularioPostulante";
import { VolverAOpciones } from "@/components/auth/VolverAOpciones";

export const metadata: Metadata = { title: "Crear cuenta de postulante" };

/** Job seeker sign-up (Phase 3). */
export default function RegistroPostulantePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <VolverAOpciones />
        <h1 className="font-heading text-2xl font-bold">Crear cuenta para buscar trabajo</h1>
        <p className="text-muted-foreground">Te lleva unos 3 minutos. Tené tu DNI a mano.</p>
      </div>
      <FormularioPostulante />
    </div>
  );
}
