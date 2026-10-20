"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERVALO = 3500; // ms per card: enough to read a title and its company

const BOTON =
  "flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-[background-color,opacity,transform] duration-150 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-35";

/**
 * Horizontal row of offer cards that snaps card by card: swipe on phones,
 * arrows or dots on desktop. It also glides one card at a time by itself,
 * and holds still while the pointer or focus is on it (the way to pause it,
 * WCAG 2.2.2), after the person moves it, off screen and with reduced motion.
 */
export function CarruselOfertas({ titulo, extra, children }: { titulo: ReactNode; extra?: ReactNode; children: ReactNode }) {
  const id = useId();
  const lista = useRef<HTMLUListElement>(null);
  const [pagina, setPagina] = useState({ actual: 0, total: 1 });
  const [pausado, setPausado] = useState(false); // the person took over
  const [enUso, setEnUso] = useState(false); // hover or focus inside
  const [visible, setVisible] = useState(false);
  const [reducido, setReducido] = useState(false);

  const medir = useCallback(() => {
    const elemento = lista.current;
    if (!elemento) return;
    // Pages beyond the first; the few px of side padding do not count as one
    const resto = elemento.scrollWidth - elemento.clientWidth;
    const total = resto <= 16 ? 1 : 1 + Math.ceil((resto - 16) / elemento.clientWidth);
    const fin = elemento.scrollLeft + elemento.clientWidth >= elemento.scrollWidth - 4;
    setPagina({ total, actual: fin ? total - 1 : Math.round(elemento.scrollLeft / elemento.clientWidth) });
  }, []);

  useEffect(() => {
    const elemento = lista.current;
    if (!elemento) return;
    medir();
    elemento.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);

    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const alCambiar = () => setReducido(consulta.matches);
    alCambiar();
    consulta.addEventListener("change", alCambiar);

    const observador = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting), { threshold: 0.4 });
    observador.observe(elemento);

    return () => {
      elemento.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
      consulta.removeEventListener("change", alCambiar);
      observador.disconnect();
    };
  }, [medir]);

  const irA = useCallback(
    (destino: number) => {
      const elemento = lista.current;
      if (!elemento) return;
      elemento.scrollTo({ left: destino * elemento.clientWidth, behavior: reducido ? "auto" : "smooth" });
    },
    [reducido],
  );

  const avanza = !pausado && !enUso && visible && !reducido && pagina.total > 1;
  useEffect(() => {
    if (!avanza) return;
    const reloj = window.setInterval(() => {
      const elemento = lista.current;
      if (!elemento || document.hidden) return;
      const fin = elemento.scrollLeft + elemento.clientWidth >= elemento.scrollWidth - 4;
      const primera = elemento.querySelector("li");
      const paso = primera ? primera.getBoundingClientRect().width + 16 : elemento.clientWidth;
      // One card to the left each time; back to the start after the last one
      if (fin) elemento.scrollTo({ left: 0, behavior: "smooth" });
      else elemento.scrollBy({ left: paso, behavior: "smooth" });
    }, INTERVALO);
    return () => window.clearInterval(reloj);
  }, [avanza]);

  // Moving it by hand means the person took over: stop advancing by itself
  const manual = (destino: number) => {
    setPausado(true);
    irA(destino);
  };

  return (
    <div
      className="space-y-6"
      onPointerEnter={() => setEnUso(true)}
      onPointerLeave={() => setEnUso(false)}
      onFocus={() => setEnUso(true)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setEnUso(false);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        {titulo}
        <div className="flex items-center gap-3">
          {extra}
          <div className="hidden gap-2 sm:flex">
            <button type="button" className={BOTON} aria-controls={id} disabled={pagina.actual === 0} onClick={() => manual(pagina.actual - 1)}>
              <ChevronLeft aria-hidden className="size-5" />
              <span className="sr-only">Ofertas anteriores</span>
            </button>
            <button
              type="button"
              className={BOTON}
              aria-controls={id}
              disabled={pagina.actual >= pagina.total - 1}
              onClick={() => manual(pagina.actual + 1)}
            >
              <ChevronRight aria-hidden className="size-5" />
              <span className="sr-only">Más ofertas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vertical padding: the row clips overflow, so lifted cards need room to rise into */}
      <ul
        id={id}
        ref={lista}
        tabIndex={0}
        aria-label="Últimas ofertas, deslizá para ver más"
        onTouchStart={() => setPausado(true)}
        className={cn(
          "-mx-4 -my-3 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-3 focus-visible:outline-none sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-2 lg:scroll-px-2 lg:px-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {Children.map(children, (hijo) => (
          <li className="flex shrink-0 basis-[85%] snap-start sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]">
            {hijo}
          </li>
        ))}
      </ul>

      {pagina.total > 1 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pagina.total }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-controls={id}
                aria-current={i === pagina.actual ? "true" : undefined}
                onClick={() => manual(i)}
                className="group flex h-6 items-center px-0.5 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-[width,background-color] duration-300 group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                    i === pagina.actual ? "w-8 bg-primary" : "w-1.5 bg-border group-hover:bg-muted-foreground/50",
                  )}
                />
                <span className="sr-only">Ir al grupo {i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
