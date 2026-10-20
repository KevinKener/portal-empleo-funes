import Image from "next/image";
import { ENCUADRE_INICIAL, estiloEncuadre, type Encuadre } from "@/lib/encuadre";
import { cn } from "@/lib/utils";

const TAMANIOS = {
  md: { clase: "size-12 text-base", px: 48 },
  lg: { clase: "size-24 text-3xl", px: 96 },
};

/** First letter of the first and last name ("María José Pérez" → "MP"). */
function iniciales(nombre: string, apellido?: string | null): string {
  const primera = (texto?: string | null) => texto?.trim().charAt(0).toLocaleUpperCase("es-AR") ?? "";
  return primera(nombre) + primera(apellido) || "?";
}

/**
 * The job seeker's avatar: their photo, or initials on the brand color.
 * Decorative (the name is always written next to it), so it is hidden from
 * screen readers.
 */
export function Avatar({
  nombre,
  apellido,
  foto,
  encuadre = ENCUADRE_INICIAL,
  tamanio = "md",
}: {
  nombre: string;
  apellido?: string | null;
  /** Signed URL from urlFotoPerfil(), or null for initials. */
  foto?: string | null;
  /** How the person framed the photo (postulantes.foto_x / foto_y / foto_zoom). */
  encuadre?: Encuadre;
  tamanio?: keyof typeof TAMANIOS;
}) {
  const { clase, px } = TAMANIOS[tamanio];

  if (foto) {
    return (
      // The frame clips the zoomed photo
      <span aria-hidden className={cn("block shrink-0 overflow-hidden rounded-full bg-muted", clase)}>
        {/* unoptimized: the signed URL is private and short-lived, it must not go through the image cache */}
        <Image src={foto} alt="" width={px * 2} height={px * 2} unoptimized className="size-full" style={estiloEncuadre(encuadre)} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-heading font-semibold text-primary-foreground",
        clase,
      )}
    >
      {iniciales(nombre, apellido)}
    </span>
  );
}
