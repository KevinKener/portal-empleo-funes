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
  detalle: ReactNode;
  /** The edit form, rendered in place of the summary while editing. */
  formulario: (cerrar: () => void) => ReactNode;
};

/**
 * One row of an "add another" summary list: summary, Change and Remove.
 * Removing asks for a second tap instead of a dialog (simpler on phones).
 */
export function ItemCv({ tabla, id, titulo, detalle, formulario }: PropsItemCv) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrando, iniciar] = useTransition();

  if (editando) return <li className="py-4">{formulario(() => setEditando(false))}</li>;

  function borrar() {
    iniciar(async () => {
      const resultado = await eliminarItemCv(tabla, id);
      if (resultado.error) return setError(resultado.error);
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start motion-safe:animate-in motion-safe:fade-in">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{titulo}</p>
        <div className="text-sm text-muted-foreground">{detalle}</div>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
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
    </li>
  );
}
