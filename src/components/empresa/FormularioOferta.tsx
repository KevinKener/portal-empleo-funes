"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { guardarOferta, type EstadoFormularioOferta } from "@/app/empresa/ofertas/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { Campo, ESTILO_AREA } from "@/components/formularios/Campo";
import { Selector } from "@/components/formularios/Selector";
import { buttonVariants } from "@/components/ui/button";
import type { Categoria } from "@/lib/categorias";
import { ETIQUETAS_JORNADA } from "@/lib/formato";
import type { OfertaEmpresa } from "@/lib/ofertas-empresa";
import { JORNADAS, MAXIMO_DESCRIPCION, MAXIMO_REQUISITOS, MAXIMO_TITULO } from "@/lib/validaciones/ofertas";

const VACIO: EstadoFormularioOferta = { errores: {}, mensaje: null };
const OPCIONES_JORNADA = JORNADAS.map((jornada) => ({ valor: jornada, texto: ETIQUETAS_JORNADA[jornada] }));

type PropsFormularioOferta = {
  categorias: Categoria[];
  oferta?: OfertaEmpresa;
  /** Where "Cancelar" goes. */
  volver: string;
};

/**
 * New or draft offer. Saving keeps it as a draft (Rule 9); sending it to
 * review is a separate, deliberate step on the offer's page.
 * Called by hand (not as a form action) so React does not reset the fields
 * when the server returns errors.
 */
export function FormularioOferta({ categorias, oferta, volver }: PropsFormularioOferta) {
  const [estado, setEstado] = useState(VACIO);
  const [guardando, iniciar] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    // On success the action redirects to the offer's page.
    iniciar(async () => setEstado(await guardarOferta(VACIO, formData)));
  }

  const { errores } = estado;
  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {oferta && <input type="hidden" name="id" value={oferta.id} />}
      <AvisoFormulario error={estado.mensaje} />

      <Campo nombre="titulo" etiqueta="Puesto" ayuda="Por ejemplo: cajero/a, ayudante de cocina, chofer." error={errores.titulo} requerido>
        {(control) => <input {...control} defaultValue={oferta?.titulo} maxLength={MAXIMO_TITULO} />}
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="categoria_id" etiqueta="Rubro" error={errores.categoria_id} requerido>
          {(control) => (
            <Selector
              control={control}
              opciones={categorias.map((categoria) => ({ valor: categoria.id, texto: categoria.nombre }))}
              inicial={oferta?.categoria_id}
              placeholder="Elegí un rubro"
            />
          )}
        </Campo>
        <Campo nombre="jornada" etiqueta="Jornada" error={errores.jornada} requerido>
          {(control) => <Selector control={control} opciones={OPCIONES_JORNADA} inicial={oferta?.jornada} placeholder="Elegí la jornada" />}
        </Campo>
      </div>

      <Campo
        nombre="descripcion"
        etiqueta="Descripción"
        ayuda="Contá las tareas, el horario, el lugar de trabajo y lo que ofrecen."
        error={errores.descripcion}
        requerido
      >
        {(control) => (
          <textarea {...control} className={ESTILO_AREA} defaultValue={oferta?.descripcion} maxLength={MAXIMO_DESCRIPCION} />
        )}
      </Campo>

      <Campo
        nombre="requisitos"
        etiqueta="Requisitos (opcional)"
        ayuda="Experiencia, estudios, licencias o lo que haga falta para el puesto."
        error={errores.requisitos}
      >
        {(control) => (
          <textarea {...control} className={ESTILO_AREA} defaultValue={oferta?.requisitos ?? ""} maxLength={MAXIMO_REQUISITOS} />
        )}
      </Campo>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={volver} className={buttonVariants({ variant: "ghost", className: "h-11 px-5 text-base" })}>
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando}
          className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}
        >
          {guardando && <LoaderCircle aria-hidden className="animate-spin" />}
          {guardando ? "Guardando…" : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
