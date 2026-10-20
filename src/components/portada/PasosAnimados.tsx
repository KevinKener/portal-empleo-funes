"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The icon comes rendered: components cannot cross from the server to a Client Component. */
export type Paso = { icono: ReactNode; titulo: string; texto: string };

const DURACION = 1800; // ms for the path to go from the first step to the last one

/**
 * "¿Cómo funciona?" as a path: centred columns on desktop (the line runs
 * exactly through the icons' centres) and a vertical timeline on phones.
 * When it scrolls into view the path fills from step 1 to the last, each
 * step lights up as the line reaches it, then a light keeps travelling.
 * Shown complete and still with reduced motion or without JavaScript.
 */
export function PasosAnimados({ pasos }: { pasos: readonly Paso[] }) {
  const caja = useRef<HTMLOListElement>(null);
  // "listo" = drawn (also the server and reduced-motion state); "espera" = waiting to be seen
  const [estado, setEstado] = useState<"listo" | "espera" | "dibujando">("listo");

  useEffect(() => {
    const elemento = caja.current;
    if (!elemento || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setEstado("dibujando");
        observador.disconnect();
      },
      { threshold: 0.35 },
    );
    requestAnimationFrame(() => setEstado((actual) => (actual === "listo" ? "espera" : actual)));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const lleno = estado !== "espera";
  const demora = (i: number) => (estado === "dibujando" ? `${(i / Math.max(1, pasos.length - 1)) * DURACION}ms` : "0ms");

  return (
    <ol ref={caja} className="relative grid gap-10 md:grid-cols-3 md:gap-8">
      {/* Desktop path, from the centre of the first column to the centre of the last one */}
      <div
        aria-hidden
        className="absolute top-8 hidden h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border md:block"
        style={{ left: "calc((100% - 4rem) / 6)", right: "calc((100% - 4rem) / 6)" }}
      >
        <div
          className="h-full origin-left rounded-full bg-gradient-to-r from-primary/70 to-primary transition-transform ease-in-out"
          style={{ transform: `scaleX(${lleno ? 1 : 0})`, transitionDuration: `${DURACION}ms` }}
        />
        {estado !== "espera" && (
          <div
            className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-primary-foreground/90 to-transparent motion-safe:animate-recorrido"
            style={{ "--retraso": estado === "dibujando" ? `${DURACION}ms` : "0ms" } as CSSProperties}
          />
        )}
      </div>

      {pasos.map(({ icono, titulo, texto }, i) => (
        <li key={titulo} className="relative flex gap-5 md:flex-col md:items-center md:gap-6 md:text-center">
          {/* Phone path: from this icon down to the next one */}
          {i < pasos.length - 1 && (
            <div aria-hidden className="absolute top-16 -bottom-10 left-8 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-border md:hidden">
              <div
                className="h-full origin-top bg-primary transition-transform ease-in-out"
                style={{
                  transform: `scaleY(${lleno ? 1 : 0})`,
                  transitionDuration: `${DURACION / pasos.length}ms`,
                  transitionDelay: demora(i),
                }}
              />
            </div>
          )}

          <span
            className={cn(
              "relative z-[1] flex size-16 shrink-0 items-center justify-center rounded-2xl ring-8 ring-card transition-[background-color,color,box-shadow,scale] duration-500",
              lleno
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30"
                : "scale-90 bg-secondary text-secondary-foreground",
            )}
            style={{ transitionDelay: demora(i) }}
          >
            {icono}
            <span
              aria-hidden
              className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary-deep font-heading text-xs font-bold text-primary-foreground"
            >
              {i + 1}
            </span>
            {estado === "dibujando" && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl ring-2 ring-primary motion-safe:animate-onda"
                style={{ "--retraso": demora(i) } as CSSProperties}
              />
            )}
          </span>

          <div
            className={cn("space-y-2 pt-1 transition-[opacity,translate] duration-500 md:max-w-xs md:pt-0", !lleno && "translate-y-3 opacity-0")}
            style={{ transitionDelay: demora(i) }}
          >
            <h3 className="font-heading text-lg font-semibold">
              <span className="sr-only">Paso {i + 1}: </span>
              {titulo}
            </h3>
            <p className="text-muted-foreground">{texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
