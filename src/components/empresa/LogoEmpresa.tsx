import { cn } from "@/lib/utils";

const TAMANIOS = {
  sm: "size-11 text-lg rounded-xl",
  md: "size-12 text-xl rounded-2xl",
  lg: "size-24 text-4xl rounded-3xl",
};

/**
 * A company's logo, or its initial on the brand's soft green when it has none
 * (same idea as the job seeker's Avatar). Decorative: the company name is
 * always written next to it. `redondo` for the round frame of the greeting band.
 */
export function LogoEmpresa({
  nombre,
  logo,
  tamanio = "md",
  redondo = false,
  className,
}: {
  nombre: string;
  /** Public URL from urlLogo(), or null for the initial. */
  logo?: string | null;
  tamanio?: keyof typeof TAMANIOS;
  redondo?: boolean;
  className?: string;
}) {
  const forma = cn(TAMANIOS[tamanio], redondo && "rounded-full");

  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- public Storage URL, already a small square JPEG
      <img src={logo} alt="" aria-hidden className={cn("shrink-0 bg-white object-contain ring-1 ring-border", forma, className)} />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-secondary font-heading font-semibold text-secondary-foreground",
        forma,
        className,
      )}
    >
      {nombre.trim().charAt(0).toLocaleUpperCase("es-AR") || "?"}
    </span>
  );
}
