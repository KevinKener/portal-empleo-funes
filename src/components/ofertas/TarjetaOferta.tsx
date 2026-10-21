import { ViewTransition } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { insigniasOferta } from "@/lib/insignias-oferta";
import { urlLogo } from "@/lib/logo-empresa";
import type { OfertaPublica } from "@/lib/ofertas";
import { ahora, ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import { cn } from "@/lib/utils";

/** Name for the title's morph into the offer page (shared with the offer page). */
export const nombreTransicionOferta = (id: string | null) => `oferta-${id}`;

/**
 * Summary card of a published offer; the whole card links to its detail and
 * its title morphs into the detail page's heading. Lifts slightly on hover
 * because it is a link (only clickable cards move).
 */
export function TarjetaOferta({ oferta }: { oferta: OfertaPublica }) {
  const empresa = oferta.empresa_nombre ?? "";
  const insignias = insigniasOferta(oferta, ahora());
  const urgente = oferta.prioridad === "urgente";

  return (
    <article className="group relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 pt-6 shadow-sm shadow-primary/[0.04] transition-[border-color,box-shadow,translate] duration-200 ease-out focus-within:ring-3 focus-within:ring-ring/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.1] motion-safe:hover:-translate-y-1 sm:p-6 sm:pt-7">
      {/* Stripe on top that grows from the left on hover; amber and longer on urgent offers */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r transition-transform duration-500 ease-out group-hover:scale-x-100",
          urgente ? "scale-x-[0.45] from-aviso to-aviso/60" : "scale-x-[0.2] from-primary to-primary/60",
        )}
      />
      {/* A shine crosses the card once on hover */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl">
        <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary/[0.035] to-transparent opacity-0 group-hover:opacity-100 motion-safe:group-hover:animate-brillo" />
      </span>

      <div className="flex items-start gap-3">
        {/* Company logo, or its initial: a quick visual anchor when scanning many cards */}
        <LogoEmpresa
          nombre={empresa}
          logo={urlLogo(oferta.empresa_logo_url)}
          tamanio="sm"
          className="transition-[rotate,scale] duration-300 motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-6"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{empresa}</p>
          {oferta.categoria_nombre && <p className="truncate text-sm font-medium text-primary">{oferta.categoria_nombre}</p>}
        </div>
      </div>

      <InsigniasOferta insignias={insignias} className="-mb-1" />

      <h3 className="font-heading text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
        <Link href={`/ofertas/${oferta.id}`} className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-2xl">
          <ViewTransition name={nombreTransicionOferta(oferta.id)} share="morph" default="none">
            <span>{oferta.titulo}</span>
          </ViewTransition>
        </Link>
      </h3>
      <p className="line-clamp-2 text-[0.938rem] leading-relaxed text-foreground/80">{oferta.descripcion}</p>

      {/* Facts as small pills: easy to scan, and every card ends at the same height */}
      <dl className="mt-auto flex flex-wrap gap-2 pt-1 text-sm font-medium text-foreground/85">
        {oferta.jornada && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 transition-colors duration-300 group-hover:bg-secondary">
            <dt className="sr-only">Jornada</dt>
            <Clock aria-hidden className="size-4 shrink-0 text-primary" />
            <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 transition-colors duration-300 group-hover:bg-secondary">
          <dt className="sr-only">Publicada</dt>
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <dd>{formatearFecha(oferta.fecha_publicacion)}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary">
        <span>Ver oferta</span>
        <span className="flex size-8 items-center justify-center rounded-full bg-secondary transition-[background-color,color,translate] duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:translate-x-1">
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </article>
  );
}
