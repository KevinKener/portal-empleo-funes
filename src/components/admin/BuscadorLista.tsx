"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Search box of an Admin list (on its own, or `enBarra` as a segment of a
 * filter bar): searches as the person types (`?q=`), keeps
 * every other URL param and goes back to page 1. Without JavaScript it still
 * works as a plain GET form carrying the other params.
 */
export function BuscadorLista({ buscarPor, className, enBarra = false }: { buscarPor: string; className?: string; enBarra?: boolean }) {
  const router = useRouter();
  const ruta = usePathname();
  const params = useSearchParams();
  const [texto, setTexto] = useState(params.get("q") ?? "");
  const [buscando, iniciar] = useTransition();
  const primera = useRef(true);

  // Other params the search keeps (the page resets: results change)
  const otros = [...params.entries()].filter(([clave]) => clave !== "q" && clave !== "pagina");

  // Searches as the person types, after a short pause
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    const reloj = window.setTimeout(() => {
      const nuevos = new URLSearchParams(otros);
      if (texto.trim()) nuevos.set("q", texto.trim());
      iniciar(() => router.replace(`${ruta}?${nuevos}`, { scroll: false }));
    }, 300);
    return () => window.clearTimeout(reloj);
    // Only typing triggers it; filters are links
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  return (
    <form action={ruta} role="search" className={cn("relative", className)}>
      {otros.map(([clave, valor]) => (
        <input key={clave} type="hidden" name={clave} value={valor} />
      ))}
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
        className={cn(
          "h-11 w-full pr-10 pl-10 text-base outline-none placeholder:text-muted-foreground sm:text-sm [&::-webkit-search-cancel-button]:hidden",
          // enBarra: one segment of a shared filter bar, which draws the frame
          enBarra
            ? "h-12 bg-transparent focus-visible:bg-accent/40"
            : "rounded-xl border border-input bg-card shadow-sm transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
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
  );
}
