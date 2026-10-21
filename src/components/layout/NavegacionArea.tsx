"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type EnlaceArea = {
  href: string;
  texto: string;
  Icono: LucideIcon;
  activo: (ruta: string) => boolean;
  /** Pending items in that section (Admin area); hidden when 0. */
  insignia?: number;
};

/**
 * "barra": bottom bar on phones and small tablets, always within thumb reach.
 * "pestanias": tabs inside the site header from md, so there is a single
 * navigation bar instead of two (tutor review 2026-10-20).
 */
export type VarianteNavegacion = "barra" | "pestanias";

// Static class names: Tailwind only generates classes it can read in the source.
const COLUMNAS: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" };

/**
 * Navigation of a private area (docs/research/panel-postulante.md §3.6).
 * MarcoArea renders both variants; each one hides itself at the other's
 * sizes, so only one is ever visible or announced.
 */
export function NavegacionArea({ enlaces, variante }: { enlaces: readonly EnlaceArea[]; variante: VarianteNavegacion }) {
  const ruta = usePathname();
  // Five sections (Admin) do not fit with words between md and lg, nor at full size in a 360 px bar
  const apretada = enlaces.length >= 5;

  if (variante === "pestanias") {
    return (
      <nav aria-label="Tu área" className="hidden self-stretch md:flex">
        <ul className="flex">
          {enlaces.map(({ href, texto, Icono, activo, insignia }) => {
            const actual = activo(ruta);
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={actual ? "page" : undefined}
                  title={apretada ? texto : undefined}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:bg-accent focus-visible:outline-none",
                    apretada ? "lg:gap-1.5 lg:px-2.5 xl:gap-2 xl:px-4" : "lg:px-4",
                    actual ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icono aria-hidden className="size-4" />
                  <span className={cn(apretada && "sr-only lg:not-sr-only")}>{texto}</span>
                  {insignia ? (
                    <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-xs leading-5 font-semibold text-primary-foreground">
                      {insignia}
                      <span className="sr-only"> pendientes</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Tu área"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className={cn("grid", COLUMNAS[enlaces.length])}>
        {enlaces.map(({ href, texto, Icono, activo, insignia }) => {
          const actual = activo(ruta);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "group flex h-16 flex-col items-center justify-center gap-1 px-0.5 transition-colors focus-visible:outline-none active:scale-95",
                  apretada ? "text-[0.6875rem] tracking-tight" : "text-xs",
                  actual ? "font-semibold text-primary" : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {/* A pill behind the active icon says "you are here" at a glance (Material-style bar) */}
                <span
                  className={cn(
                    "relative flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,width] duration-300 group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                    actual ? "bg-secondary" : "w-10 group-hover:bg-muted",
                  )}
                >
                  <Icono aria-hidden className="size-5" />
                  {insignia ? (
                    // Ringed in the bar's colour so it reads as a separate dot over the icon
                    <span className="absolute -top-1 right-0.5 min-w-5 rounded-full bg-primary px-1 text-center text-[0.6875rem] leading-5 font-bold text-primary-foreground ring-2 ring-card">
                      {insignia > 99 ? "99+" : insignia}
                      <span className="sr-only"> pendientes</span>
                    </span>
                  ) : null}
                </span>
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
