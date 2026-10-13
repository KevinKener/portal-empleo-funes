import type { FormEvent, ReactNode, RefObject } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PropsMarcoPasos = {
  paso: number;
  total: number;
  titulo: string;
  direccion: "adelante" | "atras";
  tituloRef: RefObject<HTMLHeadingElement | null>;
  mensaje: string | null;
  enviando: boolean;
  esUltimo: boolean;
  textoEnviar: string;
  onAnterior: () => void;
  onEnviar: (evento: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

/**
 * Shell of a multi-step form: honest "Paso X de N" progress, the step's
 * fields sliding in from the side they come from, and back/next buttons.
 * Animations only run with motion-safe (prefers-reduced-motion respected).
 */
export function MarcoPasos({
  paso,
  total,
  titulo,
  direccion,
  tituloRef,
  mensaje,
  enviando,
  esUltimo,
  textoEnviar,
  onAnterior,
  onEnviar,
  children,
}: PropsMarcoPasos) {
  return (
    <form onSubmit={onEnviar} noValidate className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Paso {paso + 1} de {total}
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-muted transition-colors duration-500",
                i <= paso && "bg-primary",
              )}
            />
          ))}
        </div>
      </div>

      {mensaje && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in"
        >
          {mensaje}
        </p>
      )}

      {/* key remounts the step so its entrance animation plays on every change */}
      <fieldset
        key={paso}
        className={cn(
          "space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
          direccion === "adelante" ? "motion-safe:slide-in-from-right-6" : "motion-safe:slide-in-from-left-6",
        )}
      >
        <legend className="sr-only">{titulo}</legend>
        <h2 ref={tituloRef} tabIndex={-1} className="font-heading text-xl font-semibold outline-none">
          {titulo}
        </h2>
        {children}
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {paso > 0 ? (
          <button
            type="button"
            onClick={onAnterior}
            disabled={enviando}
            className={buttonVariants({ variant: "outline", className: "h-11 px-5 text-base" })}
          >
            <ArrowLeft aria-hidden />
            Volver
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}
        <button
          type="submit"
          disabled={enviando}
          className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}
        >
          {enviando && <LoaderCircle aria-hidden className="animate-spin motion-reduce:animate-[spin_3s_linear_infinite]" />}
          {esUltimo ? (enviando ? "Creando cuenta…" : textoEnviar) : "Siguiente"}
        </button>
      </div>
    </form>
  );
}
