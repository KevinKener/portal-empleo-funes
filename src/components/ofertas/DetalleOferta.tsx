import { ViewTransition, type ReactNode } from "react";
import { FileText, ListChecks } from "lucide-react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { Revelar } from "@/components/layout/Revelar";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { TextoOferta } from "@/components/ofertas/TextoOferta";
import { nombreTransicionOferta } from "@/components/ofertas/TarjetaOferta";
import type { InsigniaOferta } from "@/lib/insignias-oferta";

/** Glass chip on the green banner (jornada, dates). */
export const VIDRIO = "flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3.5 py-1.5 backdrop-blur-sm";
export const TARJETA_OFERTA = "space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-primary/[0.03] sm:p-7";
const TITULO_SECCION = "flex items-center gap-3 font-heading text-xl font-semibold";
const ICONO_SECCION = "flex size-10 items-center justify-center rounded-xl bg-secondary text-primary";

type PropsCabecera = {
  id: string;
  titulo: string;
  empresa: string;
  logo: string | null;
  categoria: string | null;
  insignias: InsigniaOferta[];
  /** Above the company: the way back. */
  arriba?: ReactNode;
  /** Glass chips under the title (jornada, dates…), as `<div className={VIDRIO}>` inside a <dl>. */
  datos: ReactNode;
  /** Title morph from the offer cards; only on the public page. */
  morph?: boolean;
};

/**
 * Green banner of an offer: company, badges, title and key facts. Shared by
 * the public offer page and the Office's review page, so the Office checks
 * the offer exactly as job seekers will see it.
 */
export function CabeceraOferta({ id, titulo, empresa, logo, categoria, insignias, arriba, datos, morph = false }: PropsCabecera) {
  return (
    <header className="relative isolate overflow-hidden rounded-3xl bg-primary-deep px-6 py-8 text-primary-foreground sm:px-10 sm:py-12">
      <FondoMarca compacto />
      <div className="space-y-6 motion-safe:animate-entrada">
        {arriba}

        <div className="flex items-center gap-3">
          {/* Company logo or initial, as on the offer cards */}
          <LogoEmpresa nombre={empresa} logo={logo} tamanio="md" className="shadow-lg shadow-black/20 ring-0" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{empresa}</p>
            {categoria && <p className="truncate text-sm text-primary-foreground/80">{categoria}</p>}
          </div>
        </div>

        <InsigniasOferta insignias={insignias} sobreOscuro />

        <h1 className="max-w-3xl font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {morph ? (
            <ViewTransition name={nombreTransicionOferta(id)} share="morph" default="none">
              <span>{titulo}</span>
            </ViewTransition>
          ) : (
            titulo
          )}
        </h1>

        <dl className="flex flex-wrap gap-2 text-sm">{datos}</dl>
      </div>
    </header>
  );
}

/** "Sobre el puesto" and "Requisitos" cards of an offer. */
export function SeccionesOferta({ descripcion, requisitos }: { descripcion: string; requisitos: string | null }) {
  return (
    <div className="space-y-6">
      <Revelar>
        <section aria-labelledby="titulo-descripcion" className={TARJETA_OFERTA}>
          <h2 id="titulo-descripcion" className={TITULO_SECCION}>
            <span className={ICONO_SECCION}>
              <FileText aria-hidden className="size-5" />
            </span>
            Sobre el puesto
          </h2>
          <TextoOferta texto={descripcion} />
        </section>
      </Revelar>

      {requisitos && (
        <Revelar retraso={80}>
          <section aria-labelledby="titulo-requisitos" className={TARJETA_OFERTA}>
            <h2 id="titulo-requisitos" className={TITULO_SECCION}>
              <span className={ICONO_SECCION}>
                <ListChecks aria-hidden className="size-5" />
              </span>
              Requisitos
            </h2>
            <TextoOferta texto={requisitos} tilde />
          </section>
        </Revelar>
      )}
    </div>
  );
}
