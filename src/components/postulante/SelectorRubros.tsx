"use client";

import { useActionState, useState, startTransition } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { guardarRubros, type EstadoRubros } from "@/app/postulante/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import type { Categoria } from "@/lib/categorias";
import { cn } from "@/lib/utils";

const INICIAL: EstadoRubros = { error: null, aviso: null };

/**
 * Category picker (Rule 5: several at once). Each chip is a real checkbox
 * inside its label, so keyboard and screen readers keep native behavior;
 * the pill shape only makes the tap target bigger on phones.
 */
export function SelectorRubros({ categorias, elegidas }: { categorias: Categoria[]; elegidas: string[] }) {
  const [estado, guardar, guardando] = useActionState(guardarRubros, INICIAL);
  const [seleccion, setSeleccion] = useState(() => new Set(elegidas));

  function alternar(id: string) {
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    seleccion.forEach((id) => formData.append("categoria", id));
    startTransition(() => guardar(formData));
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <AvisoFormulario error={estado.error} aviso={estado.aviso} />

      <fieldset>
        <legend className="sr-only">Rubros que te interesan</legend>
        <div className="flex flex-wrap gap-2">
          {categorias.map((categoria) => {
            const marcada = seleccion.has(categoria.id);
            return (
              <label
                key={categoria.id}
                className={cn(
                  "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors select-none",
                  "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  marcada
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:bg-accent",
                )}
              >
                <input
                  type="checkbox"
                  name="categoria"
                  value={categoria.id}
                  checked={marcada}
                  onChange={() => alternar(categoria.id)}
                  className="sr-only"
                />
                {marcada && <Check aria-hidden className="size-4 motion-safe:animate-in motion-safe:zoom-in-50" />}
                {categoria.nombre}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Sticky on phones: the save button stays reachable after a long list */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {seleccion.size === 1 ? "1 rubro elegido" : `${seleccion.size} rubros elegidos`}
        </p>
        <button
          type="submit"
          disabled={guardando}
          className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}
        >
          {guardando && <LoaderCircle aria-hidden className="animate-spin" />}
          {guardando ? "Guardando…" : "Guardar rubros"}
        </button>
      </div>
    </form>
  );
}
