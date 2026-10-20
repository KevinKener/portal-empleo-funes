"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Info, LoaderCircle, Pencil, Send, Trash2, Undo2, XCircle, type LucideIcon } from "lucide-react";
import {
  cambiarEstadoOferta,
  eliminarBorrador,
  usarComoBase,
  type ResultadoAccion,
} from "@/app/empresa/ofertas/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import type { EstadoOferta } from "@/lib/estados";

type Accion = {
  clave: string;
  texto: string;
  Icono: LucideIcon;
  variante: "default" | "outline" | "destructive";
  ejecutar: () => Promise<ResultadoAccion>;
  /** What happens, shown next to the button before it is pressed (one notice, no second tap). */
  aviso?: string;
};

type PropsAccionesOferta = {
  id: string;
  estado: EstadoOferta;
  /** Whether the company may create offers (Rule 3); copying creates one. */
  puedeCrear: boolean;
};

function accionesPara(id: string, estado: EstadoOferta, puedeCrear: boolean): Accion[] {
  switch (estado) {
    case "borrador":
      return [
        { clave: "enviar", texto: "Enviar a revisión", Icono: Send, variante: "default", ejecutar: () => cambiarEstadoOferta(id, "pendiente"), aviso: "Mientras la Oficina de Empleo la revisa no vas a poder editarla." },
        { clave: "eliminar", texto: "Eliminar borrador", Icono: Trash2, variante: "destructive", ejecutar: () => eliminarBorrador(id), aviso: "Eliminar el borrador no se puede deshacer." },
      ];
    case "pendiente":
      // Rule 9: only the company takes it back, to edit it before sending again.
      return [{ clave: "retirar", texto: "Volver a borrador", Icono: Undo2, variante: "outline", ejecutar: () => cambiarEstadoOferta(id, "borrador"), aviso: "La Oficina deja de revisarla y vuelve a ser un borrador que podés editar." }];
    case "publicada":
      return [{ clave: "cerrar", texto: "Cerrar oferta", Icono: XCircle, variante: "destructive", ejecutar: () => cambiarEstadoOferta(id, "cerrada"), aviso: "Al cerrarla deja de verse en el portal y no recibe más postulaciones. No se puede volver a abrir." }];
    case "rechazada":
    case "cerrada":
      return puedeCrear
        ? [{ clave: "copiar", texto: "Usar como base", Icono: Copy, variante: "outline", ejecutar: () => usarComoBase(id) }]
        : [];
  }
}

/**
 * What the company can do with an offer in its current status. Status
 * changes come from src/lib/estados.ts on the server; this only offers them.
 * Each action runs on the first tap; what it means is said beforehand, next
 * to the buttons (tutor review 2026-10-20: one notice, no double confirmation).
 */
export function AccionesOferta({ id, estado, puedeCrear }: PropsAccionesOferta) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  const acciones = accionesPara(id, estado, puedeCrear);

  function correr(accion: Accion) {
    setError(null);
    setEnCurso(accion.clave);
    iniciar(async () => {
      // Deleting and copying redirect on success; the rest stay on the page.
      const resultado = await accion.ejecutar();
      setEnCurso(null);
      if (resultado.error) return setError(resultado.error);
      router.refresh();
    });
  }

  if (acciones.length === 0) return null;

  return (
    <div className="space-y-3">
      <AvisoFormulario error={error} />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {estado === "borrador" && (
          <Link href={`/empresa/ofertas/${id}/editar`} className={buttonVariants({ variant: "outline", className: "h-11 px-5 text-base" })}>
            <Pencil aria-hidden /> Editar
          </Link>
        )}
        {acciones.map((accion) => (
          <button
            key={accion.clave}
            type="button"
            disabled={enCurso !== null}
            aria-describedby={accion.aviso ? `aviso-${accion.clave}` : undefined}
            onClick={() => correr(accion)}
            className={buttonVariants({
              variant: accion.variante,
              className: accion.variante === "default" ? "h-11 px-5 text-base hover:bg-primary-hover" : "h-11 px-5 text-base",
            })}
          >
            {enCurso === accion.clave ? <LoaderCircle aria-hidden className="animate-spin" /> : <accion.Icono aria-hidden />}
            {accion.texto}
          </button>
        ))}
      </div>

      {acciones.some((accion) => accion.aviso) && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {acciones.map(
            (accion) =>
              accion.aviso && (
                <li key={accion.clave} id={`aviso-${accion.clave}`} className="flex gap-2">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  {accion.aviso}
                </li>
              ),
          )}
        </ul>
      )}
    </div>
  );
}
