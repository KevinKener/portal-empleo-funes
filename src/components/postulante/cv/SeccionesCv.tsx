"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { FormularioExperiencia } from "@/components/postulante/cv/FormularioExperiencia";
import { FormularioFormacion } from "@/components/postulante/cv/FormularioFormacion";
import { ItemCv } from "@/components/postulante/cv/ItemCv";
import { buttonVariants } from "@/components/ui/button";
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

/** Summary list + "Agregar otra" (GOV.UK / DWP "Add another"). */
function ListaConAgregar({ vacio, textoAgregar, cantidad, formularioNuevo, children }: PropsLista) {
  const [agregando, setAgregando] = useState(false);

  return (
    <div className="space-y-3">
      {cantidad === 0 && !agregando && <p className="text-sm text-muted-foreground">{vacio}</p>}
      {cantidad > 0 && <ul className="divide-y divide-border">{children}</ul>}
      {agregando ? (
        formularioNuevo(() => setAgregando(false))
      ) : cantidad < MAXIMO_ITEMS_CV ? (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          className={buttonVariants({ variant: "outline", className: "h-11 px-5 text-base" })}
        >
          <Plus aria-hidden />
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
          detalle={
            <>
              {experiencia.empresa && <p>{experiencia.empresa}</p>}
              <p>
                {formatearMesAnio(experiencia.desde)} –{" "}
                {experiencia.hasta ? formatearMesAnio(experiencia.hasta) : "actualidad"}
              </p>
            </>
          }
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
          detalle={
            <p>
              {ETIQUETAS_NIVEL_FORMACION[formacion.nivel]} · {ETIQUETAS_ESTADO_FORMACION[formacion.estado]}
              {formacion.institucion && ` · ${formacion.institucion}`}
            </p>
          }
          formulario={(cerrar) => <FormularioFormacion formacion={formacion} onListo={cerrar} />}
        />
      ))}
    </ListaConAgregar>
  );
}
