"use client";

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTON =
  "flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-[background-color,opacity,transform] duration-150 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-35";

/**
 * Horizontal row of offer cards that snaps card by card: swipe on phones,
 * arrows (or the keyboard, once focused) on desktop. Never auto-advances:
 * people move it themselves, so nothing slides away while they read
 * (WCAG 2.2.2). The heading and "Ver todas" come from the page.
 */
export function CarruselOfertas({ titulo, extra, children }: { titulo: ReactNode; extra?: ReactNode; children: ReactNode }) {
  const id = useId();
  const lista = useRef<HTMLUListElement>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  useEffect(() => {
    const elemento = lista.current;
    if (!elemento) return;
    const medir = () =>
      setBordes({
        inicio: elemento.scrollLeft <= 4,
        fin: elemento.scrollLeft + elemento.clientWidth >= elemento.scrollWidth - 4,
      });
    medir();
    elemento.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      elemento.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  function mover(sentido: 1 | -1) {
    const elemento = lista.current;
    if (!elemento) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    elemento.scrollBy({ left: sentido * elemento.clientWidth * 0.9, behavior: reducido ? "auto" : "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {titulo}
        <div className="flex items-center gap-3">
          {extra}
          <div className="hidden gap-2 sm:flex">
            <button type="button" className={BOTON} aria-controls={id} disabled={bordes.inicio} onClick={() => mover(-1)}>
              <ChevronLeft aria-hidden className="size-5" />
              <span className="sr-only">Ofertas anteriores</span>
            </button>
            <button type="button" className={BOTON} aria-controls={id} disabled={bordes.fin} onClick={() => mover(1)}>
              <ChevronRight aria-hidden className="size-5" />
              <span className="sr-only">Más ofertas</span>
            </button>
          </div>
        </div>
      </div>

      <ul
        id={id}
        ref={lista}
        tabIndex={0}
        aria-label="Últimas ofertas, deslizá para ver más"
        className={cn(
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 focus-visible:outline-none sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {Children.map(children, (hijo) => (
          <li className="flex shrink-0 basis-[85%] snap-start sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]">
            {hijo}
          </li>
        ))}
      </ul>
    </div>
  );
}
