"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Selector, type OpcionSelector } from "@/components/formularios/Selector";
import { cn } from "@/lib/utils";

const TODOS = "todos";

type PropsFiltroSelect = {
  /** URL param it sets, e.g. `rubro`. */
  parametro: string;
  /** Read by screen readers, e.g. "Rubro". */
  etiqueta: string;
  /** First option, the one that clears the filter, e.g. "Todos los rubros". */
  todos: string;
  opciones: OpcionSelector[];
  actual: string | null;
  /** Icon that says what the value is ("Funes (4)" alone could be anything); an element, so a Server Component can pass it. */
  icono: ReactNode;
  className?: string;
};

/**
 * A list filter as a select, one segment of a filter bar (the bar draws the
 * frame), for filters with too many values for chips.
 * Keeps the other URL params and goes back to page 1; dims while the new
 * results load.
 */
export function FiltroSelect({ parametro, etiqueta, todos, opciones, actual, icono, className }: PropsFiltroSelect) {
  const router = useRouter();
  const ruta = usePathname();
  const params = useSearchParams();
  const [cargando, iniciar] = useTransition();

  function cambiar(valor: string) {
    const nuevos = new URLSearchParams(params);
    nuevos.delete("pagina");
    if (!valor || valor === TODOS) nuevos.delete(parametro);
    else nuevos.set(parametro, valor);
    iniciar(() => router.replace(`${ruta}?${nuevos}`, { scroll: false }));
  }

  return (
    <div className={cn("relative transition-opacity", cargando && "opacity-60", className)} aria-busy={cargando}>
      <span aria-hidden className={cn("pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 [&_svg]:size-4", actual ? "text-primary" : "text-muted-foreground")}>
        {icono}
      </span>
      <Selector
        aria-label={etiqueta}
        opciones={[{ valor: TODOS, texto: todos }, ...opciones]}
        valor={actual ?? TODOS}
        onCambiar={cambiar}
        debajo
        // A segment of the filter bar (the base trigger forces h-8, hence data-[size])
        className={cn(
          "w-full rounded-none border-0 bg-transparent pr-4 pl-11 font-medium shadow-none hover:bg-accent/60 focus-visible:ring-inset data-[size=default]:h-12 sm:text-sm",
          // An active filter stands out from the defaults
          actual && "bg-secondary/50 text-primary",
        )}
      />
    </div>
  );
}
