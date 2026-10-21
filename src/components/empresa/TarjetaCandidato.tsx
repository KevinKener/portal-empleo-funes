import type { ReactNode } from "react";
import { BadgeCheck, Briefcase, CalendarDays, Check, ChevronDown, GraduationCap, Mail, MapPin, Phone, Target, type LucideIcon } from "lucide-react";
import { BotonCvCandidato } from "@/components/empresa/BotonCvCandidato";
import { DecisionCandidato } from "@/components/empresa/DecisionCandidato";
import type { Candidato } from "@/lib/candidatos-empresa";
import { datosClave, iniciales } from "@/lib/datos-candidato";
import {
  ahora,
  ETIQUETAS_ESTADO_FORMACION,
  ETIQUETAS_LOCALIDAD,
  ETIQUETAS_NIVEL_FORMACION,
  formatearMesAnio,
  haceCuanto,
} from "@/lib/formato";
import { cn } from "@/lib/utils";

type PropsTarjetaCandidato = {
  ofertaId: string;
  candidato: Candidato;
  /** What "tomar" means at the candidate's stage; null when it is read-only. */
  textoTomar: string | null;
  /** The offer's category, to point out when the candidate chose it too. */
  rubroOferta: string | null;
};

/**
 * A pre-selected candidate as the company sees it: no DNI, address or photo
 * (Rule 1); phone and email only from the interview on. Key facts first
 * (experience, last job, education, fit with the offer), the detail one tap
 * away. The card's border follows the draft decision (Rule 11).
 */
export function TarjetaCandidato({ ofertaId, candidato, textoTomar, rubroOferta }: PropsTarjetaCandidato) {
  const { experiencias, formaciones } = candidato;
  const tieneCvArmado = experiencias.length > 0 || formaciones.length > 0;
  const datos = datosClave(candidato, rubroOferta, ahora());
  const contratado = candidato.estado === "contratado";

  return (
    <article
      className={cn(
        "group/candidato @container flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow] duration-300 hover:shadow-lg hover:shadow-primary/[0.07] sm:p-6",
        // The draft decision shows on the whole card, not only on its buttons
        "has-[[data-elegido=tomar]]:border-primary has-[[data-elegido=tomar]]:ring-2 has-[[data-elegido=tomar]]:ring-primary/15",
        "has-[[data-elegido=descartar]]:border-destructive/40 has-[[data-elegido=descartar]]:bg-muted/40",
        contratado && "border-primary/40 bg-gradient-to-br from-secondary/70 to-card",
      )}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl font-heading text-lg font-bold transition-transform duration-300 motion-safe:group-hover/candidato:-rotate-6",
            contratado ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
          )}
        >
          {contratado ? <BadgeCheck className="size-6" /> : iniciales(candidato.nombre, candidato.apellido)}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading text-lg leading-snug font-semibold">
            {candidato.nombre} {candidato.apellido}
          </h3>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {candidato.localidad && (
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden className="size-3.5" /> {ETIQUETAS_LOCALIDAD[candidato.localidad]}
              </span>
            )}
            {candidato.fechaPreseleccion && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays aria-hidden className="size-3.5" /> Te lo envió la Oficina {haceCuanto(candidato.fechaPreseleccion, ahora())}
              </span>
            )}
          </p>
        </div>
      </header>

      {/* Key facts: what a hiring person scans first */}
      {/* A wide card (a single candidate) lays the facts in one row */}
      <dl className="grid grid-cols-2 gap-2 text-sm @2xl:grid-cols-3">
        <Dato Icono={Briefcase} etiqueta="Experiencia" valor={datos.experiencia ?? (candidato.tieneCvPdf ? "En su CV adjunto" : "Sin experiencia cargada")} apagado={!datos.experiencia} />
        <Dato Icono={GraduationCap} etiqueta="Formación" valor={datos.formacion ?? (candidato.tieneCvPdf ? "En su CV adjunto" : "Sin datos")} apagado={!datos.formacion} />
        {datos.ultimoPuesto && <Dato Icono={Briefcase} etiqueta="Último puesto" valor={datos.ultimoPuesto} ancho />}
      </dl>

      {candidato.categorias.length > 0 && (
        <ul aria-label="Rubros que eligió" className="flex flex-wrap gap-1.5">
          {[...candidato.categorias]
            .sort((a, b) => Number(b === rubroOferta) - Number(a === rubroOferta))
            .map((categoria) => {
              const coincide = categoria === rubroOferta;
              return (
                <li
                  key={categoria}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    coincide ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80",
                  )}
                >
                  {coincide && <Target aria-hidden className="size-3" />}
                  {categoria}
                  {coincide && <span className="sr-only"> (el rubro de tu oferta)</span>}
                </li>
              );
            })}
        </ul>
      )}

      {candidato.descripcion && (
        <blockquote className="border-l-2 border-primary/30 pl-3 text-sm whitespace-pre-line text-foreground/85 italic">
          {candidato.descripcion}
        </blockquote>
      )}

      {/* Rule 1 and migration 20261020120000: contact data only from the interview on */}
      {(candidato.telefono || candidato.email || candidato.tieneCvPdf) && (
        <div className="flex flex-wrap gap-2">
          {candidato.telefono && (
            <a
              href={`tel:${candidato.telefono}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Phone aria-hidden className="size-4" /> {candidato.telefono}
            </a>
          )}
          {candidato.email && (
            <a
              href={`mailto:${candidato.email}`}
              className="inline-flex h-10 min-w-0 max-w-full items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-primary transition-colors hover:bg-accent"
            >
              <Mail aria-hidden className="size-4 shrink-0" /> <span className="truncate">{candidato.email}</span>
            </a>
          )}
          {candidato.tieneCvPdf && <BotonCvCandidato postulacionId={candidato.postulacionId} />}
        </div>
      )}

      {tieneCvArmado && (
        <details className="group/cv rounded-xl border border-border open:bg-muted/30">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
            Ver experiencia y formación
            <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-open/cv:rotate-180" />
          </summary>
          <div className="space-y-5 border-t border-border px-4 py-4 text-sm">
            {experiencias.length > 0 && (
              <Linea titulo="Experiencia">
                {experiencias.map((item) => (
                  <li key={item.id} className="relative pl-5">
                    <span aria-hidden className="absolute top-1.5 left-0 size-2.5 rounded-full border-2 border-primary bg-card" />
                    <p className="font-medium">
                      {item.puesto}
                      {item.empresa && <span className="font-normal text-muted-foreground"> · {item.empresa}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatearMesAnio(item.desde)} – {item.hasta ? formatearMesAnio(item.hasta) : "actualidad"}
                    </p>
                    {item.tareas && <p className="mt-1 whitespace-pre-line text-foreground/85">{item.tareas}</p>}
                  </li>
                ))}
              </Linea>
            )}
            {formaciones.length > 0 && (
              <Linea titulo="Formación">
                {formaciones.map((item) => (
                  <li key={item.id} className="relative pl-5">
                    <span aria-hidden className="absolute top-1.5 left-0 size-2.5 rounded-full border-2 border-primary bg-card" />
                    <p className="font-medium">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {ETIQUETAS_NIVEL_FORMACION[item.nivel]} · {ETIQUETAS_ESTADO_FORMACION[item.estado]}
                      {item.institucion && ` · ${item.institucion}`}
                    </p>
                  </li>
                ))}
              </Linea>
            )}
          </div>
        </details>
      )}

      <div className="mt-auto">
        {textoTomar ? (
          <DecisionCandidato
            ofertaId={ofertaId}
            postulacionId={candidato.postulacionId}
            decision={candidato.decision}
            textoTomar={textoTomar}
          />
        ) : (
          contratado && (
            <p className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
              <Check aria-hidden className="size-4" /> Lo contrataste. ¡Éxitos con la incorporación!
            </p>
          )
        )}
      </div>
    </article>
  );
}

function Dato({ Icono, etiqueta, valor, apagado = false, ancho = false }: { Icono: LucideIcon; etiqueta: string; valor: string; apagado?: boolean; ancho?: boolean }) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2.5", ancho && "col-span-2 @2xl:col-span-1")}>
      <Icono aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
        <dd className={cn("font-medium leading-snug", apagado && "text-muted-foreground")}>{valor}</dd>
      </div>
    </div>
  );
}

function Linea({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="font-semibold">{titulo}</h4>
      {/* A thin line joins the dots: a small timeline, newest first */}
      <ul className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[0.3rem] before:w-px before:bg-border">{children}</ul>
    </section>
  );
}
