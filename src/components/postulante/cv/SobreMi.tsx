"use client";

import { useActionState, useState, startTransition } from "react";
import { Check, LoaderCircle } from "lucide-react";
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
  const [enviado, setEnviado] = useState<string | null>(null);
  // "Guardado" only while the text is the one just saved
  const alDia = estado.guardado && texto === enviado;

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    formData.set("descripcion", texto);
    setEnviado(texto);
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
      <div className="flex items-center justify-between gap-4">
        {/* Length as a thin bar plus the count, so the limit is visible before reaching it */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span aria-hidden className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${Math.min(100, (texto.length / MAXIMO_SOBRE_MI) * 100)}%` }}
            />
          </span>
          <p className="shrink-0 text-sm text-muted-foreground">
            {texto.length} / {MAXIMO_SOBRE_MI}
          </p>
        </div>
        <button
          type="submit"
          disabled={guardando}
          className={buttonVariants({ className: "h-11 shrink-0 px-6 text-base shadow-md shadow-primary/20 hover:bg-primary-hover" })}
        >
          {guardando ? <LoaderCircle aria-hidden className="animate-spin" /> : alDia && <Check aria-hidden className="motion-safe:animate-festejo-pop" />}
          {guardando ? "Guardando…" : alDia ? "Guardado" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
