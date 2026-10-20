import { cn } from "@/lib/utils";

/**
 * Funes shield drawn from the white, higher-resolution PNG (tutor review
 * 2026-10-20) as a CSS mask, so it takes the current text color: brand green
 * on the header, a faint watermark on dark panels. Decorative only; the
 * text next to it names the site.
 */
export function Escudo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: "url(/marca/escudo-blanco.png)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
