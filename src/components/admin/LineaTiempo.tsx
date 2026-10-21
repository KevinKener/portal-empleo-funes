import { haceCuanto } from "@/lib/formato";
import { cn } from "@/lib/utils";

export type HitoLinea = { texto: string; fecha: string; tono?: "malo" };

/**
 * A record's history as a vertical timeline, oldest first (MoJ timeline,
 * docs/research/admin.md §4.1). Built only from dates the database keeps.
 */
export function LineaTiempo({ hitos, momento }: { hitos: HitoLinea[]; momento: number }) {
  return (
    <ol className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-0.5 before:rounded-full before:bg-border">
      {hitos.map((hito, i) => {
        const ultimo = i === hitos.length - 1;
        return (
          <li key={`${hito.texto}-${hito.fecha}`} className="relative flex gap-3 pl-0">
            <span
              aria-hidden
              className={cn(
                "relative mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-card",
                hito.tono === "malo" ? "bg-destructive" : ultimo ? "bg-primary" : "bg-primary/40",
              )}
            />
            <p className="min-w-0 text-sm">
              <span className={cn("block", ultimo && "font-semibold")}>{hito.texto}</span>
              <time dateTime={hito.fecha} className="text-xs text-muted-foreground">
                {haceCuanto(hito.fecha, momento)}
              </time>
            </p>
          </li>
        );
      })}
    </ol>
  );
}
