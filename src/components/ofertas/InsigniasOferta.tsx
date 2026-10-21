import { Flame, Sparkles, Target, Zap, type LucideIcon } from "lucide-react";
import type { InsigniaOferta } from "@/lib/insignias-oferta";
import { cn } from "@/lib/utils";

const INSIGNIAS: Record<InsigniaOferta, { texto: string; titulo: string; Icono: LucideIcon; clase: string }> = {
  urgente: {
    texto: "Urgente",
    titulo: "La empresa necesita cubrirla pronto",
    Icono: Zap,
    clase: "bg-aviso-suave text-aviso",
  },
  solicitada: {
    texto: "Muy solicitada",
    titulo: "Una de las ofertas con más postulantes",
    Icono: Flame,
    clase: "bg-secondary text-secondary-foreground",
  },
  pocos: {
    texto: "Pocos postulantes",
    titulo: "¡Buena chance! Todavía se postuló poca gente",
    Icono: Target,
    clase: "bg-secondary text-secondary-foreground",
  },
  nueva: {
    texto: "Nueva",
    titulo: "Publicada en los últimos días",
    Icono: Sparkles,
    clase: "bg-primary text-primary-foreground",
  },
};

/**
 * The badges of an offer as small pills with icon and words (never color
 * alone). `sobreOscuro` is for the dark brand banner of the offer page.
 */
export function InsigniasOferta({
  insignias,
  sobreOscuro = false,
  className,
}: {
  insignias: InsigniaOferta[];
  sobreOscuro?: boolean;
  className?: string;
}) {
  if (insignias.length === 0) return null;

  return (
    <ul aria-label="Destacados de la oferta" className={cn("flex flex-wrap gap-1.5", className)}>
      {insignias.map((insignia) => {
        const { texto, titulo, Icono, clase } = INSIGNIAS[insignia];
        return (
          <li
            key={insignia}
            title={titulo}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
              sobreOscuro && insignia !== "urgente"
                ? "border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm"
                : clase,
            )}
          >
            <Icono aria-hidden className={cn("size-3.5 shrink-0", insignia === "urgente" && "fill-current")} />
            {texto}
          </li>
        );
      })}
    </ul>
  );
}
