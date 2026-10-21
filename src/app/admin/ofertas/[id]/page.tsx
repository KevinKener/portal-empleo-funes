import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type CSSProperties, type ReactNode } from "react";
import { AlarmClock, ArrowRight, BadgeCheck, Building2, CalendarClock, CalendarDays, Clock, Eye, Hash, MapPin, Phone, ShieldAlert, Users } from "lucide-react";
import { AccionesRevision } from "@/components/admin/AccionesRevision";
import { EtiquetaOfertaAdmin } from "@/components/admin/EtiquetaOfertaAdmin";
import { LineaTiempo, type HitoLinea } from "@/components/admin/LineaTiempo";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { CabeceraOferta, SeccionesOferta, VIDRIO } from "@/components/ofertas/DetalleOferta";
import { DIAS_DEMORA, diasEsperando } from "@/lib/admin/bandeja";
import { obtenerOfertaAdmin, siguientePorRevisar, type OfertaAdmin } from "@/lib/admin/ofertas";
import { requerirRol } from "@/lib/auth";
import { CIERRE, diasParaCierre, formatearDia, hoyArgentina, ofertaVencida, textoCierre } from "@/lib/cierre-oferta";
import { ahora, ETIQUETAS_JORNADA, formatearCuit, formatearFecha, formatearMesAnio } from "@/lib/formato";
import { urlLogo } from "@/lib/logo-empresa";
import { cn } from "@/lib/utils";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same offer.
const cargar = cache(async (id: string) => {
  await requerirRol("admin");
  return esUuid(id) ? obtenerOfertaAdmin(id) : null;
});

export async function generateMetadata({ params }: PageProps<"/admin/ofertas/[id]">): Promise<Metadata> {
  const oferta = await cargar((await params).id);
  return { title: oferta ? `Revisar: ${oferta.titulo}` : "Oferta no encontrada" };
}

const TEXTO_ESTADO = {
  pendiente: "La empresa la envió y espera tu revisión. Mientras tanto no puede editarla.",
  publicada: "Se ve en el portal y recibe postulaciones.",
  rechazada: "La empresa ve el motivo y puede usarla como base para una nueva.",
  cerrada: "Ya no se ve en el portal ni recibe postulaciones.",
  borrador: "",
} as const;

const ETAPAS = [
  { estado: "pendiente", texto: "Por revisar" },
  { estado: "preseleccionado", texto: "Preseleccionados" },
  { estado: "entrevista", texto: "En entrevista" },
  { estado: "contratado", texto: "Contratados" },
  { estado: "rechazado", texto: "No seleccionados" },
] as const;

/** The offer's life so far, from the dates the database keeps. */
function hitos(oferta: OfertaAdmin): HitoLinea[] {
  const lista: HitoLinea[] = [{ texto: "La empresa la creó", fecha: oferta.created_at }];
  if (oferta.fecha_envio) lista.push({ texto: "La envió a revisión", fecha: oferta.fecha_envio });
  if (oferta.fecha_publicacion) lista.push({ texto: "La Oficina la publicó", fecha: oferta.fecha_publicacion });
  if (oferta.estado === "rechazada") lista.push({ texto: "La Oficina la rechazó", fecha: oferta.updated_at, tono: "malo" });
  if (oferta.estado === "cerrada") lista.push({ texto: "Se cerró", fecha: oferta.updated_at });
  return lista;
}

/**
 * Review page of the Office (branch B): the offer exactly as job seekers
 * will see it, and at the side its status, history, the company's data (to
 * call before deciding, as other municipal offices do) and the actions.
 */
export default async function RevisarOfertaPage({ params }: PageProps<"/admin/ofertas/[id]">) {
  const { id } = await params;
  const oferta = await cargar(id);
  if (!oferta) notFound();

  const momento = ahora();
  const siguiente = oferta.estado === "pendiente" ? null : await siguientePorRevisar(oferta.id);
  const empresa = oferta.empresa;
  const nombreEmpresa = empresa?.nombre_comercial ?? "Empresa";
  const espera = oferta.estado === "pendiente" ? diasEsperando(oferta.fecha_envio ?? oferta.updated_at, momento) : 0;
  const totalPostulaciones = Object.values(oferta.postulaciones).reduce((suma, n) => suma + n, 0);
  const vencida = ofertaVencida(oferta, momento);

  return (
    <div className="space-y-6">
      <EnlaceVolver href={`/admin/ofertas?estado=${vencida ? "vencida" : oferta.estado}`} texto="Ofertas" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Eye aria-hidden className="size-4 text-primary" />
            {oferta.estado === "pendiente"
              ? "Así la van a ver los postulantes"
              : vencida
                ? "Así se veía en el portal (venció y ya no se muestra)"
                : "Así se ve la oferta en el portal"}
          </p>
          <CabeceraOferta
            id={oferta.id}
            titulo={oferta.titulo}
            empresa={nombreEmpresa}
            logo={urlLogo(empresa?.logo_url)}
            categoria={oferta.categoria}
            insignias={oferta.prioridad === "urgente" ? ["urgente"] : []}
            datos={
              <>
                <div className={VIDRIO}>
                  <dt className="sr-only">Jornada</dt>
                  <Clock aria-hidden className="size-4" />
                  <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
                </div>
                {oferta.fecha_cierre && (
                  <div className={VIDRIO}>
                    <dt className="sr-only">Cierre</dt>
                    <CalendarClock aria-hidden className="size-4" />
                    <dd>Recibe postulaciones hasta el {formatearDia(oferta.fecha_cierre)}</dd>
                  </div>
                )}
                {oferta.fecha_publicacion && (
                  <div className={VIDRIO}>
                    <dt className="sr-only">Publicada</dt>
                    <CalendarDays aria-hidden className="size-4" />
                    <dd>Publicada el {formatearFecha(oferta.fecha_publicacion)}</dd>
                  </div>
                )}
              </>
            }
          />
          <SeccionesOferta descripcion={oferta.descripcion} requisitos={oferta.requisitos} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-labelledby="titulo-revision" className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm motion-safe:animate-entrada sm:p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="titulo-revision" className="font-heading text-lg font-semibold">
                  Revisión
                </h2>
                <EtiquetaOfertaAdmin estado={oferta.estado} vencida={vencida} />
              </div>
              <p className="text-sm text-muted-foreground">
                {vencida ? "Venció: ya no se ve en el portal ni recibe postulaciones. Podés reabrirla con una fecha nueva." : TEXTO_ESTADO[oferta.estado]}
              </p>
              <FechaCierre fecha={oferta.fecha_cierre} estado={oferta.estado} momento={momento} />
              {espera > DIAS_DEMORA && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-aviso-suave px-2.5 py-1 text-sm font-semibold text-aviso">
                  <AlarmClock aria-hidden className="size-4" /> Espera hace {espera} días
                </p>
              )}
              {oferta.estado === "rechazada" && oferta.motivo_rechazo && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-semibold text-destructive">Motivo que lee la empresa</p>
                  <p className="mt-1 whitespace-pre-line text-foreground/85">{oferta.motivo_rechazo}</p>
                </div>
              )}
            </div>

            <AccionesRevision
              id={oferta.id}
              estado={oferta.estado}
              urgente={oferta.prioridad === "urgente"}
              hoy={hoyArgentina(momento)}
              vencida={vencida}
              fechaCierre={oferta.fecha_cierre}
            />

            {siguiente && (
              <Link
                href={`/admin/ofertas/${siguiente.id}`}
                className="group flex items-center justify-between gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
              >
                Revisar la siguiente ({siguiente.restantes} por revisar)
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}

            <div className="border-t border-border pt-4">
              <h3 className="mb-3 text-sm font-semibold">Historial</h3>
              <LineaTiempo hitos={hitos(oferta)} momento={momento} />
            </div>
          </section>

          {(oferta.estado === "publicada" || oferta.estado === "cerrada") && (
            <section aria-labelledby="titulo-postulaciones" className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 id="titulo-postulaciones" className="flex items-center gap-2 font-heading font-semibold">
                <Users aria-hidden className="size-5 text-primary" />
                Postulaciones
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{totalPostulaciones}</span>
              </h2>
              {totalPostulaciones === 0 ? (
                <p className="text-sm text-muted-foreground">Todavía no se postuló nadie.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  {ETAPAS.map(({ estado, texto }, i) => (
                    <li
                      key={estado}
                      className={cn(
                        "rounded-xl px-3 py-2",
                        estado === "pendiente" && oferta.postulaciones.pendiente > 0 ? "bg-secondary text-secondary-foreground" : "bg-muted/60",
                      )}
                    >
                      <span
                        aria-hidden
                        className="contador block font-heading text-xl leading-tight font-bold"
                        style={{ "--hasta": oferta.postulaciones[estado], "--retraso": `${i * 80}ms` } as CSSProperties}
                      />
                      <span className="sr-only">{oferta.postulaciones[estado]} </span>
                      <span className="text-xs">{texto}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {empresa && (
            <section aria-labelledby="titulo-empresa" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <LogoEmpresa nombre={nombreEmpresa} logo={urlLogo(empresa.logo_url)} tamanio="sm" />
                <div className="min-w-0">
                  <h2 id="titulo-empresa" className="truncate font-heading font-semibold">
                    {empresa.nombre_comercial}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">{empresa.razon_social}</p>
                </div>
              </div>
              {empresa.estado === "verificado" ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <BadgeCheck aria-hidden className="size-4" /> Empresa verificada
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-aviso-suave px-2.5 py-1 text-sm font-semibold text-aviso">
                  <ShieldAlert aria-hidden className="size-4" /> Empresa sin verificar
                </p>
              )}
              <dl className="space-y-2 text-sm">
                <Dato Icono={Hash} etiqueta="CUIT">
                  {formatearCuit(empresa.cuit)}
                </Dato>
                <Dato Icono={Phone} etiqueta="Teléfono">
                  {/* The Office calls before deciding (admin.md §4.1) */}
                  <a href={`tel:${empresa.telefono.replace(/[^\d+]/g, "")}`} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {empresa.telefono}
                  </a>
                </Dato>
                <Dato Icono={MapPin} etiqueta="Dirección">
                  {empresa.direccion}
                </Dato>
                <Dato Icono={Building2} etiqueta="En el portal">
                  Desde {formatearMesAnio(empresa.created_at)} ·{" "}
                  {oferta.publicadasEmpresa === 0
                    ? "es su primera oferta"
                    : oferta.publicadasEmpresa === 1
                      ? "1 oferta publicada antes"
                      : `${oferta.publicadasEmpresa} ofertas publicadas antes`}
                </Dato>
              </dl>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Dato({ Icono, etiqueta, children }: { Icono: typeof Hash; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icono aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/** Until when the offer takes applications, or what happens on publication when the company chose no date. */
function FechaCierre({ fecha, estado, momento }: { fecha: string | null; estado: OfertaAdmin["estado"]; momento: number }) {
  if (estado === "pendiente") {
    return (
      <p className="flex gap-2 text-sm">
        <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        {fecha
          ? `La empresa pidió recibir postulaciones hasta el ${formatearDia(fecha)}.`
          : `La empresa no eligió fecha de cierre: al publicarla queda abierta ${CIERRE.porDefecto} días.`}
      </p>
    );
  }
  if (estado !== "publicada" || !fecha) return null;
  const pronto = diasParaCierre(fecha, momento) <= CIERRE.pronto;
  return (
    <p className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold", pronto ? "bg-aviso-suave text-aviso" : "bg-muted")}>
      <CalendarClock aria-hidden className="size-4" /> {textoCierre(fecha, momento)}
    </p>
  );
}
