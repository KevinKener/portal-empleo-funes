import { Escudo } from "@/components/layout/Escudo";
import { cn } from "@/lib/utils";

/**
 * Moving brand background for the dark-green panels (landing hero, sign-in
 * and sign-up): two Funes shields drift very slowly and a soft light sweeps
 * across. Decorative, behind the content (-z-10 inside an `isolate` parent),
 * and still when the person asked for reduced motion (WCAG 2.2.2 / C39).
 */
export function FondoMarca({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute -top-1/3 -left-1/4 size-[70%] rounded-full bg-primary/60 blur-3xl motion-safe:animate-luz" />
      <Escudo className="absolute -right-[8%] -bottom-[30%] size-[26rem] text-primary-foreground/[0.06] motion-safe:animate-deriva sm:size-[34rem]" />
      <Escudo className="absolute top-[8%] right-[38%] hidden size-40 text-primary-foreground/[0.04] motion-safe:animate-deriva-lenta lg:block" />
    </div>
  );
}
