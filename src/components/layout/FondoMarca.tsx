"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Escudo } from "@/components/layout/Escudo";
import { cn } from "@/lib/utils";

// Each layer follows the pointer by a different amount, which reads as depth
const capa = (factor: number): CSSProperties => ({
  transform: `translate3d(calc(var(--px, 0) * ${factor}px), calc(var(--py, 0) * ${factor}px), 0)`,
  transition: "transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1)",
});

/**
 * Moving brand background for the dark-green panels (landing hero, account
 * screens, area homes): slow seal-like rings, two drifting Funes shields,
 * a soft light and a periodic sweep; on desktop the layers also lean towards the pointer.
 * Decorative, behind the content (-z-10 inside an `isolate` parent), and
 * completely still with reduced motion (WCAG 2.2.2 / C39).
 */
export function FondoMarca({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const capaRaiz = raiz.current;
    const panel = capaRaiz?.parentElement;
    if (!capaRaiz || !panel) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)");
    if (quieto.matches) return;

    let cuadro = 0;
    const mover = (evento: PointerEvent) => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const caja = panel.getBoundingClientRect();
        // -1..1 from the panel's centre
        capaRaiz.style.setProperty("--px", (((evento.clientX - caja.left) / caja.width) * 2 - 1).toFixed(3));
        capaRaiz.style.setProperty("--py", (((evento.clientY - caja.top) / caja.height) * 2 - 1).toFixed(3));
      });
    };
    const volver = () => {
      capaRaiz.style.setProperty("--px", "0");
      capaRaiz.style.setProperty("--py", "0");
    };
    panel.addEventListener("pointermove", mover);
    panel.addEventListener("pointerleave", volver);
    return () => {
      cancelAnimationFrame(cuadro);
      panel.removeEventListener("pointermove", mover);
      panel.removeEventListener("pointerleave", volver);
    };
  }, []);

  return (
    <div ref={raiz} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute -top-1/3 -left-1/4 size-[70%] rounded-full bg-primary/60 blur-3xl motion-safe:animate-luz" />
      {/* Every few seconds a soft light crosses the banner */}
      <div className="absolute inset-y-0 left-0 w-1/4 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/[0.09] to-transparent motion-safe:animate-destello" />

      {/* Seal rings around the big shield, turning very slowly */}
      <div className="absolute -right-[18%] -bottom-[55%] aspect-square w-[52rem] max-w-none" style={capa(-10)}>
        <svg viewBox="0 0 200 200" className="size-full text-primary-foreground/[0.07] motion-safe:animate-giro">
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 3" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 4" />
        </svg>
      </div>

      <div className={cn("absolute", compacto ? "-right-12 -bottom-20" : "-right-[8%] -bottom-[30%]")} style={capa(18)}>
        <Escudo
          className={cn(
            "text-primary-foreground/[0.07] motion-safe:animate-deriva",
            compacto ? "size-64 sm:size-72" : "size-[26rem] sm:size-[34rem]",
          )}
        />
      </div>
      {!compacto && (
        <div className="absolute top-[8%] right-[38%] hidden lg:block" style={capa(34)}>
          <Escudo className="size-40 text-primary-foreground/[0.05] motion-safe:animate-deriva-lenta" />
        </div>
      )}
    </div>
  );
}
