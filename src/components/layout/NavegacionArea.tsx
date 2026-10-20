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

// Static class names: Tailwind only generates classes it can read in the source.
const COLUMNAS: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" };

/**
 * Navigation of a private area: a bottom bar on phones (always within thumb
 * reach) and tabs under the header from sm (docs/research/panel-postulante.md §3.6).
 * Material Design recommends 3–5 destinations for the bottom bar.
 */
export function NavegacionArea({ enlaces }: { enlaces: readonly EnlaceArea[] }) {
  const ruta = usePathname();

  return (
    <nav
      aria-label="Tu área"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:static sm:border-t-0 sm:border-b sm:bg-card sm:pb-0 sm:backdrop-blur-none"
    >
      <ul className={cn("mx-auto grid max-w-6xl sm:flex sm:gap-1 sm:px-4", COLUMNAS[enlaces.length])}>
        {enlaces.map(({ href, texto, Icono, activo }) => {
          const actual = activo(ruta);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  "sm:h-auto sm:flex-row sm:gap-2 sm:border-b-2 sm:px-3 sm:py-3 sm:text-sm",
                  actual
                    ? "text-primary sm:border-primary"
                    : "text-muted-foreground hover:text-foreground sm:border-transparent",
                )}
              >
                <Icono aria-hidden className="size-5 sm:size-4" />
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
