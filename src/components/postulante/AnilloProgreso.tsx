import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const RADIO = 26;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/**
 * Ring that fills up to `hechas` of `total` (animated once on load). "claro"
 * is for white cards, "oscuro" for the green banners.
 */
export function AnilloProgreso({ hechas, total, tono = "claro" }: { hechas: number; total: number; tono?: "claro" | "oscuro" }) {
  const faltante = CIRCUNFERENCIA * (1 - hechas / Math.max(1, total));
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" aria-hidden className="size-full -rotate-90">
        <circle cx="32" cy="32" r={RADIO} fill="none" strokeWidth="6" className={tono === "claro" ? "stroke-muted" : "stroke-primary-foreground/15"} />
        <circle
          cx="32"
          cy="32"
          r={RADIO}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={faltante}
          className={cn("motion-safe:animate-anillo", tono === "claro" ? "stroke-primary" : "stroke-primary-foreground")}
          style={{ "--total": CIRCUNFERENCIA } as CSSProperties}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 flex items-center justify-center font-heading text-sm font-bold">
        {hechas}/{total}
      </span>
    </div>
  );
}
