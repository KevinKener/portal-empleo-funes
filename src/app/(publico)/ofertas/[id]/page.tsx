import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache, type CSSProperties } from "react";
import { ArrowLeft, BadgeCheck, CalendarClock, CalendarDays, Clock, Share2 } from "lucide-react";
import { AccionPostular } from "@/components/ofertas/AccionPostular";
import { CabeceraOferta, SeccionesOferta, TARJETA_OFERTA, VIDRIO } from "@/components/ofertas/DetalleOferta";
import { formatearDia } from "@/lib/cierre-oferta";
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
      <CabeceraOferta
        id={oferta.id ?? id}
        titulo={oferta.titulo ?? ""}
        empresa={empresa}
        logo={urlLogo(oferta.empresa_logo_url)}
        categoria={oferta.categoria_nombre}
        insignias={insigniasOferta(oferta, ahora(), 3)}
        morph
        arriba={
          <Link
            href="/ofertas"
            className="group inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
          >
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" /> Volver a las ofertas
          </Link>
        }
        datos={
          <>
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
            {oferta.fecha_cierre && (
              <div className={VIDRIO}>
                <dt className="sr-only">Cierre</dt>
                <CalendarClock aria-hidden className="size-4" />
                <dd>Recibe postulaciones hasta el {formatearDia(oferta.fecha_cierre)}</dd>
              </div>
            )}
            <div className={VIDRIO}>
              <dt className="sr-only">Revisión</dt>
              <BadgeCheck aria-hidden className="size-4" />
              <dd>Revisada por la Oficina de Empleo</dd>
            </div>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <SeccionesOferta descripcion={oferta.descripcion ?? ""} requisitos={oferta.requisitos} />

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-label="Postulación" className={`${TARJETA_OFERTA} motion-safe:animate-entrada`} style={{ "--retraso": "150ms" } as CSSProperties}>
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
