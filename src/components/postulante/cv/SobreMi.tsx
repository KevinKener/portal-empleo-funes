"use client";

import { useActionState, useState, startTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { guardarSobreMi, type EstadoCv } from "@/app/postulante/cv/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { Campo, ESTILO_AREA } from "@/components/formularios/Campo";
import { buttonVariants } from "@/components/ui/button";
import { MAXIMO_SOBRE_MI } from "@/lib/validaciones/cv";

const INICIAL: EstadoCv = { errores: {}, mensaje: null, guardado: false };

/** "Sobre vos": a few lines in the person's own words, with guiding questions. */
export function SobreMi({ inicial }: { inicial: string }) {
  const [estado, guardar, guardando] = useActionState(guardarSobreMi, INICIAL);
  const [texto, setTexto] = useState(inicial);

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    formData.set("descripcion", texto);
    startTransition(() => guardar(formData));
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoFormulario error={estado.mensaje} aviso={estado.guardado ? "Guardamos tu presentación." : null} />
      <Campo
        nombre="descripcion"
        etiqueta="Contanos sobre vos"
        ayuda="Por ejemplo: qué sabés hacer, qué tipo de trabajo buscás, tu disponibilidad horaria."
        error={estado.errores.descripcion}
      >
        {(control) => (
          <textarea
            {...control}
            className={ESTILO_AREA}
            maxLength={MAXIMO_SOBRE_MI}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        )}
      </Campo>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {texto.length} / {MAXIMO_SOBRE_MI}
        </p>
        <button
          type="submit"
          disabled={guardando}
          className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}
        >
          {guardando && <LoaderCircle aria-hidden className="animate-spin" />}
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
