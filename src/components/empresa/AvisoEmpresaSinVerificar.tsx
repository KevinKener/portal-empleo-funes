import { Clock } from "lucide-react";
import type { EstadoVerificacion } from "@/lib/estados";

/** Notice for a company the Employment Office has not verified; nothing once verified. */
export function AvisoEmpresaSinVerificar({ estado }: { estado: EstadoVerificacion }) {
  if (estado === "pendiente") {
    // Rule 3: a pending company can sign in but cannot post offers yet
    return (
      <div className="flex gap-3 rounded-xl border border-border bg-secondary p-5 text-secondary-foreground">
        <Clock aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">Estamos revisando los datos de tu empresa.</p>
          <p className="mt-1 text-sm">
            La Oficina de Empleo te va a habilitar para publicar ofertas cuando termine la verificación.
          </p>
        </div>
      </div>
    );
  }
  if (estado === "rechazado") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-destructive">
        <p className="font-medium">No pudimos verificar los datos de tu empresa.</p>
        <p className="mt-1 text-sm">Comunicate con la Oficina de Empleo de la Municipalidad de Funes.</p>
      </div>
    );
  }
  return null;
}
