"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const INTERVALO = 3200; // ms per step: time to read one line

/**
 * The portal's three steps on the account screens' green panel, joined by a
 * line. They light up one after another in a slow loop, so the panel shows
 * the path without asking anything. Without motion (or JavaScript) all three
 * stay lit and still.
 */
export function PasosCuenta({ pasos }: { pasos: readonly string[] }) {
  // null = no loop (server render, reduced motion): every step lit
  const [activo, setActivo] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const inicio = window.setTimeout(() => setActivo(0), 900);
    const reloj = window.setInterval(() => setActivo((actual) => ((actual ?? -1) + 1) % pasos.length), INTERVALO);
    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(reloj);
    };
  }, [pasos.length]);

  const avance = activo === null ? 1 : activo / Math.max(1, pasos.length - 1);

  return (
    <ol className="relative space-y-3">
      {/* The line behind the numbers, filled up to the lit step */}
      <span aria-hidden className="absolute top-8 bottom-8 left-[1.875rem] w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-primary-foreground/15">
        <span
          className="block size-full origin-top bg-primary-foreground/70 transition-transform duration-700 ease-out"
          style={{ transform: `scaleY(${avance})` }}
        />
      </span>

      {pasos.map((paso, i) => {
        const encendido = activo === null || i <= activo;
        const actual = activo === i;
        return (
          <li
            key={paso}
            className={cn(
              "relative flex items-center gap-4 rounded-2xl border p-3 transition-[background-color,border-color] duration-700 ease-out motion-safe:animate-entrada",
              actual
                ? "border-primary-foreground/25 bg-primary-foreground/10 shadow-lg shadow-black/10"
                : "border-transparent bg-transparent",
            )}
            style={{ "--retraso": `${300 + i * 140}ms` } as CSSProperties}
          >
            <span
              className={cn(
                "relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-heading text-sm font-bold transition-[background-color,border-color,color,scale] duration-500",
                encendido
                  ? "border-primary-foreground bg-primary-foreground text-primary-deep"
                  : "border-primary-foreground/30 bg-primary-deep text-primary-foreground/70",
                actual && "scale-110",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("transition-colors duration-500", encendido ? "text-primary-foreground" : "text-primary-foreground/65")}>
              {paso}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
