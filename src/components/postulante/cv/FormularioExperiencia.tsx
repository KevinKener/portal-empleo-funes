"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarExperiencia, type EstadoCv } from "@/app/postulante/cv/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { Campo, ESTILO_AREA } from "@/components/formularios/Campo";
import { BotonesFormulario } from "@/components/postulante/cv/BotonesFormulario";
import { SelectorMesAnio, mesAnioDe } from "@/components/postulante/cv/SelectorMesAnio";
import { errorOrdenFechas, fechaDeMesAnio } from "@/lib/validaciones/cv";
import type { Tables } from "@/types/database";

type Experiencia = Pick<Tables<"experiencias">, "id" | "puesto" | "empresa" | "desde" | "hasta" | "tareas">;

const VACIO: EstadoCv = { errores: {}, mensaje: null, guardado: false };

/** Add or edit one work experience; closes itself once saved. */
export function FormularioExperiencia({ experiencia, onListo }: { experiencia?: Experiencia; onListo: () => void }) {
  const router = useRouter();
  const [estado, setEstado] = useState(VACIO);
  const [actual, setActual] = useState(experiencia ? experiencia.hasta === null : false);
  const [desde, setDesde] = useState(() => mesAnioDe(experiencia?.desde));
  const [hasta, setHasta] = useState(() => mesAnioDe(experiencia?.hasta));
  const [guardando, iniciar] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    iniciar(async () => {
      const resultado = await guardarExperiencia(VACIO, formData);
      if (!resultado.guardado) return setEstado(resultado);
      router.refresh();
      onListo();
    });
  }

  const { errores } = estado;
  // Checked while picking (tutor review 2026-10-20); the server checks it again.
  const ordenFechas = actual
    ? null
    : errorOrdenFechas(fechaDeMesAnio(desde.mes, desde.anio), fechaDeMesAnio(hasta.mes, hasta.anio));
  return (
    <form
      onSubmit={enviar}
      noValidate
      className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2"
    >
      {experiencia && <input type="hidden" name="id" value={experiencia.id} />}
      <AvisoFormulario error={estado.mensaje} />
      <Campo nombre="puesto" etiqueta="Puesto o tarea" ayuda="Por ejemplo: repositor, ayudante de cocina, niñera." error={errores.puesto} requerido>
        {(control) => <input {...control} defaultValue={experiencia?.puesto} maxLength={150} />}
      </Campo>
      <Campo nombre="empresa" etiqueta="Empresa o lugar (opcional)" ayuda="Si fue por tu cuenta o en una casa de familia, podés dejarlo vacío." error={errores.empresa}>
        {(control) => <input {...control} defaultValue={experiencia?.empresa ?? ""} maxLength={150} />}
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectorMesAnio prefijo="desde" leyenda="Desde" valor={desde} onCambiar={setDesde} error={errores.desde} requerido />
        <SelectorMesAnio
          prefijo="hasta"
          leyenda="Hasta"
          valor={hasta}
          onCambiar={setHasta}
          error={ordenFechas ?? (actual ? undefined : errores.hasta)}
          deshabilitado={actual}
          requerido
        />
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="actual"
          value="si"
          checked={actual}
          onChange={(evento) => {
            setActual(evento.target.checked);
            // A current job has no end date: do not leave an old one showing
            if (evento.target.checked) setHasta({ mes: "", anio: "" });
          }}
          className="size-5 accent-primary"
        />
        Trabajo ahí actualmente
      </label>
      <Campo nombre="tareas" etiqueta="¿Qué hacías? (opcional)" error={errores.tareas}>
        {(control) => <textarea {...control} className={ESTILO_AREA} defaultValue={experiencia?.tareas ?? ""} maxLength={1000} />}
      </Campo>
      <BotonesFormulario guardando={guardando} onCancelar={onListo} />
    </form>
  );
}
