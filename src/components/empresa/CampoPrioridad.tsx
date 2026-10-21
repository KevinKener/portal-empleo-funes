import { Leaf, Zap, type LucideIcon } from "lucide-react";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

const OPCIONES: { valor: Enums<"prioridad_oferta">; titulo: string; texto: string; Icono: LucideIcon; marcada: string }[] = [
  {
    valor: "normal",
    titulo: "Sin apuro",
    texto: "Buscamos con tiempo a la persona indicada.",
    Icono: Leaf,
    marcada: "has-[:checked]:border-primary has-[:checked]:bg-secondary",
  },
  {
    valor: "urgente",
    titulo: "Urgente",
    texto: "Necesitamos cubrirla lo antes posible.",
    Icono: Zap,
    marcada: "has-[:checked]:border-aviso has-[:checked]:bg-aviso-suave",
  },
];

/**
 * How fast the company needs to fill the offer, as two large radio cards
 * (easier to tap than a select). Urgent offers show a badge on the portal and
 * go first in the Office's review queue (docs/research/admin.md §4.8).
 */
export function CampoPrioridad({ inicial = "normal", error }: { inicial?: Enums<"prioridad_oferta">; error?: string }) {
  return (
    <fieldset className="space-y-2" aria-describedby={error ? "prioridad-error" : "prioridad-ayuda"}>
      <legend className="text-sm font-medium text-foreground">¿Qué tan rápido necesitás cubrirla?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPCIONES.map(({ valor, titulo, texto, Icono, marcada }) => (
          <label
            key={valor}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              marcada,
            )}
          >
            <input type="radio" name="prioridad" value={valor} defaultChecked={valor === inicial} className="sr-only" />
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                valor === "urgente" ? "bg-aviso-suave text-aviso" : "bg-secondary text-primary",
              )}
            >
              <Icono aria-hidden className="size-5" />
            </span>
            <span className="space-y-0.5">
              <span className="block font-semibold text-foreground">{titulo}</span>
              <span className="block text-sm text-muted-foreground">{texto}</span>
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id="prioridad-error" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p id="prioridad-ayuda" className="text-sm text-muted-foreground">
          Las urgentes se destacan en el portal y la Oficina de Empleo las revisa primero.
        </p>
      )}
    </fieldset>
  );
}
