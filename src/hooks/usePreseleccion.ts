"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { preseleccionar, rechazarPostulaciones, type ResultadoPreseleccion } from "@/app/admin/ofertas/[id]/postulantes/actions";
import type { MotivoRechazoPostulacion } from "@/lib/estados";

type Accion = "preseleccionar" | "rechazar";

const personas = (n: number) => (n === 1 ? "1 persona" : `${n} personas`);

/**
 * Runs the Office's pre-selection actions over some applications of an offer
 * (branch D) and keeps what the screen needs: which action is running, the
 * error, and the confirmation toast. Refreshes the page on success.
 */
export function usePreseleccion(ofertaId: string, onHecho?: () => void) {
  const router = useRouter();
  const [enCurso, setEnCurso] = useState<Accion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  function correr(accion: Accion, pedido: () => Promise<ResultadoPreseleccion>, pedidos: number) {
    setError(null);
    setAviso(null);
    setEnCurso(accion);
    iniciar(async () => {
      const { error: errorAccion, cambiados } = await pedido();
      setEnCurso(null);
      if (errorAccion) return setError(errorAccion);
      // Some rows may have changed meanwhile (another Admin): say how many moved
      const aparte = pedidos > cambiados ? ` ${personas(pedidos - cambiados)} ya había${pedidos - cambiados === 1 ? "" : "n"} cambiado.` : "";
      setAviso(
        accion === "preseleccionar"
          ? `${personas(cambiados)} preseleccionada${cambiados === 1 ? "" : "s"}: la empresa ya puede verla${cambiados === 1 ? "" : "s"}.${aparte}`
          : `${personas(cambiados)} rechazada${cambiados === 1 ? "" : "s"}: ya ve${cambiados === 1 ? "" : "n"} el motivo en su panel.${aparte}`,
      );
      onHecho?.();
      router.refresh();
    });
  }

  return {
    enCurso,
    error,
    aviso,
    preseleccionar: (ids: string[]) => correr("preseleccionar", () => preseleccionar(ofertaId, ids), ids.length),
    rechazar: (ids: string[], motivo: MotivoRechazoPostulacion) => correr("rechazar", () => rechazarPostulaciones(ofertaId, ids, motivo), ids.length),
  };
}
