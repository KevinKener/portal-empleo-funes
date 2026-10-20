import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// 44px tall and 16px text: thumb-sized, and iOS does not zoom on focus.
export const ESTILO_CONTROL =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 pr-10 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50";

// Multi-line text: same look as the inputs, grows with the content.
export const ESTILO_AREA =
  "min-h-28 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground transition-colors outline-none field-sizing-content placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export type PropsControl = {
  id: string;
  name: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  className: string;
};

/**
 * Red asterisk for required fields (tutor review 2026-10-20). Screen readers
 * get "obligatorio" from aria-required on the control instead.
 */
export function MarcaRequerido() {
  return (
    <span aria-hidden className="ml-0.5 text-destructive">
      *
    </span>
  );
}

type PropsCampo = {
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  valido?: boolean;
  /** Shows the red asterisk and sets aria-required. */
  requerido?: boolean;
  /** Receives the props that tie the control to its label, hint and error. */
  children: (control: PropsControl) => ReactNode;
};

/**
 * Label above the control, optional hint, inline error and a check mark on
 * valid values (positive validation). Errors fade in, unless the person
 * asked the system for reduced motion.
 */
export function Campo({ nombre, etiqueta, ayuda, error, valido, requerido = false, children }: PropsCampo) {
  const idAyuda = ayuda ? `${nombre}-ayuda` : undefined;
  const idError = error ? `${nombre}-error` : undefined;
  const descripcion = [idError, idAyuda].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={nombre} className="block text-sm font-medium text-foreground">
        {etiqueta}
        {requerido && <MarcaRequerido />}
      </label>
      <div className="relative">
        {children({
          id: nombre,
          name: nombre,
          "aria-invalid": Boolean(error),
          "aria-describedby": descripcion,
          "aria-required": requerido || undefined,
          className: ESTILO_CONTROL,
        })}
        {valido && (
          <CircleCheck
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-primary motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in"
          />
        )}
      </div>
      {error && (
        <p
          id={idError}
          className={cn(
            "text-sm text-destructive",
            "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1",
          )}
        >
          {error}
        </p>
      )}
      {ayuda && (
        <p id={idAyuda} className="text-sm text-muted-foreground">
          {ayuda}
        </p>
      )}
    </div>
  );
}
