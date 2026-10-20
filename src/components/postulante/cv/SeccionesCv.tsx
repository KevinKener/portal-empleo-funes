"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { FormularioExperiencia } from "@/components/postulante/cv/FormularioExperiencia";
import { FormularioFormacion } from "@/components/postulante/cv/FormularioFormacion";
import { ItemCv } from "@/components/postulante/cv/ItemCv";
import { ETIQUETAS_ESTADO_FORMACION, ETIQUETAS_NIVEL_FORMACION, formatearMesAnio } from "@/lib/formato";
import { MAXIMO_ITEMS_CV } from "@/lib/validaciones/cv";
import type { Tables } from "@/types/database";

type PropsLista = {
  vacio: string;
  textoAgregar: string;
  cantidad: number;
  formularioNuevo: (cerrar: () => void) => ReactNode;
  children: ReactNode;
};

/** Summary list as a timeline + "Agregar otra" (GOV.UK / DWP "Add another"). */
function ListaConAgregar({ vacio, textoAgregar, cantidad, formularioNuevo, children }: PropsLista) {
  const [agregando, setAgregando] = useState(false);

  return (
    <div className="space-y-3">
      {cantidad === 0 && !agregando && <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{vacio}</p>}
      {cantidad > 0 && (
        <ul className="relative space-y-3">
          {/* Timeline line joining the items' dots */}
          {cantidad > 1 && <span aria-hidden className="absolute top-6 bottom-6 left-[0.6875rem] w-0.5 -translate-x-1/2 rounded-full bg-border" />}
          {children}
        </ul>
      )}
      {agregando ? (
        formularioNuevo(() => setAgregando(false))
      ) : cantidad < MAXIMO_ITEMS_CV ? (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input text-base font-semibold text-primary transition-[background-color,border-color] duration-200 hover:border-primary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary transition-[background-color,color,rotate] duration-300 group-hover:rotate-90 group-hover:bg-primary group-hover:text-primary-foreground">
            <Plus aria-hidden className="size-4" />
          </span>
          {textoAgregar}
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">Llegaste al máximo de {MAXIMO_ITEMS_CV}.</p>
      )}
    </div>
  );
}

type Experiencia = Pick<Tables<"experiencias">, "id" | "puesto" | "empresa" | "desde" | "hasta" | "tareas">;

/** Work experience, most recent first. */
export function SeccionExperiencias({ experiencias }: { experiencias: Experiencia[] }) {
  return (
    <ListaConAgregar
      vacio="Todavía no cargaste experiencia. También cuentan changas o trabajos sin registrar."
      textoAgregar={experiencias.length > 0 ? "Agregar otra experiencia" : "Agregar experiencia"}
      cantidad={experiencias.length}
      formularioNuevo={(cerrar) => <FormularioExperiencia onListo={cerrar} />}
    >
      {experiencias.map((experiencia) => (
        <ItemCv
          key={experiencia.id}
          tabla="experiencias"
          id={experiencia.id}
          titulo={experiencia.puesto}
          subtitulo={experiencia.empresa}
          etiquetas={[
            `${formatearMesAnio(experiencia.desde)} – ${experiencia.hasta ? formatearMesAnio(experiencia.hasta) : "actualidad"}`,
          ]}
          destacado={experiencia.hasta === null ? "Trabajo actual" : undefined}
          formulario={(cerrar) => <FormularioExperiencia experiencia={experiencia} onListo={cerrar} />}
        />
      ))}
    </ListaConAgregar>
  );
}

type Formacion = Pick<Tables<"formaciones">, "id" | "nivel" | "titulo" | "institucion" | "estado">;

/** Education and courses. */
export function SeccionFormaciones({ formaciones }: { formaciones: Formacion[] }) {
  return (
    <ListaConAgregar
      vacio="Todavía no cargaste estudios. Sumá también cursos y capacitaciones."
      textoAgregar={formaciones.length > 0 ? "Agregar otro estudio" : "Agregar estudio"}
      cantidad={formaciones.length}
      formularioNuevo={(cerrar) => <FormularioFormacion onListo={cerrar} />}
    >
      {formaciones.map((formacion) => (
        <ItemCv
          key={formacion.id}
          tabla="formaciones"
          id={formacion.id}
          titulo={formacion.titulo}
          subtitulo={formacion.institucion}
          etiquetas={[ETIQUETAS_NIVEL_FORMACION[formacion.nivel], ETIQUETAS_ESTADO_FORMACION[formacion.estado]]}
          formulario={(cerrar) => <FormularioFormacion formacion={formacion} onListo={cerrar} />}
        />
      ))}
    </ListaConAgregar>
  );
}
