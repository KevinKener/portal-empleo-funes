import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, Clock } from "lucide-react";
import type { OfertaPublica } from "@/lib/ofertas";
import { ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";

/** Summary card of a published offer; the whole card links to its detail. */
export function TarjetaOferta({ oferta }: { oferta: OfertaPublica }) {
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md focus-within:ring-3 focus-within:ring-ring/50">
      {oferta.categoria_nombre && (
        <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {oferta.categoria_nombre}
        </span>
      )}
      <h3 className="font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
        <Link href={`/ofertas/${oferta.id}`} className="outline-none after:absolute after:inset-0">
          {oferta.titulo}
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">{oferta.descripcion}</p>
      <dl className="mt-auto grid gap-1.5 pt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Empresa</dt>
          <BriefcaseBusiness aria-hidden className="size-4 shrink-0" />
          <dd>{oferta.empresa_nombre}</dd>
        </div>
        {oferta.jornada && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Jornada</dt>
            <Clock aria-hidden className="size-4 shrink-0" />
            <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <dt className="sr-only">Publicada</dt>
          <CalendarDays aria-hidden className="size-4 shrink-0" />
          <dd>{formatearFecha(oferta.fecha_publicacion)}</dd>
        </div>
      </dl>
    </article>
  );
}
