import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { ESTADO_POSTULACION_PARA_POSTULANTE } from "@/lib/formato";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

const PASOS = ["pendiente", "preseleccionado", "entrevista", "contratado"] as const;

/**
 * Status tracker of an active application ("pizza tracker"). Full: numbered
 * steps with labels, vertical on phones and horizontal from sm. Compact (panel):
 * a full-width track of dots; the card shows the current step's name.
 * Rejected applications don't use it: they show a message instead.
 */
export function SeguimientoPostulacion({ estado, compacto = false }: { estado: Enums<"estado_postulacion">; compacto?: boolean }) {
  const actual = PASOS.indexOf(estado as (typeof PASOS)[number]);

  if (compacto) {
    // Full-width track: dots joined by segments that fill up to the current step
    return (
      <ol className="flex items-center" aria-label="Estado de la postulación">
        {PASOS.map((paso, i) => (
          <li key={paso} className={cn("flex items-center", i < PASOS.length - 1 && "flex-1")}>
            <span
              aria-hidden
              className={cn(
                "relative size-3.5 shrink-0 rounded-full border-2 transition-colors",
                i < actual && "border-primary bg-primary",
                i === actual && "border-primary bg-card",
                i > actual && "border-border bg-card",
              )}
            >
              {i === actual && <span className="absolute -inset-1.5 rounded-full bg-primary/25 motion-safe:animate-resplandor" />}
            </span>
            {i < PASOS.length - 1 && (
              <span aria-hidden className="mx-1 h-1 flex-1 overflow-hidden rounded-full bg-border">
                {i < actual && (
                  <span
                    className="block size-full origin-left rounded-full bg-primary motion-safe:animate-llenar-x"
                    style={{ "--retraso": `${200 + i * 250}ms` } as CSSProperties}
                  />
                )}
              </span>
            )}
            <span className="sr-only">
              {ESTADO_POSTULACION_PARA_POSTULANTE[paso].titulo}
              {i < actual ? " (hecho)" : i === actual ? " (estado actual)" : ""}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  // Each segment fills after the previous one, up to the current step
  const retraso = (i: number) => ({ "--retraso": `${150 + i * 280}ms` }) as CSSProperties;

  return (
    <ol className="flex flex-col gap-5 sm:flex-row sm:gap-0" aria-label="Estado de la postulación">
      {PASOS.map((paso, i) => {
        const hecho = i < actual;
        const enCurso = i === actual;
        return (
          <li key={paso} className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
            {i < PASOS.length - 1 && (
              <span
                aria-hidden
                className="absolute top-8 -bottom-4 left-3.5 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border sm:top-3.5 sm:right-[calc(-50%+1.25rem)] sm:bottom-auto sm:left-[calc(50%+1.25rem)] sm:h-0.5 sm:w-auto sm:translate-x-0 sm:-translate-y-1/2"
              >
                {hecho && (
                  <span
                    className="block size-full origin-top bg-primary motion-safe:animate-llenar-y sm:origin-left sm:motion-safe:animate-llenar-x"
                    style={retraso(i)}
                  />
                )}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                hecho && "border-primary bg-primary text-primary-foreground motion-safe:animate-festejo-pop",
                enCurso && "border-primary bg-card text-primary",
                !hecho && !enCurso && "border-border bg-card text-muted-foreground",
              )}
              style={hecho ? { animationDelay: `${Math.max(0, i * 280 - 100)}ms` } : undefined}
            >
              {enCurso && <span className="absolute -inset-1 rounded-full border-2 border-primary/40 motion-safe:animate-ping" />}
              {hecho ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-sm", enCurso ? "font-semibold text-primary" : hecho ? "" : "text-muted-foreground")}>
              {ESTADO_POSTULACION_PARA_POSTULANTE[paso].titulo}
              {enCurso && <span className="sr-only"> (estado actual)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
