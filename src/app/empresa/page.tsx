import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi empresa" };

/** Company home. Offers and candidates arrive in Phase 5. */
export default async function EmpresaPage() {
  const supabase = await createClient();
  // RLS returns only the signed-in company's own row
  const { data: empresa } = await supabase.from("empresas").select("nombre_comercial, estado").maybeSingle();

  return (
    <PanelBienvenida
      saludo={empresa ? `¡Hola, ${empresa.nombre_comercial}!` : "¡Hola!"}
      descripcion="Desde acá vas a poder publicar ofertas y ver los candidatos que te preselecciona la Oficina de Empleo."
    >
      {empresa?.estado === "pendiente" && (
        // Rule 3: a pending company can sign in but cannot post offers yet
        <div className="flex gap-3 rounded-xl border border-border bg-secondary p-5 text-secondary-foreground">
          <Clock aria-hidden className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Estamos revisando los datos de tu empresa.</p>
            <p className="mt-1 text-sm">
              La Oficina de Empleo te va a habilitar para publicar ofertas cuando termine la verificación.
            </p>
          </div>
        </div>
      )}
      {empresa?.estado === "rechazado" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-destructive">
          <p className="font-medium">No pudimos verificar los datos de tu empresa.</p>
          <p className="mt-1 text-sm">Comunicate con la Oficina de Empleo de la Municipalidad de Funes.</p>
        </div>
      )}
    </PanelBienvenida>
  );
}
