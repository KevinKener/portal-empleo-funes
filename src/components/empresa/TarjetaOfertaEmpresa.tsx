import Link from "next/link";
import { CalendarDays, Clock, Tag, Users } from "lucide-react";
import { EtiquetaEstadoOferta } from "@/components/empresa/EtiquetaEstadoOferta";
import { ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import type { ResumenCandidatos } from "@/lib/candidatos-empresa";
import type { OfertaEmpresa } from "@/lib/ofertas-empresa";
import { cn } from "@/lib/utils";

// Left stripe by status: the list reads at a glance (live = brand green, rejected = red)
const FRANJA: Record<OfertaEmpresa["estado"], string> = {
  borrador: "border-l-border",
  pendiente: "border-l-primary/40",
  publicada: "border-l-primary",
  rechazada: "border-l-destructive",
  cerrada: "border-l-muted-foreground/40",
};

type PropsTarjetaOfertaEmpresa = {
  oferta: OfertaEmpresa;
  /** Pre-selected candidates of this offer; undefined when there are none. */
  candidatos?: ResumenCandidatos;
};

/**
 * One offer in the company's list; the whole card links to its page.
 * Shows how many candidates arrived so the company does not open each offer.
 */
export function TarjetaOfertaEmpresa({ oferta, candidatos }: PropsTarjetaOfertaEmpresa) {
  // Applications only exist once the offer was published (Rule 2).
  const muestraCandidatos = oferta.estado === "publicada" || oferta.estado === "cerrada";
  const total = candidatos?.total ?? 0;
  const fecha =
    oferta.estado === "publicada"
      ? `Publicada el ${formatearFecha(oferta.fecha_publicacion)}`
      : `Último cambio el ${formatearFecha(oferta.updated_at)}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-2xl border border-l-4 border-border bg-card p-5 transition-[box-shadow,translate] duration-200 ease-out focus-within:ring-3 focus-within:ring-ring/50 hover:shadow-xl hover:shadow-primary/[0.07] motion-safe:hover:-translate-y-0.5",
        FRANJA[oferta.estado],
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EtiquetaEstadoOferta estado={oferta.estado} />
        {candidatos && candidatos.porRevisar > 0 && (
          <span className="rounded-full border border-primary px-2.5 py-0.5 text-xs font-medium text-primary">
            {candidatos.porRevisar === 1 ? "1 por revisar" : `${candidatos.porRevisar} por revisar`}
          </span>
        )}
      </div>
      <h2 className="font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
        <Link href={`/empresa/ofertas/${oferta.id}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
          {oferta.titulo}
        </Link>
      </h2>
      {oferta.estado === "rechazada" && oferta.motivo_rechazo && (
        <p className="line-clamp-2 text-sm text-destructive">Motivo: {oferta.motivo_rechazo}</p>
      )}
      <dl className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
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
        {muestraCandidatos && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Candidatos</dt>
            <Users aria-hidden className="size-4 shrink-0" />
            <dd className={total > 0 ? "font-medium text-foreground" : undefined}>
              {total === 0 ? "Sin candidatos aún" : total === 1 ? "1 candidato" : `${total} candidatos`}
            </dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <dt className="sr-only">Fecha</dt>
          <CalendarDays aria-hidden className="size-4 shrink-0" />
          <dd>{fecha}</dd>
        </div>
      </dl>
    </article>
  );
}
