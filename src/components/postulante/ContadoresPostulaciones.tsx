import type { CSSProperties } from "react";
import { Archive, Building2, Clock, PartyPopper, type LucideIcon } from "lucide-react";
import { contarPorGrupo, type GrupoEstado } from "@/lib/panel-postulante";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";

// Count tiles: the further the stage, the stronger the brand green
const GRUPOS: Record<GrupoEstado, { texto: (n: number) => string; Icono: LucideIcon; tile: string; icono: string; barra: string }> = {
  en_revision: {
    texto: () => "En revisión",
    Icono: Clock,
    tile: "bg-muted text-foreground",
    icono: "bg-card text-primary",
    barra: "bg-primary/40",
  },
  con_la_empresa: {
    texto: () => "Con la empresa",
    Icono: Building2,
    tile: "bg-secondary text-secondary-foreground",
    icono: "bg-primary text-primary-foreground",
    barra: "bg-primary",
  },
  contratado: {
    texto: (n) => (n === 1 ? "Contratación" : "Contrataciones"),
    Icono: PartyPopper,
    tile: "bg-primary text-primary-foreground",
    icono: "bg-primary-foreground/15 text-primary-foreground",
    barra: "bg-primary-foreground/70",
  },
  finalizada: {
    texto: (n) => (n === 1 ? "Finalizada" : "Finalizadas"),
    Icono: Archive,
    tile: "bg-muted text-muted-foreground",
    icono: "bg-card text-muted-foreground",
    barra: "bg-muted-foreground/40",
  },
};

/**
 * A count per status group: the number counts up and a bar shows its share
 * of all applications. Used on Mi panel and on "Mis postulaciones".
 */
export function ContadoresPostulaciones({ postulaciones }: { postulaciones: MiPostulacion[] }) {
  const total = postulaciones.length;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]" aria-label="Postulaciones por estado">
      {contarPorGrupo(postulaciones).map(({ grupo, cantidad }, i) => {
        const { texto, Icono, tile, icono, barra } = GRUPOS[grupo];
        const retraso = { "--retraso": `${i * 90}ms`, "--hasta": cantidad } as CSSProperties;
        return (
          <li key={grupo} className={cn("relative overflow-hidden rounded-xl p-3 pb-4 motion-safe:animate-entrada", tile)} style={retraso}>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", icono)}>
                <Icono aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <span aria-hidden className="contador block font-heading text-2xl leading-none font-bold" />
                <span className="sr-only">{cantidad} </span>
                <span className="mt-0.5 block text-xs leading-tight font-medium">{texto(cantidad)}</span>
              </span>
            </div>
            {/* Share of all applications */}
            <span aria-hidden className="absolute inset-x-3 bottom-1.5 h-1 overflow-hidden rounded-full bg-current/10">
              <span
                className={cn("block h-full origin-left rounded-full motion-safe:animate-llenar-x", barra)}
                style={{ width: `${(cantidad / total) * 100}%`, "--retraso": `${300 + i * 90}ms` } as CSSProperties}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
