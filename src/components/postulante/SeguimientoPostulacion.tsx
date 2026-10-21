import type { CSSProperties } from "react";
import { Check, MessagesSquare, PartyPopper, Send, UserCheck, type LucideIcon } from "lucide-react";
import { ESTADO_POSTULACION_PARA_POSTULANTE } from "@/lib/formato";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

const PASOS = ["pendiente", "preseleccionado", "entrevista", "contratado"] as const;

const ICONOS: Record<(typeof PASOS)[number], LucideIcon> = {
  pendiente: Send,
  preseleccionado: UserCheck,
  entrevista: MessagesSquare,
  contratado: PartyPopper,
};

/**
 * Status tracker of an active application ("pizza tracker"). Full: one icon
 * per step with its name, vertical on phones and horizontal from sm. Compact (panel):
 * one icon per step, names from sm, and the current stretch animated.
 * Rejected applications don't use it: they show a message instead.
 */
export function SeguimientoPostulacion({ estado, compacto = false }: { estado: Enums<"estado_postulacion">; compacto?: boolean }) {
  const actual = PASOS.indexOf(estado as (typeof PASOS)[number]);

  if (compacto) {
    // Four steps with their icon and (from sm) their name; the stretch after the current step
    // shows moving dashes, so the card reads "esto está avanzando", not just "un punto"
    return (
      <ol className="grid grid-cols-4" aria-label="Estado de la postulación">
        {PASOS.map((paso, i) => {
          const hecho = i < actual;
          const enCurso = i === actual;
          const Icono = ICONOS[paso];
          return (
            <li key={paso} className="relative flex flex-col items-center gap-1.5">
              {i < PASOS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-3 right-[calc(-50%+1rem)] left-[calc(50%+1rem)] h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border"
                >
                  {hecho && (
                    <span
                      className="block size-full origin-left rounded-full bg-primary motion-safe:animate-llenar-x"
                      style={{ "--retraso": `${200 + i * 250}ms` } as CSSProperties}
                    />
                  )}
                  {enCurso && <span className="block size-full tramo-en-curso" />}
                </span>
              )}
              <span
                aria-hidden
                className={cn(
                  "relative flex size-6 items-center justify-center rounded-full",
                  hecho && "bg-primary text-primary-foreground motion-safe:animate-festejo-pop",
                  enCurso && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                  !hecho && !enCurso && "border-2 border-border bg-card text-muted-foreground/70",
                )}
                style={hecho ? { animationDelay: `${i * 250}ms` } : undefined}
              >
                {enCurso && <span className="absolute -inset-1.5 rounded-full bg-primary/25 motion-safe:animate-resplandor" />}
                {hecho ? <Check className="relative size-3.5" /> : <Icono className="relative size-3" />}
              </span>
              <span
                className={cn(
                  "hidden text-center text-[0.6875rem] leading-tight sm:block",
                  enCurso ? "font-semibold text-primary" : hecho ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {ESTADO_POSTULACION_PARA_POSTULANTE[paso].titulo}
              </span>
              <span className="sr-only">
                {ESTADO_POSTULACION_PARA_POSTULANTE[paso].titulo}
                {hecho ? " (hecho)" : enCurso ? " (estado actual)" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  // Each segment fills after the previous one, up to the current step
  const retraso = (i: number) => ({ "--retraso": `${150 + i * 280}ms` }) as CSSProperties;

  return (
    <ol className="flex flex-col gap-6 sm:flex-row sm:gap-0" aria-label="Estado de la postulación">
      {PASOS.map((paso, i) => {
        const hecho = i < actual;
        const enCurso = i === actual;
        const Icono = ICONOS[paso];
        return (
          <li key={paso} className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
            {i < PASOS.length - 1 && (
              <span
                aria-hidden
                className="absolute top-10 -bottom-5 left-4 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-border sm:top-4 sm:right-[calc(-50%+1.5rem)] sm:bottom-auto sm:left-[calc(50%+1.5rem)] sm:h-1 sm:w-auto sm:translate-x-0 sm:-translate-y-1/2"
              >
                {hecho && (
                  <span
                    className="block size-full origin-top rounded-full bg-primary motion-safe:animate-llenar-y sm:origin-left sm:motion-safe:animate-llenar-x"
                    style={retraso(i)}
                  />
                )}
                {/* The stretch being worked on now: moving dashes towards the next step */}
                {enCurso && <span className="block size-full tramo-en-curso-y sm:tramo-en-curso" />}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                hecho && "bg-primary text-primary-foreground motion-safe:animate-festejo-pop",
                enCurso && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                !hecho && !enCurso && "border-2 border-border bg-card text-muted-foreground/70",
              )}
              style={hecho ? { animationDelay: `${Math.max(0, i * 280 - 100)}ms` } : undefined}
            >
              {enCurso && <span className="absolute -inset-2 rounded-full bg-primary/20 motion-safe:animate-resplandor" />}
              {hecho ? <Check className="relative size-4" /> : <Icono className="relative size-4" />}
            </span>
            <span className={cn("text-sm", enCurso ? "font-semibold text-primary" : hecho ? "text-foreground" : "text-muted-foreground")}>
              {ESTADO_POSTULACION_PARA_POSTULANTE[paso].titulo}
              {enCurso && <span className="sr-only"> (estado actual)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
