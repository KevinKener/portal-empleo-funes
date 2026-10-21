"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { marcarDecision } from "@/app/empresa/ofertas/[id]/candidatos/actions";
import { buttonVariants } from "@/components/ui/button";
import type { DecisionEmpresa } from "@/lib/estados";
import { cn } from "@/lib/utils";

type PropsDecisionCandidato = {
  ofertaId: string;
  postulacionId: string;
  decision: DecisionEmpresa | null;
  /** What "tomar" means at this stage: "Entrevistar" or "Contratar". */
  textoTomar: string;
};

/**
 * Draft decision on one candidate (Rule 11): saved right away, changeable,
 * and applied only when the company confirms the whole selection.
 * Tapping the chosen option again clears it.
 */
export function DecisionCandidato({ ofertaId, postulacionId, decision, textoTomar }: PropsDecisionCandidato) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [actual, setOptimista] = useOptimistic(decision);
  const [, iniciar] = useTransition();

  function elegir(opcion: DecisionEmpresa) {
    const nueva = actual === opcion ? null : opcion;
    setError(null);
    iniciar(async () => {
      setOptimista(nueva);
      const resultado = await marcarDecision(ofertaId, postulacionId, nueva);
      if (resultado.error) return setError(resultado.error);
      router.refresh();
    });
  }

  return (
    // data-elegido lets the whole card show the decision (TarjetaCandidato)
    <div className="space-y-2" data-elegido={actual ?? undefined}>
      <div role="group" aria-label="Tu decisión" className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={actual === "tomar"}
          onClick={() => elegir("tomar")}
          className={cn(
            buttonVariants({ variant: actual === "tomar" ? "default" : "outline", className: "h-11 text-base" }),
            actual === "tomar" && "hover:bg-primary-hover",
          )}
        >
          <Check aria-hidden /> {textoTomar}
        </button>
        <button
          type="button"
          aria-pressed={actual === "descartar"}
          onClick={() => elegir("descartar")}
          className={buttonVariants({ variant: actual === "descartar" ? "destructive" : "outline", className: "h-11 text-base" })}
        >
          <X aria-hidden /> Descartar
        </button>
      </div>
      {actual && (
        <p className="text-xs text-muted-foreground motion-safe:animate-in motion-safe:fade-in">
          {actual === "tomar" ? `Marcado para ${textoTomar.toLowerCase()}.` : "Marcado para descartar."} Se aplica cuando confirmes la
          selección; tocá de nuevo para quitarlo.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
