import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe, MessagesSquare, UserSearch } from "lucide-react";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import type { ResumenCandidatos } from "@/lib/candidatos-empresa";
import { ofertaVencida, textoCierre } from "@/lib/cierre-oferta";
import { ahora, haceCuanto } from "@/lib/formato";
import type { OfertaEmpresa } from "@/lib/ofertas-empresa";
import { cn } from "@/lib/utils";

const EN_INICIO = 4;

/**
 * The company's published offers with how their candidates move, one tap
 * from each offer's candidates: the shortcut the company needs most days.
 */
export function BusquedasActivas({ ofertas, candidatos }: { ofertas: OfertaEmpresa[]; candidatos: Map<string, ResumenCandidatos> }) {
  // The ones with candidates moving first
  const movimiento = (o: OfertaEmpresa) => {
    const resumen = candidatos.get(o.id);
    return resumen ? resumen.porRevisar + resumen.sinConfirmar + resumen.enEntrevista : 0;
  };
  const publicadas = ofertas.filter((o) => o.estado === "publicada").sort((a, b) => movimiento(b) - movimiento(a));
  if (publicadas.length === 0) return null;
  const momento = ahora();

  return (
    <section aria-labelledby="titulo-busquedas" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 id="titulo-busquedas" className="font-heading text-lg font-semibold">
            Tus búsquedas activas
          </h2>
          <p className="text-sm text-muted-foreground">Publicadas en el portal, con sus candidatos.</p>
        </div>
        {publicadas.length > EN_INICIO && (
          <Link href="/empresa/ofertas?estado=publicada" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
            Ver las {publicadas.length}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <ul className="divide-y divide-border">
        {publicadas.slice(0, EN_INICIO).map((oferta, i) => {
          const resumen = candidatos.get(oferta.id);
          const paraDecidir = resumen ? resumen.porRevisar + resumen.sinConfirmar : 0;
          const tieneCandidatos = Boolean(resumen && resumen.total > 0);
          return (
            <li key={oferta.id} className="motion-safe:animate-entrada" style={{ "--retraso": `${i * 80}ms` } as CSSProperties}>
              <Link
                href={tieneCandidatos ? `/empresa/ofertas/${oferta.id}/candidatos` : `/empresa/ofertas/${oferta.id}`}
                className="group -mx-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-2 py-3 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Globe aria-hidden className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold group-hover:text-primary">{oferta.titulo}</span>
                    {oferta.prioridad === "urgente" && <InsigniasOferta insignias={["urgente"]} />}
                  </span>
                  {ofertaVencida(oferta, momento) && oferta.fecha_cierre ? (
                    // Out of the portal: only the Office extends it (decision 2026-10-21)
                    <span className="block text-sm font-medium text-aviso">{textoCierre(oferta.fecha_cierre, momento)} · pedile a la Oficina que la extienda</span>
                  ) : (
                    <span className="block text-sm text-muted-foreground">
                      En el portal desde {oferta.fecha_publicacion ? haceCuanto(oferta.fecha_publicacion, momento) : "hace poco"}
                      {oferta.fecha_cierre && <> · {textoCierre(oferta.fecha_cierre, momento).toLowerCase()}</>}
                    </span>
                  )}
                </span>
                {/* Phones: under the title, lined up with it */}
                <span className="flex w-full flex-wrap items-center gap-2 pl-[3.25rem] text-xs font-semibold sm:w-auto sm:pl-0">
                  {paraDecidir > 0 && <Conteo Icono={UserSearch} valor={paraDecidir} texto="para decidir" destacado />}
                  {(resumen?.enEntrevista ?? 0) > 0 && <Conteo Icono={MessagesSquare} valor={resumen?.enEntrevista ?? 0} texto="en entrevista" />}
                  {(resumen?.contratados ?? 0) > 0 && <Conteo Icono={BadgeCheck} valor={resumen?.contratados ?? 0} texto={resumen?.contratados === 1 ? "contratado" : "contratados"} />}
                  {!tieneCandidatos && <span className="font-medium text-muted-foreground">Sin candidatos aún</span>}
                  <ArrowRight aria-hidden className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Conteo({ Icono, valor, texto, destacado = false }: { Icono: typeof Globe; valor: number; texto: string; destacado?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
        destacado ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
      )}
    >
      <Icono aria-hidden className="size-3.5" />
      {valor} <span className="font-medium">{texto}</span>
    </span>
  );
}
