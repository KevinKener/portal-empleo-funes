import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Hourglass, PartyPopper, Search, Sparkles } from "lucide-react";
import { ahora, DESPUES_POSTULACION, haceCuanto, textoEstadoPostulacion } from "@/lib/formato";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import type { EmpresaDeOferta } from "@/lib/panel-postulante";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";
import { EtapaPostulacion } from "./EtapaPostulacion";
import { SeguimientoPostulacion } from "./SeguimientoPostulacion";

// Left stripe by stage: in review is soft, with the company or hired is the brand green
export const FRANJA_POSTULACION: Record<MiPostulacion["estado"], string> = {
  pendiente: "border-l-primary/40",
  preseleccionado: "border-l-primary",
  entrevista: "border-l-primary",
  contratado: "border-l-primary",
  rechazado: "border-l-border",
};

/**
 * One application with its status in plain words. Active ones show the
 * tracker and "Ahora / Lo que sigue", so it is always clear whether it is
 * moving; a hire gets a celebration; rejected ones a kind message, softer
 * when the quota was filled (Rule 10), and a way to keep looking.
 */
export function TarjetaPostulacion({ postulacion, empresa }: { postulacion: MiPostulacion; empresa?: EmpresaDeOferta }) {
  const { estado, motivo_rechazo, oferta } = postulacion;
  const rechazada = estado === "rechazado";
  const contratado = estado === "contratado";
  const texto = textoEstadoPostulacion(estado, motivo_rechazo);
  const despues = DESPUES_POSTULACION[estado];

  return (
    // The panel links here with #postulacion-<id>
    <article
      id={`postulacion-${postulacion.id}`}
      className={cn(
        "group flex h-full scroll-mt-24 flex-col gap-5 rounded-2xl border border-l-4 border-border bg-card p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/[0.07] target:ring-3 target:ring-ring/40 sm:p-6",
        FRANJA_POSTULACION[estado],
        rechazada && "bg-card/70",
      )}
    >
      <header className="flex items-start gap-3">
        {/* Company logo or initial (closed offers have no public company, so the title's initial) */}
        <LogoEmpresa
          nombre={empresa?.nombre ?? oferta?.titulo ?? "?"}
          logo={empresa?.logo}
          tamanio="sm"
          className="transition-[rotate,scale] duration-300 motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-6"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <h3 className="font-heading text-lg leading-snug font-semibold">
              {oferta?.estado === "publicada" ? (
                <Link href={`/ofertas/${oferta.id}`} className="group/titulo inline-flex items-center gap-1 hover:text-primary">
                  {oferta.titulo}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover/titulo:opacity-100"
                  />
                  <span className="sr-only"> (ver la oferta)</span>
                </Link>
              ) : (
                (oferta?.titulo ?? "Oferta")
              )}
            </h3>
            <EtapaPostulacion estado={estado} motivo={motivo_rechazo} />
          </div>
          {empresa && <p className="text-sm font-medium text-foreground/80">{empresa.nombre}</p>}
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
            <CalendarDays aria-hidden className="size-3.5" />
            Te postulaste {haceCuanto(postulacion.created_at, ahora())}
            {oferta?.categoria && <span>· {oferta.categoria}</span>}
            {oferta?.estado === "cerrada" && !rechazada && !contratado && <span>· La oferta ya cerró</span>}
          </p>
        </div>
      </header>

      {rechazada ? (
        <div className="mt-auto flex flex-col gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/80">{texto.detalle}</p>
          <Link
            href="/ofertas"
            className="group/buscar inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <Search aria-hidden className="size-4" />
            Buscar otras ofertas
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover/buscar:translate-x-0.5" />
          </Link>
        </div>
      ) : (
        <>
          <SeguimientoPostulacion estado={estado} />
          {contratado ? (
            <div className="relative mt-auto flex items-center gap-3 overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground">
              {/* One soft sweep of light, like the green banners */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary-foreground/15 to-transparent motion-safe:animate-destello"
              />
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 motion-safe:animate-festejo-pop">
                <PartyPopper aria-hidden className="size-5" />
              </span>
              <p className="font-medium">{texto.detalle}</p>
            </div>
          ) : (
            <dl className="mt-auto grid gap-3 rounded-xl bg-secondary/60 p-4 text-sm sm:grid-cols-2">
              <div className="flex gap-2.5">
                <Hourglass aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold text-secondary-foreground">Ahora</dt>
                  <dd className="text-foreground/80">{texto.detalle}</dd>
                </div>
              </div>
              {despues && (
                <div className="flex gap-2.5">
                  <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <dt className="font-semibold text-secondary-foreground">Lo que sigue</dt>
                    <dd className="text-foreground/80">{despues}</dd>
                  </div>
                </div>
              )}
            </dl>
          )}
        </>
      )}
    </article>
  );
}
