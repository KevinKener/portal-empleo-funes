import type { Metadata } from "next";
import Link from "next/link";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CalendarClock, CalendarDays, Clock, Tag, Users } from "lucide-react";
import { AccionesOferta } from "@/components/empresa/AccionesOferta";
import { TextoOferta } from "@/components/ofertas/TextoOferta";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { EtiquetaEstadoOferta } from "@/components/empresa/EtiquetaEstadoOferta";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { contarCandidatos } from "@/lib/candidatos-empresa";
import { CIERRE, diasParaCierre, formatearDia, ofertaVencida, textoCierre } from "@/lib/cierre-oferta";
import { ahora, ESTADO_OFERTA_PARA_EMPRESA, ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import { obtenerEmpresaActual, obtenerOfertaEmpresa } from "@/lib/ofertas-empresa";
import { esUuid } from "@/lib/validaciones/ofertas";
import type { OfertaEmpresa } from "@/lib/ofertas-empresa";
import { cn } from "@/lib/utils";

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
  // Applications only exist once the offer was published (Rule 2).
  const conPostulaciones = oferta.estado === "publicada" || oferta.estado === "cerrada";
  const candidatos = conPostulaciones ? await contarCandidatos(oferta.id) : 0;

  return (
    <div className="space-y-6">
      <EnlaceVolver href="/empresa/ofertas" texto="Mis ofertas" />

      {/* Status and actions go first on phones and to the side from lg, so the offer text gets the width */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:order-last">
          <section aria-label="Estado de la oferta" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <EtiquetaEstadoOferta estado={oferta.estado} />
                {oferta.prioridad === "urgente" && <InsigniasOferta insignias={["urgente"]} />}
              </div>
              <p className="text-sm text-muted-foreground">{ESTADO_OFERTA_PARA_EMPRESA[oferta.estado].detalle}</p>
              <Cierre oferta={oferta} momento={ahora()} />
              {oferta.estado === "rechazada" && oferta.motivo_rechazo && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <p className="font-medium">Motivo de la Oficina de Empleo</p>
                  <p className="mt-1 whitespace-pre-line">{oferta.motivo_rechazo}</p>
                </div>
              )}
            </div>
            <AccionesOferta id={oferta.id} estado={oferta.estado} puedeCrear={empresa.estado === "verificado"} />
          </section>

          {conPostulaciones && (
            <section aria-label="Candidatos" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:flex-col lg:items-stretch">
              <p className="text-sm text-muted-foreground">
                {candidatos === 0
                  ? "La Oficina de Empleo todavía no te preseleccionó candidatos."
                  : `La Oficina de Empleo te preseleccionó ${candidatos === 1 ? "1 candidato" : `${candidatos} candidatos`}.`}
              </p>
              <Link
                href={`/empresa/ofertas/${oferta.id}/candidatos`}
                className={buttonVariants({ className: "h-11 shrink-0 px-5 text-base hover:bg-primary-hover" })}
              >
                <Users aria-hidden /> Ver candidatos ({candidatos})
              </Link>
            </section>
          )}
        </aside>

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
            <TextoOferta texto={oferta.descripcion} />
          </section>

          {oferta.requisitos && (
            <section className="space-y-2">
              <h2 className="font-heading text-lg font-semibold">Requisitos</h2>
              <TextoOferta texto={oferta.requisitos} tilde />
            </section>
          )}
        </article>
      </div>
    </div>
  );
}

/**
 * Until when the offer takes applications. Once expired it is out of the
 * portal; only the Office extends it (decision 2026-10-21).
 */
function Cierre({ oferta, momento }: { oferta: OfertaEmpresa; momento: number }) {
  if (oferta.estado === "rechazada" || oferta.estado === "cerrada") return null;
  if (oferta.estado !== "publicada") {
    return (
      <p className="flex gap-2 text-sm text-muted-foreground">
        <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        {oferta.fecha_cierre
          ? `Una vez publicada, recibe postulaciones hasta el ${formatearDia(oferta.fecha_cierre)}.`
          : `Una vez publicada, recibe postulaciones durante ${CIERRE.porDefecto} días.`}
      </p>
    );
  }
  if (!oferta.fecha_cierre) return null;
  const vencida = ofertaVencida(oferta, momento);
  const pronto = diasParaCierre(oferta.fecha_cierre, momento) <= CIERRE.pronto;
  return (
    <div className={cn("rounded-lg px-3 py-2.5 text-sm", pronto ? "bg-aviso-suave text-aviso" : "bg-muted text-foreground/85")}>
      <p className="flex items-center gap-2 font-semibold">
        <CalendarClock aria-hidden className="size-4 shrink-0" />
        {textoCierre(oferta.fecha_cierre, momento)}
      </p>
      <p className="mt-1">
        {vencida
          ? "Ya no se ve en el portal ni recibe postulaciones. Si todavía buscás, pedile a la Oficina de Empleo que la extienda."
          : `Recibe postulaciones hasta el ${formatearDia(oferta.fecha_cierre)} inclusive.`}
      </p>
    </div>
  );
}
