import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, Clock, FilePen, Hourglass, MessagesSquare, Tag, UserSearch, type LucideIcon } from "lucide-react";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { EtiquetaEstadoOferta } from "@/components/empresa/EtiquetaEstadoOferta";
import { ahora, ETIQUETAS_JORNADA, haceCuanto } from "@/lib/formato";
import type { ResumenCandidatos } from "@/lib/candidatos-empresa";
import type { OfertaEmpresa } from "@/lib/ofertas-empresa";
import { cn } from "@/lib/utils";

// Left stripe by status: the list reads at a glance (live = brand green, rejected = red)
const FRANJA: Record<OfertaEmpresa["estado"], string> = {
  borrador: "border-l-border",
  pendiente: "border-l-primary/40",
  publicada: "border-l-primary",
  rechazada: "border-l-destructive",
  cerrada: "border-l-muted-foreground/40",
};

const PILDORA = "flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 transition-colors duration-300 group-hover:bg-secondary";

type PropsTarjetaOfertaEmpresa = {
  oferta: OfertaEmpresa;
  /** Pre-selected candidates of this offer; undefined when there are none. */
  candidatos?: ResumenCandidatos;
};

/** Where the card leads and what its footer says, by status. */
function destino(oferta: OfertaEmpresa, candidatos?: ResumenCandidatos): { href: string; accion: string } {
  const pagina = `/empresa/ofertas/${oferta.id}`;
  if ((oferta.estado === "publicada" || oferta.estado === "cerrada") && candidatos && candidatos.total > 0) {
    return { href: `${pagina}/candidatos`, accion: "Ver candidatos" };
  }
  if (oferta.estado === "borrador") return { href: pagina, accion: "Terminar y enviar" };
  if (oferta.estado === "rechazada") return { href: pagina, accion: "Ver el motivo" };
  return { href: pagina, accion: "Ver oferta" };
}

/**
 * One offer in the company's list; the whole card links to the most useful
 * place (its candidates once there are any). Says in one line what is
 * happening with the offer and, once published, how its candidates move.
 */
export function TarjetaOfertaEmpresa({ oferta, candidatos }: PropsTarjetaOfertaEmpresa) {
  const { href, accion } = destino(oferta, candidatos);
  const momento = ahora();
  const porRevisar = candidatos ? candidatos.porRevisar + candidatos.sinConfirmar : 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-2xl border border-l-4 border-border bg-card p-5 transition-[box-shadow,translate,border-color] duration-200 ease-out focus-within:ring-3 focus-within:ring-ring/50 hover:shadow-xl hover:shadow-primary/[0.08] motion-safe:hover:-translate-y-0.5",
        FRANJA[oferta.estado],
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EtiquetaEstadoOferta estado={oferta.estado} />
        {oferta.prioridad === "urgente" && <InsigniasOferta insignias={["urgente"]} />}
        {porRevisar > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {/* Something waits for the company: a soft living dot */}
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-primary-foreground/70 motion-safe:animate-ping" />
              <span className="relative size-2 rounded-full bg-primary-foreground" />
            </span>
            {porRevisar === 1 ? "1 para decidir" : `${porRevisar} para decidir`}
          </span>
        )}
      </div>

      <h2 className="font-heading text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
        {/* after:z-10 keeps the whole-card link above children that move on hover (the arrow), so every tap opens it */}
        <Link href={href} className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-2xl">
          {oferta.titulo}
        </Link>
      </h2>

      <dl className="flex flex-wrap gap-2 text-sm font-medium text-foreground/85">
        {oferta.categoria_nombre && (
          <div className={PILDORA}>
            <dt className="sr-only">Rubro</dt>
            <Tag aria-hidden className="size-4 shrink-0 text-primary" />
            <dd>{oferta.categoria_nombre}</dd>
          </div>
        )}
        <div className={PILDORA}>
          <dt className="sr-only">Jornada</dt>
          <Clock aria-hidden className="size-4 shrink-0 text-primary" />
          <dd>{ETIQUETAS_JORNADA[oferta.jornada]}</dd>
        </div>
      </dl>

      <Situacion oferta={oferta} candidatos={candidatos} momento={momento} />

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary">
        <span>{accion}</span>
        <span className="flex size-8 items-center justify-center rounded-full bg-secondary transition-[background-color,color,translate] duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:translate-x-1">
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </article>
  );
}

/** What is happening with the offer now, in one short block. */
function Situacion({ oferta, candidatos, momento }: { oferta: OfertaEmpresa; candidatos?: ResumenCandidatos; momento: number }) {
  switch (oferta.estado) {
    case "borrador":
      return <Linea Icono={FilePen}>Solo la ves vos. Revisala y enviala a la Oficina de Empleo cuando esté lista.</Linea>;
    case "pendiente":
      return (
        <Linea Icono={Hourglass}>
          La Oficina de Empleo la está revisando
          {oferta.fecha_envio && <> · la enviaste {haceCuanto(oferta.fecha_envio, momento)}</>}.
        </Linea>
      );
    case "rechazada":
      return (
        <p className="line-clamp-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <span className="font-semibold">Motivo:</span> {oferta.motivo_rechazo ?? "La Oficina de Empleo te pide cambios."}
        </p>
      );
    default: {
      const publicada = oferta.fecha_publicacion ? haceCuanto(oferta.fecha_publicacion, momento) : null;
      if (!candidatos || candidatos.total === 0) {
        return (
          <Linea Icono={CalendarDays}>
            {oferta.estado === "publicada"
              ? `En el portal desde ${publicada ?? "hace poco"}. La Oficina te va a preseleccionar candidatos.`
              : "Cerrada sin candidatos."}
          </Linea>
        );
      }
      // Rule 1: only what the Office pre-selected reaches the company
      return (
        <ul className="grid grid-cols-3 gap-2" aria-label="Candidatos de la oferta">
          <Etapa Icono={UserSearch} valor={candidatos.porRevisar + candidatos.sinConfirmar} texto="Para decidir" destacada />
          <Etapa Icono={MessagesSquare} valor={candidatos.enEntrevista} texto="Entrevistas" />
          <Etapa Icono={BadgeCheck} valor={candidatos.contratados} texto="Contratados" />
        </ul>
      );
    }
  }
}

function Linea({ Icono, children }: { Icono: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex gap-2 text-sm text-muted-foreground">
      <Icono aria-hidden className="mt-0.5 size-4 shrink-0 text-primary/70" />
      <span>{children}</span>
    </p>
  );
}

function Etapa({ Icono, valor, texto, destacada = false }: { Icono: LucideIcon; valor: number; texto: string; destacada?: boolean }) {
  const activa = valor > 0;
  return (
    <li
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center",
        activa && destacada ? "bg-primary text-primary-foreground" : activa ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      <Icono aria-hidden className="size-4" />
      <span className="font-heading text-lg leading-none font-bold">{valor}</span>
      <span className="text-[0.6875rem] leading-tight font-medium">{texto}</span>
    </li>
  );
}
