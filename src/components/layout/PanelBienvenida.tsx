import type { ReactNode } from "react";
import { FondoMarca } from "@/components/layout/FondoMarca";

type PropsBandaBienvenida = {
  saludo: string;
  /** One line under the greeting: what the area is for, or where the person stands. */
  descripcion: ReactNode;
  /** Shown before the greeting (the job seeker's avatar). */
  inicio?: ReactNode;
};

/**
 * Greeting band of an area's home, on the brand's dark green with the Funes
 * shield as a watermark: the one bold piece of the private areas, so a
 * signed-in person always knows this is the municipal portal.
 */
export function BandaBienvenida({ saludo, descripcion, inicio }: PropsBandaBienvenida) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-primary-deep px-5 py-7 text-primary-foreground sm:px-8 sm:py-9">
      <FondoMarca compacto />
      <div className="flex items-center gap-4 motion-safe:animate-entrada sm:gap-6">
        {inicio && (
          // White frame around the photo, with a dotted ring turning slowly around it
          <div className="relative shrink-0 p-2">
            <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full text-primary-foreground/50 motion-safe:animate-giro">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
            </svg>
            <div className="rounded-full bg-primary-foreground p-1 shadow-xl shadow-black/30">{inicio}</div>
          </div>
        )}
        <div className="min-w-0 space-y-1.5">
          <h1 className="font-heading text-2xl font-bold text-balance sm:text-4xl">{saludo}</h1>
          <div className="max-w-2xl text-base text-primary-foreground/90 sm:text-lg">{descripcion}</div>
        </div>
      </div>
    </div>
  );
}

/** Heading band of a private area's home, with notices or next steps below. */
export function PanelBienvenida({ saludo, descripcion, children }: { saludo: string; descripcion: string; children?: ReactNode }) {
  return (
    <div className="space-y-6">
      <BandaBienvenida saludo={saludo} descripcion={<p>{descripcion}</p>} />
      {children}
    </div>
  );
}
