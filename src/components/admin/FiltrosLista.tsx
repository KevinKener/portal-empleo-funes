"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FiltroLista = { valor: string; texto: string; cantidad: number };

type PropsFiltrosLista = {
  /** Page the filters belong to, e.g. "/admin/ofertas". */
  ruta: string;
  filtros: FiltroLista[];
  actual: string;
  busqueda: string;
  /** Placeholder of the search box: what can be searched. */
  buscarPor: string;
};

function href(ruta: string, estado: string, q: string) {
  const params = new URLSearchParams({ estado });
  if (q) params.set("q", q);
  return `${ruta}?${params}`;
}

/**
 * Search first, then filter chips with their counts (MoJ case list,
 * docs/research/admin.md §4.3). Everything lives in the URL (`?estado=`,
 * `?q=`), so a filtered list can be shared or reloaded. Without JavaScript
 * the search box still works as a plain GET form.
 */
export function FiltrosLista({ ruta, filtros, actual, busqueda, buscarPor }: PropsFiltrosLista) {
  const router = useRouter();
  const [texto, setTexto] = useState(busqueda);
  const [buscando, iniciar] = useTransition();
  const primera = useRef(true);

  // Searches as the person types, after a short pause
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    const reloj = window.setTimeout(() => {
      iniciar(() => router.replace(href(ruta, actual, texto.trim()), { scroll: false }));
    }, 300);
    return () => window.clearTimeout(reloj);
    // Only typing triggers it; changing chips is a link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  return (
    <div className="space-y-3">
      <form action={ruta} role="search" className="relative max-w-xl">
        <input type="hidden" name="estado" value={actual} />
        <label htmlFor="buscar-lista" className="sr-only">
          Buscar
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="buscar-lista"
          name="q"
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder={buscarPor}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-input bg-card pr-10 pl-10 text-base shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {buscando ? (
          <LoaderCircle aria-hidden className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          texto && (
            <button
              type="button"
              onClick={() => setTexto("")}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X aria-hidden className="size-4" />
              <span className="sr-only">Borrar la búsqueda</span>
            </button>
          )
        )}
      </form>

      <nav
        aria-label="Filtrar"
        // pt-1/-mt-1: room for the hover lift, which the scrolling box would clip
        className="-mx-4 -mt-1 overflow-x-auto px-4 pt-1 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {filtros.map(({ valor, texto: etiqueta, cantidad }) => {
            const activo = valor === actual;
            return (
              <li key={valor}>
                <Link
                  href={href(ruta, valor, busqueda)}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,translate] duration-200 motion-safe:hover:-translate-y-0.5",
                    activo
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {etiqueta}
                  <span className={cn("rounded-full px-1.5 text-xs font-semibold", activo ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>
                    {cantidad}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
