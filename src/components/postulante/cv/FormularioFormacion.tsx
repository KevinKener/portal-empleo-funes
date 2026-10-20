"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarFormacion, type EstadoCv } from "@/app/postulante/cv/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { Campo } from "@/components/formularios/Campo";
import { Selector } from "@/components/formularios/Selector";
import { BotonesFormulario } from "@/components/postulante/cv/BotonesFormulario";
import { ETIQUETAS_ESTADO_FORMACION, ETIQUETAS_NIVEL_FORMACION } from "@/lib/formato";
import { ESTADOS_FORMACION, NIVELES_FORMACION } from "@/lib/validaciones/cv";
import type { Tables } from "@/types/database";

type Formacion = Pick<Tables<"formaciones">, "id" | "nivel" | "titulo" | "institucion" | "estado">;

const NIVELES = NIVELES_FORMACION.map((nivel) => ({ valor: nivel, texto: ETIQUETAS_NIVEL_FORMACION[nivel] }));
const ESTADOS = ESTADOS_FORMACION.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO_FORMACION[estado] }));

const VACIO: EstadoCv = { errores: {}, mensaje: null, guardado: false };

/** Add or edit one education item; closes itself once saved. */
export function FormularioFormacion({ formacion, onListo }: { formacion?: Formacion; onListo: () => void }) {
  const router = useRouter();
  const [estado, setEstado] = useState(VACIO);
  const [guardando, iniciar] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    iniciar(async () => {
      const resultado = await guardarFormacion(VACIO, formData);
      if (!resultado.guardado) return setEstado(resultado);
      router.refresh();
      onListo();
    });
  }

  const { errores } = estado;
  return (
    <form
      onSubmit={enviar}
      noValidate
      className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2"
    >
      {formacion && <input type="hidden" name="id" value={formacion.id} />}
      <AvisoFormulario error={estado.mensaje} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="nivel" etiqueta="Nivel" error={errores.nivel} requerido>
          {(control) => <Selector control={control} opciones={NIVELES} inicial={formacion?.nivel} />}
        </Campo>
        <Campo nombre="estado" etiqueta="¿Lo terminaste?" error={errores.estado} requerido>
          {(control) => <Selector control={control} opciones={ESTADOS} inicial={formacion?.estado} />}
        </Campo>
      </div>
      <Campo
        nombre="titulo"
        etiqueta="Título o curso"
        ayuda="Por ejemplo: Bachiller en Economía, Manipulación de alimentos."
        error={errores.titulo}
        requerido
      >
        {(control) => <input {...control} defaultValue={formacion?.titulo} maxLength={150} />}
      </Campo>
      <Campo nombre="institucion" etiqueta="Escuela o institución (opcional)" error={errores.institucion}>
        {(control) => <input {...control} defaultValue={formacion?.institucion ?? ""} maxLength={150} />}
      </Campo>
      <BotonesFormulario guardando={guardando} onCancelar={onListo} />
    </form>
  );
}
