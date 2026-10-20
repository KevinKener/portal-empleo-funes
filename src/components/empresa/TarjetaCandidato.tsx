import { Mail, MapPin, Phone } from "lucide-react";
import { BotonCvCandidato } from "@/components/empresa/BotonCvCandidato";
import { DecisionCandidato } from "@/components/empresa/DecisionCandidato";
import type { Candidato } from "@/lib/candidatos-empresa";
import {
  ETIQUETAS_ESTADO_FORMACION,
  ETIQUETAS_LOCALIDAD,
  ETIQUETAS_NIVEL_FORMACION,
  formatearMesAnio,
} from "@/lib/formato";

type PropsTarjetaCandidato = {
  ofertaId: string;
  candidato: Candidato;
  /** What "tomar" means at the candidate's stage; null when it is read-only. */
  textoTomar: string | null;
};

/**
 * A pre-selected candidate as the company sees it: no DNI, address or photo
 * (Rule 1); phone and email only from the interview on.
 */
export function TarjetaCandidato({ ofertaId, candidato, textoTomar }: PropsTarjetaCandidato) {
  const { experiencias, formaciones } = candidato;
  const tieneCvArmado = experiencias.length > 0 || formaciones.length > 0;

  return (
    <article className="space-y-4 rounded-xl border border-border bg-card p-5">
      <header className="space-y-2">
        <h3 className="font-heading text-lg font-semibold">
          {candidato.nombre} {candidato.apellido}
        </h3>
        {candidato.localidad && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden className="size-4 shrink-0" /> {ETIQUETAS_LOCALIDAD[candidato.localidad]}
          </p>
        )}
        {candidato.categorias.length > 0 && (
          <ul aria-label="Rubros" className="flex flex-wrap gap-1.5">
            {candidato.categorias.map((categoria) => (
              <li key={categoria} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {categoria}
              </li>
            ))}
          </ul>
        )}
      </header>

      {(candidato.telefono || candidato.email) && (
        <dl className="grid gap-2 rounded-lg bg-muted p-3 text-sm">
          {candidato.telefono && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Teléfono</dt>
              <Phone aria-hidden className="size-4 shrink-0" />
              <dd>
                <a href={`tel:${candidato.telefono}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {candidato.telefono}
                </a>
              </dd>
            </div>
          )}
          {candidato.email && (
            <div className="flex min-w-0 items-center gap-2">
              <dt className="sr-only">Email</dt>
              <Mail aria-hidden className="size-4 shrink-0" />
              <dd className="truncate">
                <a href={`mailto:${candidato.email}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {candidato.email}
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      {candidato.descripcion && <p className="whitespace-pre-line text-sm text-foreground/90">{candidato.descripcion}</p>}

      {tieneCvArmado && (
        <details className="group rounded-lg border border-border">
          <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium text-primary">
            Ver experiencia y formación
          </summary>
          <div className="space-y-4 border-t border-border p-3 text-sm">
            {experiencias.length > 0 && (
              <section className="space-y-2">
                <h4 className="font-semibold">Experiencia</h4>
                <ul className="space-y-3">
                  {experiencias.map((item) => (
                    <li key={item.id}>
                      <p className="font-medium">
                        {item.puesto}
                        {item.empresa && <span className="font-normal text-muted-foreground"> · {item.empresa}</span>}
                      </p>
                      <p className="text-muted-foreground">
                        {formatearMesAnio(item.desde)} – {item.hasta ? formatearMesAnio(item.hasta) : "actualidad"}
                      </p>
                      {item.tareas && <p className="mt-1 whitespace-pre-line">{item.tareas}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {formaciones.length > 0 && (
              <section className="space-y-2">
                <h4 className="font-semibold">Formación</h4>
                <ul className="space-y-2">
                  {formaciones.map((item) => (
                    <li key={item.id}>
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-muted-foreground">
                        {ETIQUETAS_NIVEL_FORMACION[item.nivel]} · {ETIQUETAS_ESTADO_FORMACION[item.estado]}
                        {item.institucion && ` · ${item.institucion}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </details>
      )}

      {candidato.tieneCvPdf && <BotonCvCandidato postulacionId={candidato.postulacionId} />}

      {textoTomar && (
        <DecisionCandidato
          ofertaId={ofertaId}
          postulacionId={candidato.postulacionId}
          decision={candidato.decision}
          textoTomar={textoTomar}
        />
      )}
    </article>
  );
}
