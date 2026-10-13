import { cn } from "@/lib/utils";

const TAMANIOS = {
  md: "size-12 text-base",
  lg: "size-20 text-2xl",
};

/** First letter of the first and last name ("María José Pérez" → "MP"). */
function iniciales(nombre: string, apellido?: string | null): string {
  const primera = (texto?: string | null) => texto?.trim().charAt(0).toLocaleUpperCase("es-AR") ?? "";
  return primera(nombre) + primera(apellido) || "?";
}

/**
 * The job seeker's avatar: initials on the brand color. Decorative (the name
 * is always written next to it), so it is hidden from screen readers.
 */
export function Avatar({ nombre, apellido, tamanio = "md" }: { nombre: string; apellido?: string | null; tamanio?: keyof typeof TAMANIOS }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-heading font-semibold text-primary-foreground",
        TAMANIOS[tamanio],
      )}
    >
      {iniciales(nombre, apellido)}
    </span>
  );
}
