import type { CSSProperties } from "react";
import {
  Briefcase,
  ChefHat,
  ClipboardList,
  Factory,
  GraduationCap,
  HardHat,
  Headset,
  HeartHandshake,
  Laptop,
  ShoppingBag,
  SprayCan,
  Stethoscope,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// One icon per seeded category (supabase/seed.sql); a new one falls back to the briefcase
const ICONOS: Record<string, LucideIcon> = {
  Administración: ClipboardList,
  "Atención al cliente": Headset,
  "Comercio y ventas": ShoppingBag,
  Construcción: HardHat,
  "Cuidado de personas": HeartHandshake,
  Educación: GraduationCap,
  Gastronomía: ChefHat,
  "Industria y producción": Factory,
  "Limpieza y mantenimiento": SprayCan,
  "Logística y transporte": Truck,
  Salud: Stethoscope,
  Tecnología: Laptop,
};

type Lugar = { estilo: CSSProperties; adelante: boolean };

// Hand-placed spots on the hero's right half, so the chips never cover the text. The
// right-hand ones are anchored to the right edge so long names never get cut. Two depths:
// white chips in front, smaller see-through ones behind, so the band gains depth.
const LUGARES: Lugar[] = [
  { estilo: { top: "12%", left: "10%" }, adelante: true },
  { estilo: { top: "27%", right: "9%" }, adelante: true },
  { estilo: { top: "44%", left: "18%" }, adelante: false },
  { estilo: { top: "57%", right: "5%" }, adelante: true },
  { estilo: { top: "73%", left: "6%" }, adelante: true },
  { estilo: { top: "86%", right: "24%" }, adelante: false },
  { estilo: { top: "5%", right: "3%" }, adelante: false },
  { estilo: { top: "63%", left: "38%" }, adelante: false },
];

/**
 * The portal's real categories floating on the hero (from lg) like balloons:
 * each one bobs up and down and sways on its own rhythm, with its icon, so the
 * band says at a glance what kind of work is here. They stand still with
 * reduced motion.
 */
export function RubrosFlotantes({ rubros }: { rubros: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] lg:block">
      {rubros.slice(0, LUGARES.length).map((rubro, i) => {
        const { estilo, adelante } = LUGARES[i];
        const Icono = ICONOS[rubro] ?? Briefcase;
        return (
          // Outer: the sway; inner: the bob (flotar). Separate elements so both motions add up
          <span
            key={rubro}
            className={cn("absolute motion-safe:animate-vaiven", adelante ? "z-10" : "z-0")}
            style={
              {
                ...estilo,
                "--duracion-x": `${9 + (i % 3) * 2.5}s`,
                "--deriva-x": `${6 + (i % 4) * 3}px`,
                "--retraso": `${-i * 1.7}s`,
              } as CSSProperties
            }
          >
            <span
              className={cn(
                "flex items-center gap-2 rounded-full font-medium whitespace-nowrap motion-safe:animate-flotar",
                adelante
                  ? "bg-primary-foreground py-2 pr-4 pl-2 text-sm text-primary-deep shadow-xl shadow-black/25"
                  : "border border-primary-foreground/20 bg-primary-foreground/10 py-1.5 pr-3.5 pl-1.5 text-xs text-primary-foreground/80 shadow-lg shadow-black/10 backdrop-blur-sm",
              )}
              style={
                {
                  "--duracion": `${5 + (i % 4) * 1.5}s`,
                  "--retraso": `${-i * 1.3}s`,
                  "--distancia": `${12 + (i % 3) * 7}px`,
                } as CSSProperties
              }
            >
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full",
                  adelante ? "size-7 bg-secondary text-primary" : "size-6 bg-primary-foreground/15 text-primary-foreground",
                )}
              >
                <Icono className={adelante ? "size-4" : "size-3.5"} />
              </span>
              {rubro}
            </span>
          </span>
        );
      })}
    </div>
  );
}
