"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Estado = "inicial" | "oculto" | "visible";

/**
 * Fades and lifts its content in the first time it scrolls into view.
 * Server-rendered visible ("inicial"): it only hides what is still below the
 * fold once JavaScript runs, so nothing stays invisible without JS and
 * nothing already on screen flashes. Instant with reduced motion.
 */
export function Revelar({ children, retraso = 0, className }: { children: ReactNode; retraso?: number; className?: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>("inicial");

  useEffect(() => {
    const elemento = caja.current;
    if (!elemento || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (elemento.getBoundingClientRect().top < window.innerHeight) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setEstado("visible");
        observador.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    // Hide only after the observer is set up, from a callback (not during render)
    requestAnimationFrame(() => setEstado((actual) => (actual === "inicial" ? "oculto" : actual)));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={caja}
      style={{ transitionDelay: estado === "visible" ? `${retraso}ms` : undefined }}
      className={cn(
        "transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
        estado === "oculto" && "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
