"use client";

import { useState } from "react";
import { LoaderCircle, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOTIVO_RECHAZO } from "@/lib/validaciones/ofertas";

export type SugerenciaRechazo = { corto: string; texto: string };

type PropsFormularioRechazo = {
  /** What the person reads above the box: who sees the reason and what they can do. */
  ayuda: string;
  sugerencias: SugerenciaRechazo[];
  /** Text of the submit button, e.g. "Rechazar oferta". */
  confirmar: string;
  enCurso: boolean;
  onEnviar: (motivo: string) => void;
  onCancelar: () => void;
};

const BOTON = "h-11 px-5 text-base";

/**
 * The reason the Office writes when it rejects (an offer, a company): frequent
 * reasons as chips that fill the box, a length counter, and the button that
 * says what it does. Asking for the reason is the rejection's own step, so
 * there is no further confirmation (tutor review 2026-10-20).
 */
export function FormularioRechazo({ ayuda, sugerencias, confirmar, enCurso, onEnviar, onCancelar }: PropsFormularioRechazo) {
  const [motivo, setMotivo] = useState("");
  const largo = motivo.trim().length;

  return (
    <form
      className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 motion-safe:animate-in motion-safe:fade-in"
      onSubmit={(evento) => {
        evento.preventDefault();
        onEnviar(motivo);
      }}
    >
      <label htmlFor="motivo-rechazo" className="block font-semibold">
        ¿Por qué la rechazás?
      </label>
      <p className="text-sm text-muted-foreground">{ayuda}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Motivos frecuentes">
        {sugerencias.map((sugerencia) => (
          <li key={sugerencia.corto}>
            <button
              type="button"
              onClick={() => setMotivo(sugerencia.texto)}
              aria-pressed={motivo === sugerencia.texto}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                motivo === sugerencia.texto ? "border-destructive bg-destructive text-primary-foreground" : "border-border bg-card hover:border-destructive/50",
              )}
            >
              {sugerencia.corto}
            </button>
          </li>
        ))}
      </ul>
      <textarea
        id="motivo-rechazo"
        value={motivo}
        onChange={(evento) => setMotivo(evento.target.value)}
        rows={4}
        maxLength={MOTIVO_RECHAZO.maximo}
        required
        aria-required
        aria-describedby="motivo-ayuda"
        placeholder="Elegí un motivo frecuente o escribilo con tus palabras."
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
      />
      <p id="motivo-ayuda" className={cn("text-right text-xs", largo > 0 && largo < MOTIVO_RECHAZO.minimo ? "text-destructive" : "text-muted-foreground")}>
        {largo < MOTIVO_RECHAZO.minimo ? `Mínimo ${MOTIVO_RECHAZO.minimo} caracteres` : `${largo} / ${MOTIVO_RECHAZO.maximo}`}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={enCurso || largo < MOTIVO_RECHAZO.minimo} className={buttonVariants({ variant: "destructive", className: BOTON })}>
          {enCurso ? <LoaderCircle aria-hidden className="animate-spin" /> : <XCircle aria-hidden />}
          {confirmar}
        </button>
        <button type="button" disabled={enCurso} onClick={onCancelar} className={buttonVariants({ variant: "ghost", className: BOTON })}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
