"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, LoaderCircle, Pencil, Send, Trash2, Undo2, XCircle, type LucideIcon } from "lucide-react";
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
  /** Asked inline before running, for steps that are hard to undo. */
  confirmacion?: string;
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
        { clave: "enviar", texto: "Enviar a revisión", Icono: Send, variante: "default", ejecutar: () => cambiarEstadoOferta(id, "pendiente"), confirmacion: "Mientras la Oficina de Empleo la revisa no vas a poder editarla. ¿La enviamos?" },
        { clave: "eliminar", texto: "Eliminar borrador", Icono: Trash2, variante: "destructive", ejecutar: () => eliminarBorrador(id), confirmacion: "El borrador se borra y no se puede recuperar. ¿Lo eliminamos?" },
      ];
    case "pendiente":
      // Rule 9: only the company takes it back, to edit it before sending again.
      return [{ clave: "retirar", texto: "Volver a borrador", Icono: Undo2, variante: "outline", ejecutar: () => cambiarEstadoOferta(id, "borrador"), confirmacion: "La Oficina deja de revisarla y vuelve a ser un borrador que podés editar. ¿Seguimos?" }];
    case "publicada":
      return [{ clave: "cerrar", texto: "Cerrar oferta", Icono: XCircle, variante: "destructive", ejecutar: () => cambiarEstadoOferta(id, "cerrada"), confirmacion: "Deja de verse en el portal y no recibe más postulaciones. No se puede volver a abrir. ¿La cerramos?" }];
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
 */
export function AccionesOferta({ id, estado, puedeCrear }: PropsAccionesOferta) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<Accion | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  const acciones = accionesPara(id, estado, puedeCrear);

  function correr(accion: Accion) {
    setError(null);
    setConfirmando(null);
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

      {confirmando ? (
        <div role="alertdialog" aria-labelledby="confirmacion-texto" className="space-y-3 rounded-xl border border-border bg-muted p-4">
          <p id="confirmacion-texto" className="text-sm font-medium">
            {confirmando.confirmacion}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" onClick={() => setConfirmando(null)} className={buttonVariants({ variant: "ghost", className: "h-11 px-5 text-base" })}>
              Cancelar
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => correr(confirmando)}
              className={buttonVariants({ variant: confirmando.variante, className: "h-11 px-5 text-base" })}
            >
              Sí, {confirmando.texto.toLowerCase()}
            </button>
          </div>
        </div>
      ) : (
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
              onClick={() => (accion.confirmacion ? setConfirmando(accion) : correr(accion))}
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
      )}
    </div>
  );
}
