import type { ReactNode } from "react";
import type { ExperienciaCandidato, FormacionCandidato } from "@/lib/candidatos-empresa";
import { ETIQUETAS_ESTADO_FORMACION, ETIQUETAS_NIVEL_FORMACION, formatearMesAnio } from "@/lib/formato";

/**
 * The CV built on the platform as two small timelines, experience (newest
 * first) and education. Shared by the company's candidate cards and the
 * Office's candidate page.
 */
export function CvCandidato({ experiencias, formaciones }: { experiencias: ExperienciaCandidato[]; formaciones: FormacionCandidato[] }) {
  return (
    <>
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
    </>
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
