import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { cn } from "@/lib/utils";

export type CifraSeccion = {
  /** A number counts up from 0; a text ("2 de 3", "Verificado") is shown as is. */
  valor: number | string;
  texto: string;
  /** The list filtered to these items. */
  href?: string;
  /** Work waiting for the Office: a white tile that stands out. */
  destacada?: boolean;
};

type PropsBandaSeccion = {
  titulo: string;
  /** Optional line under the title. The Office's sections go without it (team feedback); job seekers' pages keep a short one. */
  descripcion?: ReactNode;
  cifras?: CifraSeccion[];
  /** The next thing to do, e.g. "Verificar la próxima". */
  accion?: { href: string; texto: string } | null;
};

/**
 * Heading band of a section inside a private area (the Office's sections,
 * the job seeker's pages): the area homes' dark green and shield, lower, with
 * the title, optional figures that open a filtered list and the next action.
 * Every section opens saying where it stands (docs/research/admin.md §4.3). Every section opens saying what there
 * is to do (docs/research/admin.md §4.3).
 */
export function BandaSeccion({ titulo, descripcion, cifras = [], accion }: PropsBandaSeccion) {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl bg-primary-deep px-5 py-6 text-primary-foreground sm:px-8 sm:py-7">
      <FondoMarca compacto />
      <div className="flex flex-col gap-4 motion-safe:animate-entrada sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="font-heading text-3xl font-bold text-balance">{titulo}</h1>
          {descripcion && <div className="max-w-2xl text-primary-foreground/85">{descripcion}</div>}
        </div>
        {accion && (
          <Link
            href={accion.href}
            className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-foreground px-5 text-sm font-semibold text-primary-deep shadow-lg shadow-black/20 transition-[translate,box-shadow] hover:shadow-xl motion-safe:hover:-translate-y-0.5"
          >
            {accion.texto}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Three figures fit in one row even on phones; four go 2 × 2 until lg */}
      {cifras.length > 0 && (
        <ul className={cn("mt-5 grid gap-2 sm:gap-3", cifras.length === 4 ? "grid-cols-2 lg:grid-cols-4" : cifras.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {cifras.map((cifra, i) => {
            const contenido = (
              <>
                {typeof cifra.valor === "number" ? (
                  <>
                    <span
                      aria-hidden
                      className="contador block font-heading text-2xl leading-none font-bold sm:text-3xl"
                      style={{ "--hasta": cifra.valor, "--retraso": `${i * 80}ms` } as CSSProperties}
                    />
                    <span className="sr-only">{cifra.valor} </span>
                  </>
                ) : (
                  <span className="block font-heading text-xl leading-tight font-bold sm:text-2xl">{cifra.valor}</span>
                )}
                <span className={cn("mt-1.5 block text-sm leading-tight", cifra.destacada ? "text-primary-deep/80" : "text-primary-foreground/80")}>{cifra.texto}</span>
              </>
            );
            const clase = cn(
              "block h-full rounded-xl px-3 py-3 transition-colors sm:px-4",
              cifra.destacada ? "bg-primary-foreground text-primary-deep shadow-md shadow-black/15" : "bg-primary-foreground/10 hover:bg-primary-foreground/15",
            );
            return (
              <li key={cifra.texto} className="min-w-0">
                {cifra.href ? (
                  <Link href={cifra.href} className={cn(clase, "focus-visible:ring-3 focus-visible:ring-primary-foreground/60 focus-visible:outline-none", cifra.destacada && "hover:bg-primary-foreground/90")}>
                    {contenido}
                  </Link>
                ) : (
                  <div className={clase}>{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
