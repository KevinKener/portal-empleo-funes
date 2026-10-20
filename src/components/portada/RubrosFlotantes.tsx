import type { CSSProperties } from "react";

// Hand-placed spots on the hero's right half, so the chips never cover the text.
// The right-hand ones are anchored to the right edge so long names never get cut.
const LUGARES: CSSProperties[] = [
  { top: "14%", left: "8%" },
  { top: "28%", right: "10%" },
  { top: "44%", left: "16%" },
  { top: "58%", right: "6%" },
  { top: "74%", left: "4%" },
  { top: "86%", right: "22%" },
  { top: "6%", right: "4%" },
  { top: "64%", left: "36%" },
];

/**
 * The portal's real categories floating on the hero (from lg): constant,
 * gentle motion that also says what kind of work is here. Each chip bobs on
 * its own rhythm; all of them stand still with reduced motion.
 */
export function RubrosFlotantes({ rubros }: { rubros: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] lg:block">
      {rubros.slice(0, LUGARES.length).map((rubro, i) => (
        <span
          key={rubro}
          className="absolute rounded-full border border-primary-foreground/15 bg-primary-foreground/[0.08] px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground/85 shadow-lg shadow-black/10 backdrop-blur-sm motion-safe:animate-flotar"
          style={
            {
              ...LUGARES[i],
              "--duracion": `${6 + (i % 4) * 1.5}s`,
              "--retraso": `${-i * 1.3}s`,
              "--distancia": `${10 + (i % 3) * 6}px`,
            } as CSSProperties
          }
        >
          {rubro}
        </span>
      ))}
    </div>
  );
}
