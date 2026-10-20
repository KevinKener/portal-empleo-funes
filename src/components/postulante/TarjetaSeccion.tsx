import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PropsTarjetaSeccion = {
  id?: string;
  titulo: string;
  descripcion?: string;
  /** Icon for the heading tile; it turns brand green once the section has content. */
  icono?: ReactNode;
  /** Whether the section already has content (shows a "Completo" badge); undefined hides it. */
  hecho?: boolean;
  children: ReactNode;
};

/** A card section of a profile page, with an optional icon and done badge. */
export function TarjetaSeccion({ id, titulo, descripcion, icono, hecho, children }: PropsTarjetaSeccion) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-titulo` : undefined}
      className="scroll-mt-24 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-primary/[0.03] sm:p-6"
    >
      <div className="flex items-start gap-4">
        {icono && (
          <span
            aria-hidden
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-500",
              hecho ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-secondary-foreground",
            )}
          >
            {icono}
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id={id ? `${id}-titulo` : undefined} className="font-heading text-xl font-semibold">
            {titulo}
          </h2>
          {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
        </div>
        {hecho !== undefined && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              hecho ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {hecho && <CircleCheck aria-hidden className="size-3.5" />}
            {hecho ? "Completo" : "Vacío"}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
