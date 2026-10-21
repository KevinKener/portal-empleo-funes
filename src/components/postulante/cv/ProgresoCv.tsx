import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { AnilloProgreso } from "@/components/postulante/AnilloProgreso";

type PropsProgresoCv = {
  /** Sections of the CV built on the platform, with whether they have content. */
  secciones: { titulo: string; hecho: boolean }[];
  /** Whether the CV counts as complete in either format (tieneCv). */
  completo: boolean;
  /** Offer to go back to (?volver), shown as the main action once the CV is complete. */
  oferta: string | null;
};

/**
 * Green banner on top of "Tu CV": a ring with how many sections have
 * something, what is still missing in plain words, and the way back to the
 * offer when the person came from one. Same look as the area homes.
 */
export function ProgresoCv({ secciones, completo, oferta }: PropsProgresoCv) {
  const hechas = secciones.filter((s) => s.hecho).length;
  const faltan = secciones.filter((s) => !s.hecho).map((s) => s.titulo.toLowerCase());

  return (
    <section
      aria-label="Estado de tu CV"
      className="relative isolate overflow-hidden rounded-2xl bg-primary-deep p-5 text-primary-foreground sm:p-6"
    >
      <FondoMarca compacto />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-4 motion-safe:animate-entrada">
        <AnilloProgreso hechas={hechas} total={secciones.length} tono="oscuro" />
        <div className="min-w-0 flex-1 basis-56 space-y-1">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
            {completo && <CircleCheck aria-hidden className="size-5 shrink-0" />}
            {completo ? "Tu CV está listo para postularte" : "Completá tu CV para postularte"}
          </h2>
          <p className="text-primary-foreground/85">
            {completo
              ? faltan.length > 0
                ? `Podés sumar ${faltan.join(" y ")} cuando quieras: cuanto más completo, mejor.`
                : "Tenés todas las secciones completas. ¡Muy bien!"
              : "Escribí unas líneas sobre vos y cargá al menos una experiencia o un estudio. O subí el CV que ya tenés, más abajo."}
          </p>
        </div>
        {oferta && completo && (
          <Link
            href={oferta}
            className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-foreground px-5 font-semibold text-primary-deep shadow-lg shadow-black/20 transition-[background-color,transform] hover:bg-secondary active:scale-[0.98]"
          >
            Volver a la oferta y postularme
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      {oferta && !completo && (
        <p className="mt-4 border-t border-primary-foreground/15 pt-4 text-sm text-primary-foreground/80">
          Cuando tu CV esté completo, te aparece acá el botón para volver a la oferta.
        </p>
      )}
    </section>
  );
}
