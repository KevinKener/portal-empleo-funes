import Link from "next/link";
import { CalendarDays, Clock, Tag } from "lucide-react";
import { EtiquetaEstadoOferta } from "@/components/empresa/EtiquetaEstadoOferta";
import { ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import type { OfertaEmpresa } from "@/lib/ofertas-empresa";

/** One offer in the company's list; the whole card links to its page. */
export function TarjetaOfertaEmpresa({ oferta }: { oferta: OfertaEmpresa }) {
  const fecha =
    oferta.estado === "publicada"
      ? `Publicada el ${formatearFecha(oferta.fecha_publicacion)}`
      : `Último cambio el ${formatearFecha(oferta.updated_at)}`;

  return (
    <article className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md focus-within:ring-3 focus-within:ring-ring/50">
      <EtiquetaEstadoOferta estado={oferta.estado} />
      <h2 className="font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
        <Link href={`/empresa/ofertas/${oferta.id}`} className="outline-none after:absolute after:inset-0">
          {oferta.titulo}
        </Link>
      </h2>
      {oferta.estado === "rechazada" && oferta.motivo_rechazo && (
        <p className="line-clamp-2 text-sm text-destructive">Motivo: {oferta.motivo_rechazo}</p>
      )}
      <dl className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-3">
        {oferta.categoria_nombre && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Rubro</dt>
            <Tag aria-hidden className="size-4 shrink-0" />
            <dd>{oferta.categoria_nombre}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <dt className="sr-only">Jornada</dt>
          <Clock aria-hidden className="size-4 shrink-0" />
          <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Fecha</dt>
          <CalendarDays aria-hidden className="size-4 shrink-0" />
          <dd>{fecha}</dd>
        </div>
      </dl>
    </article>
  );
}
