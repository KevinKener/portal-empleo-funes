import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache, ViewTransition, type CSSProperties } from "react";
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, FileText, ListChecks, Share2 } from "lucide-react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { Revelar } from "@/components/layout/Revelar";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { AccionPostular } from "@/components/ofertas/AccionPostular";
import { TextoOferta } from "@/components/ofertas/TextoOferta";
import { nombreTransicionOferta } from "@/components/ofertas/TarjetaOferta";
import { insigniasOferta } from "@/lib/insignias-oferta";
import { urlLogo } from "@/lib/logo-empresa";
import { obtenerOfertaPublica } from "@/lib/ofertas";
import { ahora, ETIQUETAS_JORNADA, formatearFecha } from "@/lib/formato";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same offer.
const cargarOferta = cache(async (id: string) => (esUuid(id) ? obtenerOfertaPublica(id) : null));

export async function generateMetadata({ params }: PageProps<"/ofertas/[id]">): Promise<Metadata> {
  const oferta = await cargarOferta((await params).id);
  if (!oferta) return { title: "Oferta no encontrada" };
  // What WhatsApp shows under the preview image (opengraph-image.tsx next to this page)
  const resumen = [oferta.empresa_nombre, oferta.descripcion?.split("\n")[0]].filter(Boolean).join(" · ").slice(0, 180);
  return {
    title: oferta.titulo,
    description: resumen,
    openGraph: { title: `${oferta.titulo} · Portal de Empleo Funes`, description: resumen },
  };
}

const VIDRIO = "flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3.5 py-1.5 backdrop-blur-sm";
const TARJETA = "space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-primary/[0.03] sm:p-7";
const TITULO_SECCION = "flex items-center gap-3 font-heading text-xl font-semibold";
const ICONO_SECCION = "flex size-10 items-center justify-center rounded-xl bg-secondary text-primary";

// What happens after applying (Rule 1: the Office is always in the middle)
const DESPUES = [
  "La Oficina de Empleo revisa tu perfil.",
  "Si encaja, se lo presenta a la empresa.",
  "La empresa te contacta para una entrevista.",
];

/**
 * WhatsApp share link with the offer's full URL, built from the request's
 * host (no site-URL variable needed). Only public data: title and link.
 */
async function enlaceWhatsapp(titulo: string, ruta: string): Promise<string> {
  const encabezados = await headers();
  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host") ?? "";
  const protocolo = encabezados.get("x-forwarded-proto") ?? "https";
  const texto = `${titulo}, en el Portal de Empleo de Funes: ${protocolo}://${host}${ruta}`;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export default async function OfertaDetallePage({ params }: PageProps<"/ofertas/[id]">) {
  const { id } = await params;
  // Rule 2: drafts, pending and closed offers look exactly like missing ones.
  const oferta = await cargarOferta(id);
  if (!oferta) notFound();

  const empresa = oferta.empresa_nombre ?? "";
  const compartir = await enlaceWhatsapp(oferta.titulo ?? "Oferta de trabajo", `/ofertas/${id}`);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="relative isolate overflow-hidden rounded-3xl bg-primary-deep px-6 py-8 text-primary-foreground sm:px-10 sm:py-12">
        <FondoMarca compacto />
        <div className="space-y-6 motion-safe:animate-entrada">
          <Link
            href="/ofertas"
            className="group inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
          >
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" /> Volver a las ofertas
          </Link>

          <div className="flex items-center gap-3">
            {/* Company logo or initial, as on the offer cards */}
            <LogoEmpresa nombre={empresa} logo={urlLogo(oferta.empresa_logo_url)} tamanio="md" className="shadow-lg shadow-black/20 ring-0" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{empresa}</p>
              {oferta.categoria_nombre && <p className="truncate text-sm text-primary-foreground/80">{oferta.categoria_nombre}</p>}
            </div>
          </div>

          <InsigniasOferta insignias={insigniasOferta(oferta, ahora(), 3)} sobreOscuro />

          <h1 className="max-w-3xl font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            <ViewTransition name={nombreTransicionOferta(oferta.id)} share="morph" default="none">
              <span>{oferta.titulo}</span>
            </ViewTransition>
          </h1>

          <dl className="flex flex-wrap gap-2 text-sm">
            {oferta.jornada && (
              <div className={VIDRIO}>
                <dt className="sr-only">Jornada</dt>
                <Clock aria-hidden className="size-4" />
                <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
              </div>
            )}
            <div className={VIDRIO}>
              <dt className="sr-only">Publicada</dt>
              <CalendarDays aria-hidden className="size-4" />
              <dd>Publicada el {formatearFecha(oferta.fecha_publicacion)}</dd>
            </div>
            <div className={VIDRIO}>
              <dt className="sr-only">Revisión</dt>
              <BadgeCheck aria-hidden className="size-4" />
              <dd>Revisada por la Oficina de Empleo</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="space-y-6">
          <Revelar>
            <section aria-labelledby="titulo-descripcion" className={TARJETA}>
              <h2 id="titulo-descripcion" className={TITULO_SECCION}>
                <span className={ICONO_SECCION}>
                  <FileText aria-hidden className="size-5" />
                </span>
                Sobre el puesto
              </h2>
              <TextoOferta texto={oferta.descripcion ?? ""} />
            </section>
          </Revelar>

          {oferta.requisitos && (
            <Revelar retraso={80}>
              <section aria-labelledby="titulo-requisitos" className={TARJETA}>
                <h2 id="titulo-requisitos" className={TITULO_SECCION}>
                  <span className={ICONO_SECCION}>
                    <ListChecks aria-hidden className="size-5" />
                  </span>
                  Requisitos
                </h2>
                <TextoOferta texto={oferta.requisitos} tilde />
              </section>
            </Revelar>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-label="Postulación" className={`${TARJETA} motion-safe:animate-entrada`} style={{ "--retraso": "150ms" } as CSSProperties}>
            <h2 className="font-heading text-lg font-semibold">¿Te interesa?</h2>
            {/* AccionPostular brings its own top border for the old layout; the card already separates it */}
            <div className="[&>*]:border-t-0 [&>*]:pt-0">
              <AccionPostular ofertaId={id} />
            </div>
          </section>

          <section aria-labelledby="titulo-despues" className="space-y-3 rounded-2xl bg-secondary p-5 text-secondary-foreground sm:p-6">
            <h2 id="titulo-despues" className="font-heading font-semibold">Qué pasa después</h2>
            <ol className="space-y-2.5 text-sm">
              {DESPUES.map((paso, i) => (
                <li key={paso} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </section>

          <a
            href={compartir}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card font-semibold text-foreground transition-[border-color,background-color] hover:border-primary/40 hover:bg-accent"
          >
            <Share2 aria-hidden className="size-4 text-primary transition-transform group-hover:scale-110" />
            Compartir por WhatsApp
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        </aside>
      </div>
    </div>
  );
}
