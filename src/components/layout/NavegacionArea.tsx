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

  if (variante === "pestanias") {
    return (
      <nav aria-label="Tu área" className="hidden self-stretch md:flex">
        <ul className="flex">
          {enlaces.map(({ href, texto, Icono, activo }) => {
            const actual = activo(ruta);
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={actual ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:bg-accent focus-visible:outline-none lg:px-4",
                    actual ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icono aria-hidden className="size-4" />
                  {texto}
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
        {enlaces.map(({ href, texto, Icono, activo }) => {
          const actual = activo(ruta);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "group flex h-16 flex-col items-center justify-center gap-1 px-1 text-xs transition-colors focus-visible:outline-none active:scale-95",
                  actual ? "font-semibold text-primary" : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {/* A pill behind the active icon says "you are here" at a glance (Material-style bar) */}
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,width] duration-300 group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                    actual ? "bg-secondary" : "w-10 group-hover:bg-muted",
                  )}
                >
                  <Icono aria-hidden className="size-5" />
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
