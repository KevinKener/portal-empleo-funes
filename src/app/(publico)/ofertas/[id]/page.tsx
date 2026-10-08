import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock } from "lucide-react";
import { obtenerOfertaPublica } from "@/lib/ofertas";
import { ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same offer.
const cargarOferta = cache(async (id: string) => (esUuid(id) ? obtenerOfertaPublica(id) : null));

export async function generateMetadata({ params }: PageProps<"/ofertas/[id]">): Promise<Metadata> {
  const oferta = await cargarOferta((await params).id);
  return { title: oferta?.titulo ?? "Oferta no encontrada" };
}

export default async function OfertaDetallePage({ params }: PageProps<"/ofertas/[id]">) {
  const { id } = await params;
  // Rule 2: drafts, pending and closed offers look exactly like missing ones.
  const oferta = await cargarOferta(id);
  if (!oferta) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      <Link href="/ofertas" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft aria-hidden className="size-4" /> Volver a las ofertas
      </Link>

      <article className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-8">
        <header className="space-y-3">
          {oferta.categoria_nombre && (
            <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {oferta.categoria_nombre}
            </span>
          )}
          <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">{oferta.titulo}</h1>
          <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Empresa</dt>
              <BriefcaseBusiness aria-hidden className="size-4" />
              <dd>{oferta.empresa_nombre}</dd>
            </div>
            {oferta.jornada && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Jornada</dt>
                <Clock aria-hidden className="size-4" />
                <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
              </div>
            )}
            <div className="flex items-center gap-2">
              <dt className="sr-only">Publicada</dt>
              <CalendarDays aria-hidden className="size-4" />
              <dd>Publicada el {formatearFecha(oferta.fecha_publicacion)}</dd>
            </div>
          </dl>
        </header>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-semibold">Descripción</h2>
          <p className="whitespace-pre-line text-foreground/90">{oferta.descripcion}</p>
        </section>

        {oferta.requisitos && (
          <section className="space-y-2">
            <h2 className="font-heading text-lg font-semibold">Requisitos</h2>
            <p className="whitespace-pre-line text-foreground/90">{oferta.requisitos}</p>
          </section>
        )}

        <div className="space-y-2 border-t border-border pt-6">
          {/* TODO(phase-3): send to login (or apply directly with a session) once auth exists. */}
          <button
            type="button"
            disabled
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Postularme
          </button>
          <p className="text-sm text-muted-foreground">
            Muy pronto vas a poder registrarte y postularte desde acá. La Oficina de Empleo revisa cada postulación
            antes de enviarla a la empresa.
          </p>
        </div>
      </article>
    </div>
  );
}
