"use client";

import { useState } from "react";
import { Info, LoaderCircle, Send, XCircle } from "lucide-react";
import { MOTIVOS_RECHAZO, SelectorMotivo } from "@/components/admin/SelectorMotivo";
import { buttonVariants } from "@/components/ui/button";
import type { usePreseleccion } from "@/hooks/usePreseleccion";
import type { MotivoRechazoPostulacion } from "@/lib/estados";
import { cn } from "@/lib/utils";

const BOTON = "h-11 px-5 text-base";

type PropsAccionesPreseleccion = {
  /** Pending applications the buttons act on (one in the candidate page, the chosen ones in the list). */
  ids: string[];
  acciones: ReturnType<typeof usePreseleccion>;
  /** Buttons side by side (the list's bar) or stacked (the candidate page's side card). */
  enFila?: boolean;
};

/**
 * Pre-select or reject (with its reason) one or several pending
 * applications. Both run on the first click (tutor review 2026-10-20): what
 * they do is said next to the buttons, and the reject button names the
 * reason it will apply ("Rechazar 2 · cupo completo").
 */
export function AccionesPreseleccion({ ids, acciones, enFila = false }: PropsAccionesPreseleccion) {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState<MotivoRechazoPostulacion | null>(null);
  const n = ids.length;
  const ocupado = acciones.enCurso !== null;
  const cantidad = n > 1 ? ` ${n}` : "";

  if (rechazando) {
    const textoMotivo = MOTIVOS_RECHAZO.find((m) => m.valor === motivo)?.texto.toLowerCase();
    return (
      <form
        className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 motion-safe:animate-in motion-safe:fade-in"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (motivo) acciones.rechazar(ids, motivo);
        }}
      >
        <SelectorMotivo nombre="motivo-postulacion" valor={motivo} onCambiar={setMotivo} />
        <div className={cn("flex flex-col gap-2", enFila && "sm:flex-row")}>
          <button type="submit" disabled={ocupado || !motivo} className={buttonVariants({ variant: "destructive", className: BOTON })}>
            {acciones.enCurso === "rechazar" ? <LoaderCircle aria-hidden className="animate-spin" /> : <XCircle aria-hidden />}
            Rechazar{cantidad}
            {textoMotivo && ` · ${textoMotivo}`}
          </button>
          <button type="button" disabled={ocupado} onClick={() => setRechazando(false)} className={buttonVariants({ variant: "ghost", className: BOTON })}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <div className={cn("flex flex-col gap-2", enFila && "sm:flex-row")}>
        <button
          type="button"
          disabled={ocupado || n === 0}
          aria-describedby="aviso-preseleccion"
          onClick={() => acciones.preseleccionar(ids)}
          className={buttonVariants({ className: cn(BOTON, "shadow-md shadow-primary/20 hover:bg-primary-hover") })}
        >
          {acciones.enCurso === "preseleccionar" ? <LoaderCircle aria-hidden className="animate-spin" /> : <Send aria-hidden />}
          Preseleccionar{cantidad}
        </button>
        <button
          type="button"
          disabled={ocupado || n === 0}
          onClick={() => setRechazando(true)}
          className={buttonVariants({ variant: "outline", className: cn(BOTON, "text-destructive hover:text-destructive") })}
        >
          <XCircle aria-hidden /> Rechazar{cantidad}
        </button>
      </div>
      {/* The one irreversible step for the Office: said before, not confirmed after */}
      <p id="aviso-preseleccion" className="flex gap-2 text-sm text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        {n > 1
          ? `La empresa va a ver a estas ${n} personas y desde ahí decide ella. No se puede deshacer.`
          : "La empresa va a ver a esta persona y desde ahí decide ella. No se puede deshacer."}
      </p>
    </div>
  );
}
