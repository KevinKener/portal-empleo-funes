import type { CSSProperties } from "react";
import Link from "next/link";
import { Archive, ArrowRight, Building2, Clock, Inbox, PartyPopper, type LucideIcon } from "lucide-react";
import { textoEstadoPostulacion } from "@/lib/formato";
import { contarPorGrupo, destacarActivas, type GrupoEstado } from "@/lib/panel-postulante";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";
import { SeguimientoPostulacion } from "../SeguimientoPostulacion";
import { MarcaNovedad } from "./VistosPanel";

const EN_PANEL = 3;

// Count tiles: the good stages stand out in brand green
const GRUPOS: Record<GrupoEstado, { texto: (n: number) => string; Icono: LucideIcon; destacado: boolean }> = {
  en_revision: { texto: () => "En revisión", Icono: Clock, destacado: false },
  con_la_empresa: { texto: () => "Con la empresa", Icono: Building2, destacado: true },
  contratado: { texto: (n) => (n === 1 ? "Contratación" : "Contrataciones"), Icono: PartyPopper, destacado: true },
  finalizada: { texto: (n) => (n === 1 ? "Finalizada" : "Finalizadas"), Icono: Archive, destacado: false },
};

/**
 * "Mis postulaciones" on the panel: a count per status, the most relevant
 * applications with a compact tracker, and a clear way to the full list.
 */
export function ResumenPostulaciones({ postulaciones, empresas }: { postulaciones: MiPostulacion[]; empresas: Map<string, string> }) {
  const total = postulaciones.length;

  return (
    <section aria-labelledby="titulo-mis-postulaciones" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="titulo-mis-postulaciones" className="font-heading text-xl font-semibold">
            Mis postulaciones
          </h2>
          {total > 0 && (
            <Link href="/postulante/postulaciones" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Ver todas
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        {total > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]" aria-label="Postulaciones por estado">
            {contarPorGrupo(postulaciones).map(({ grupo, cantidad }, i) => {
              const { texto, Icono, destacado } = GRUPOS[grupo];
              return (
                <li
                  key={grupo}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 motion-safe:animate-entrada",
                    destacado ? "bg-secondary text-secondary-foreground" : "bg-muted",
                  )}
                  style={{ "--retraso": `${i * 80}ms` } as CSSProperties}
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", destacado ? "bg-primary text-primary-foreground" : "bg-card text-primary")}>
                    <Icono aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-xl leading-none font-bold">{cantidad}</span>
                    <span className="block truncate text-xs font-medium">{texto(cantidad)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <Inbox aria-hidden className="size-9 text-muted-foreground" />
          <p className="font-medium">Todavía no te postulaste a ninguna oferta.</p>
          <p className="text-sm text-muted-foreground">Cuando lo hagas, acá vas a ver en qué etapa está cada una.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2.5">
            {destacarActivas(postulaciones, EN_PANEL).map((postulacion) => (
              <li key={postulacion.id}>
                <TarjetaCompacta postulacion={postulacion} empresa={postulacion.oferta ? empresas.get(postulacion.oferta.id) : undefined} />
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

function TarjetaCompacta({ postulacion, empresa }: { postulacion: MiPostulacion; empresa?: string }) {
  const { id, estado, motivo_rechazo, oferta } = postulacion;
  const texto = textoEstadoPostulacion(estado, motivo_rechazo);
  const rechazada = estado === "rechazado";
  const etapa = rechazada ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground";

  return (
    <Link
      href={`/postulante/postulaciones#postulacion-${id}`}
      className="group block space-y-3 rounded-xl border border-border p-4 transition-[border-color,box-shadow,translate] duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/[0.06] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        {/* Company initial, as on the offer cards */}
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-heading font-semibold text-secondary-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          {(empresa ?? oferta?.titulo ?? "?").trim().charAt(0).toLocaleUpperCase("es-AR")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold sm:truncate">{oferta?.titulo ?? "Oferta"}</p>
          {empresa && <p className="truncate text-sm text-muted-foreground">{empresa}</p>}
          {/* Phones: the stage goes under the company, so the job title is never cut */}
          <span className={cn("mt-1.5 inline-block rounded-full px-2.5 py-1 text-xs font-semibold sm:hidden", etapa)}>{texto.titulo}</span>
        </div>
        <MarcaNovedad id={id} estado={estado} />
        <span className={cn("hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block", etapa)}>{texto.titulo}</span>
      </div>
      {!rechazada && <SeguimientoPostulacion estado={estado} compacto />}
      <p className="text-sm text-muted-foreground">{texto.detalle}</p>
    </Link>
  );
}
