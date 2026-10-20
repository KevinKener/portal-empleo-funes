import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, CalendarDays, Clock, Tag } from "lucide-react";
import { AccionesOferta } from "@/components/empresa/AccionesOferta";
import { EtiquetaEstadoOferta } from "@/components/empresa/EtiquetaEstadoOferta";
import { requerirRol } from "@/lib/auth";
import { ESTADO_OFERTA_PARA_EMPRESA, ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import { obtenerEmpresaActual, obtenerOfertaEmpresa } from "@/lib/ofertas-empresa";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same offer.
const cargar = cache(async (id: string) => {
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  const oferta = empresa && esUuid(id) ? await obtenerOfertaEmpresa(empresa.id, id) : null;
  return { empresa, oferta };
});

export async function generateMetadata({ params }: PageProps<"/empresa/ofertas/[id]">): Promise<Metadata> {
  const { oferta } = await cargar((await params).id);
  return { title: oferta?.titulo ?? "Oferta no encontrada" };
}

/** One offer of the company: its content, status in plain words and what can be done next. */
export default async function OfertaEmpresaPage({ params }: PageProps<"/empresa/ofertas/[id]">) {
  const { empresa, oferta } = await cargar((await params).id);
  if (!empresa || !oferta) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/empresa/ofertas" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
        <ArrowLeft aria-hidden className="size-4" /> Mis ofertas
      </Link>

      <section aria-label="Estado de la oferta" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-2">
          <EtiquetaEstadoOferta estado={oferta.estado} />
          <p className="text-sm text-muted-foreground">{ESTADO_OFERTA_PARA_EMPRESA[oferta.estado].detalle}</p>
          {oferta.estado === "rechazada" && oferta.motivo_rechazo && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="font-medium">Motivo de la Oficina de Empleo</p>
              <p className="mt-1 whitespace-pre-line">{oferta.motivo_rechazo}</p>
            </div>
          )}
        </div>
        <AccionesOferta id={oferta.id} estado={oferta.estado} puedeCrear={empresa.estado === "verificado"} />
      </section>

      <article className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8">
        <header className="space-y-3">
          <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">{oferta.titulo}</h1>
          <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {oferta.categoria_nombre && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Rubro</dt>
                <Tag aria-hidden className="size-4" />
                <dd>{oferta.categoria_nombre}</dd>
              </div>
            )}
            <div className="flex items-center gap-2">
              <dt className="sr-only">Jornada</dt>
              <Clock aria-hidden className="size-4" />
              <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
            </div>
            {oferta.fecha_publicacion && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Publicada</dt>
                <CalendarDays aria-hidden className="size-4" />
                <dd>Publicada el {formatearFecha(oferta.fecha_publicacion)}</dd>
              </div>
            )}
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
      </article>
    </div>
  );
}
