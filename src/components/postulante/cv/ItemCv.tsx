"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { eliminarItemCv } from "@/app/postulante/cv/actions";
import { buttonVariants } from "@/components/ui/button";

type PropsItemCv = {
  tabla: "experiencias" | "formaciones";
  id: string;
  titulo: string;
  /** Company or institution, under the title. */
  subtitulo?: string | null;
  /** Short facts shown as pills (dates, level, status). */
  etiquetas: string[];
  /** Badge next to the title (e.g. "Trabajo actual"). */
  destacado?: string;
  /** The edit form, rendered in place of the summary while editing. */
  formulario: (cerrar: () => void) => ReactNode;
};

/**
 * One item of the CV timeline: a dot on the line and a card with the
 * summary, Change and Remove. Removing asks for a second tap instead of a
 * dialog (simpler on phones).
 */
export function ItemCv({ tabla, id, titulo, subtitulo, etiquetas, destacado, formulario }: PropsItemCv) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrando, iniciar] = useTransition();

  if (editando) return <li className="relative pl-8">{formulario(() => setEditando(false))}</li>;

  function borrar() {
    iniciar(async () => {
      const resultado = await eliminarItemCv(tabla, id);
      if (resultado.error) return setError(resultado.error);
      router.refresh();
    });
  }

  return (
    <li className="group relative pl-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2">
      {/* Dot on the timeline */}
      <span
        aria-hidden
        className="absolute top-5 left-[0.6875rem] z-[1] size-3.5 -translate-x-1/2 rounded-full border-[3px] border-card bg-primary ring-2 ring-primary/30 transition-transform duration-300 group-hover:scale-125"
      />
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-[border-color,box-shadow] duration-200 group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/[0.05] sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {titulo}
            {destacado && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{destacado}</span>}
          </p>
          {subtitulo && <p className="text-sm text-muted-foreground">{subtitulo}</p>}
          <ul className="flex flex-wrap gap-1.5">
            {etiquetas.map((etiqueta) => (
              <li key={etiqueta} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                {etiqueta}
              </li>
            ))}
          </ul>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex gap-2">
          {confirmando ? (
            <>
              <button
                type="button"
                onClick={borrar}
                disabled={borrando}
                className={buttonVariants({ variant: "destructive", size: "lg" })}
              >
                {borrando ? "Borrando…" : "Sí, borrar"}
              </button>
              <button type="button" onClick={() => setConfirmando(false)} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditando(true)} className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Pencil aria-hidden />
                Cambiar<span className="sr-only"> {titulo}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                className={buttonVariants({ variant: "ghost", size: "lg", className: "text-destructive" })}
              >
                <Trash2 aria-hidden />
                <span className="sr-only">Borrar {titulo}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
