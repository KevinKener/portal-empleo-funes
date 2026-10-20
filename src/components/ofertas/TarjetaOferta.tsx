import { ViewTransition } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { OfertaPublica } from "@/lib/ofertas";
import { ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";

const DIAS_NUEVA = 3;

/**
 * Published in the last few days: worth a "Nueva" badge so returning visitors
 * spot it. Server Component, so "now" is the time of the request.
 */
function esNueva(fecha: string | null): boolean {
  return fecha !== null && Date.now() - new Date(fecha).getTime() < DIAS_NUEVA * 24 * 60 * 60 * 1000;
}

/** Name for the title's morph into the offer page (shared with the offer page). */
export const nombreTransicionOferta = (id: string | null) => `oferta-${id}`;

/**
 * Summary card of a published offer; the whole card links to its detail and
 * its title morphs into the detail page's heading. Lifts slightly on hover
 * because it is a link (only clickable cards move).
 */
export function TarjetaOferta({ oferta }: { oferta: OfertaPublica }) {
  const empresa = oferta.empresa_nombre ?? "";

  return (
    <article className="group relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 pt-6 shadow-sm shadow-primary/[0.04] transition-[border-color,box-shadow,translate] duration-200 ease-out focus-within:ring-3 focus-within:ring-ring/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.1] motion-safe:hover:-translate-y-1 sm:p-6 sm:pt-7">
      {/* Brand stripe on top that grows from the left on hover */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-border" />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-[0.35] bg-gradient-to-r from-primary to-primary/50 transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      {/* A shine crosses the card once on hover */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl">
        <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/[0.07] to-transparent opacity-0 group-hover:opacity-100 motion-safe:group-hover:animate-brillo" />
      </span>

      <div className="flex items-start gap-3">
        {/* Company monogram: a quick visual anchor when scanning many cards */}
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-heading text-lg font-semibold text-secondary-foreground transition-[background-color,color,rotate,scale] duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-6"
        >
          {empresa.trim().charAt(0).toLocaleUpperCase("es-AR") || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{empresa}</p>
          {oferta.categoria_nombre && <p className="truncate text-sm font-medium text-primary">{oferta.categoria_nombre}</p>}
        </div>
        {esNueva(oferta.fecha_publicacion) && (
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Nueva</span>
        )}
      </div>

      <h3 className="font-heading text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
        <Link href={`/ofertas/${oferta.id}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
          <ViewTransition name={nombreTransicionOferta(oferta.id)} share="morph" default="none">
            <span>{oferta.titulo}</span>
          </ViewTransition>
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">{oferta.descripcion}</p>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
        {/* One fact per line, so every card in a row ends at the same height */}
        <dl className="grid gap-1.5">
          {oferta.jornada && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Jornada</dt>
              <Clock aria-hidden className="size-4 shrink-0" />
              <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Publicada</dt>
            <CalendarDays aria-hidden className="size-4 shrink-0" />
            <dd>{formatearFecha(oferta.fecha_publicacion)}</dd>
          </div>
        </dl>
        <ArrowRight
          aria-hidden
          className="size-5 shrink-0 text-primary opacity-0 transition-[opacity,translate] duration-200 group-hover:opacity-100 motion-safe:-translate-x-1 motion-safe:group-hover:translate-x-0"
        />
      </div>
    </article>
  );
}
