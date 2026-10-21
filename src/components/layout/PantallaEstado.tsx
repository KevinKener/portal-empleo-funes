import type { ReactNode } from "react";
import { FondoMarca } from "@/components/layout/FondoMarca";

/** Shared look of the action buttons below a PantallaEstado. */
export const BOTON_PRINCIPAL =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-[background-color,transform] hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98]";
export const BOTON_SECUNDARIO =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 font-semibold transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Not found and error screens with the portal's look: a green band with the
 * moving brand background, a friendly message in plain words and clear ways
 * out. `tono` only changes the icon's colour (errors in red, never the band).
 */
export function PantallaEstado({
  icono,
  titulo,
  texto,
  acciones,
  tono = "info",
}: {
  icono: ReactNode;
  titulo: string;
  texto: string;
  acciones: ReactNode;
  tono?: "info" | "error";
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/[0.06] motion-safe:animate-entrada">
        <div className="relative isolate flex h-40 items-end justify-center overflow-hidden bg-primary-deep sm:h-48">
          <FondoMarca compacto />
        </div>
        <div className="-mt-12 space-y-4 px-6 pb-8 text-center sm:px-10 sm:pb-10">
          <span
            className={
              "relative z-[1] mx-auto flex size-24 items-center justify-center rounded-full border-4 border-card bg-card shadow-lg " +
              (tono === "error" ? "text-destructive" : "text-primary")
            }
          >
            {icono}
          </span>
          <h1 className="font-heading text-2xl font-bold text-balance sm:text-3xl">{titulo}</h1>
          <p className="mx-auto max-w-md text-muted-foreground">{texto}</p>
          <div className="flex flex-col justify-center gap-2 pt-2 sm:flex-row">{acciones}</div>
        </div>
      </div>
    </div>
  );
}
