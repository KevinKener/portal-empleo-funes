import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Inbox } from "lucide-react";
import { ahora, haceCuanto, textoEstadoPostulacion } from "@/lib/formato";
import { destacarActivas, type EmpresaDeOferta } from "@/lib/panel-postulante";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { ContadoresPostulaciones } from "../ContadoresPostulaciones";
import { EtapaPostulacion } from "../EtapaPostulacion";
import { SeguimientoPostulacion } from "../SeguimientoPostulacion";
import { FRANJA_POSTULACION } from "../TarjetaPostulacion";
import { MarcaNovedad } from "./VistosPanel";

const EN_PANEL = 3;

/**
 * "Mis postulaciones" on the panel: a count per status, the most relevant
 * applications with a compact tracker, and a clear way to the full list.
 */
export function ResumenPostulaciones({ postulaciones, empresas }: { postulaciones: MiPostulacion[]; empresas: Map<string, EmpresaDeOferta> }) {
  const total = postulaciones.length;
  const momento = ahora();

  return (
    <section aria-labelledby="titulo-mis-postulaciones" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="titulo-mis-postulaciones" className="font-heading text-xl font-semibold">
              Mis postulaciones
            </h2>
            {total > 0 && <p className="text-sm text-muted-foreground">En qué etapa está cada una.</p>}
          </div>
          {total > 0 && (
            // Phones already have the big button under the list
            <Link href="/postulante/postulaciones" className="group hidden shrink-0 items-center gap-1 pt-1 text-sm font-semibold text-primary sm:inline-flex">
              Ver todas
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        {total > 0 && <ContadoresPostulaciones postulaciones={postulaciones} />}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <Inbox aria-hidden className="size-9 text-muted-foreground" />
          <p className="font-medium">Todavía no te postulaste a ninguna oferta.</p>
          <p className="text-sm text-muted-foreground">Cuando lo hagas, acá vas a ver en qué etapa está cada una.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {destacarActivas(postulaciones, EN_PANEL).map((postulacion, i) => (
              <li key={postulacion.id} className="motion-safe:animate-entrada" style={{ "--retraso": `${250 + i * 110}ms` } as CSSProperties}>
                <TarjetaCompacta
                  postulacion={postulacion}
                  empresa={postulacion.oferta ? empresas.get(postulacion.oferta.id) : undefined}
                  cuando={haceCuanto(postulacion.created_at, momento)}
                />
              </li>
            ))}
          </ul>
          <Link
            href="/postulante/postulaciones"
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-base font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {total === 1 ? "Ver mi postulación" : `Ver mis ${total} postulaciones`}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </>
      )}
    </section>
  );
}

function TarjetaCompacta({ postulacion, empresa, cuando }: { postulacion: MiPostulacion; empresa?: EmpresaDeOferta; cuando: string }) {
  const { id, estado, motivo_rechazo, oferta } = postulacion;
  const texto = textoEstadoPostulacion(estado, motivo_rechazo);
  const rechazada = estado === "rechazado";

  return (
    <Link
      href={`/postulante/postulaciones#postulacion-${id}`}
      className={cn(
        "group relative block space-y-3.5 overflow-hidden rounded-xl border border-l-4 border-border bg-card p-4 transition-[border-color,box-shadow,translate] duration-200 hover:shadow-lg hover:shadow-primary/[0.08] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5",
        FRANJA_POSTULACION[estado],
      )}
    >
      {/* A soft brand glow from the left on hover, the same family as the offer cards */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-secondary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-center gap-3">
        {/* Company logo or initial, as on the offer cards */}
        <LogoEmpresa
          nombre={empresa?.nombre ?? oferta?.titulo ?? "?"}
          logo={empresa?.logo}
          tamanio="sm"
          className="transition-[rotate,scale] duration-300 motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-6"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold transition-colors group-hover:text-primary sm:truncate">{oferta?.titulo ?? "Oferta"}</p>
          {empresa && <p className="truncate text-sm text-muted-foreground">{empresa.nombre}</p>}
          {/* Phones: the stage goes under the company, so the job title is never cut */}
          <EtapaPostulacion estado={estado} motivo={motivo_rechazo} className="mt-1.5 sm:hidden" />
        </div>
        <MarcaNovedad id={id} estado={estado} />
        <EtapaPostulacion estado={estado} motivo={motivo_rechazo} className="hidden shrink-0 sm:inline-flex" />
      </div>

      {!rechazada && (
        <div className="relative">
          <SeguimientoPostulacion estado={estado} compacto />
        </div>
      )}

      <div className="relative flex flex-col gap-1.5 border-t border-border/70 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-foreground/80">{texto.detalle}</p>
        <p className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays aria-hidden className="size-3.5" />
          Te postulaste {cuando}
          <ChevronRight
            aria-hidden
            className="size-4 text-primary opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </p>
      </div>
    </Link>
  );
}
