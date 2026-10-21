import Link from "next/link";
import { ArrowRight, Clock, RotateCcw, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { EstadoVerificacion } from "@/lib/estados";

/**
 * Notice for a company the Employment Office has not verified; nothing once
 * verified. A rejected one reads the Office's reason and how to fix it:
 * editing its data sends it back to review by itself (decision D1).
 */
export function AvisoEmpresaSinVerificar({ estado, motivo }: { estado: EstadoVerificacion; motivo: string | null }) {
  if (estado === "pendiente") {
    // Rule 3: a pending company can sign in but cannot post offers yet
    const corrigio = Boolean(motivo);
    return (
      <div className="flex gap-3 rounded-xl border border-border bg-secondary p-5 text-secondary-foreground">
        {corrigio ? <RotateCcw aria-hidden className="mt-0.5 size-5 shrink-0" /> : <Clock aria-hidden className="mt-0.5 size-5 shrink-0" />}
        <div>
          <p className="font-medium">{corrigio ? "Recibimos tus correcciones." : "Estamos revisando los datos de tu empresa."}</p>
          <p className="mt-1 text-sm">
            {corrigio
              ? "La Oficina de Empleo vuelve a revisar tu empresa. Cuando la verifique, vas a poder publicar ofertas."
              : "La Oficina de Empleo te va a habilitar para publicar ofertas cuando termine la verificación."}
          </p>
        </div>
      </div>
    );
  }
  if (estado === "rechazado") {
    return (
      <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="min-w-0 space-y-3">
          <div>
            <p className="font-medium text-destructive">No pudimos verificar los datos de tu empresa.</p>
            {motivo && (
              <p className="mt-2 text-sm">
                <span className="font-semibold">Motivo de la Oficina de Empleo:</span> <span className="whitespace-pre-line">{motivo}</span>
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">Corregí tus datos o subí la constancia de ARCA, y la Oficina vuelve a revisarla.</p>
          </div>
          <Link href="/empresa/datos#datos" className={buttonVariants({ className: "group h-10 px-4 hover:bg-primary-hover" })}>
            Corregir mis datos
            <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }
  return null;
}
