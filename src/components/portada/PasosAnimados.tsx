"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The icon comes rendered: components cannot cross from the server to a Client Component. */
export type Paso = { icono: ReactNode; titulo: string; texto: string };

const DURACION = 1800; // ms for the path to go from step 1 to the last one

/**
 * "¿Cómo funciona?" as a path that fills from the first step to the last
 * when it scrolls into view: each step lights up as the line reaches it,
 * then a light keeps travelling along the finished path. A real sequence,
 * so the numbers carry meaning. Shown complete and still with reduced motion
 * or without JavaScript.
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
      {/* Desktop path: from the first icon's centre to the last one's */}
      <div
        aria-hidden
        className="absolute top-6 left-6 hidden h-0.5 overflow-hidden rounded-full bg-border md:block"
        style={{ right: "calc((100% - 4rem) / 3 - 1.5rem)" }}
      >
        <div
          className="h-full origin-left rounded-full bg-primary transition-transform ease-in-out"
          style={{ transform: `scaleX(${lleno ? 1 : 0})`, transitionDuration: `${DURACION}ms` }}
        />
        {estado !== "espera" && (
          <div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-primary-foreground to-transparent opacity-70 motion-safe:animate-recorrido"
            style={{ "--retraso": estado === "dibujando" ? `${DURACION}ms` : "0ms" } as CSSProperties}
          />
        )}
      </div>

      {pasos.map(({ icono, titulo, texto }, i) => (
        <li key={titulo} className="relative space-y-3">
          {/* Phone path: a segment down to the next step */}
          {i < pasos.length - 1 && (
            <div aria-hidden className="absolute top-14 -bottom-8 left-6 w-0.5 overflow-hidden rounded-full bg-border md:hidden">
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
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "relative flex size-12 items-center justify-center rounded-2xl transition-[background-color,color,box-shadow,scale] duration-500",
                lleno
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "scale-90 bg-secondary text-secondary-foreground",
              )}
              style={{ transitionDelay: demora(i) }}
            >
              {icono}
              {estado === "dibujando" && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl ring-2 ring-primary motion-safe:animate-onda"
                  style={{ "--retraso": demora(i) } as CSSProperties}
                />
              )}
            </span>
            <span className="relative -ml-3 bg-card px-3 text-sm font-semibold text-muted-foreground">Paso {i + 1}</span>
          </div>
          <div
            className={cn("space-y-2 transition-[opacity,translate] duration-500", !lleno && "translate-y-3 opacity-0")}
            style={{ transitionDelay: demora(i) }}
          >
            <h3 className="font-heading text-lg font-semibold">{titulo}</h3>
            <p className="text-muted-foreground">{texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
