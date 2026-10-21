"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

// Shown when the offers cannot be read (e.g. the database is unreachable).
export default function OfertasEmpresaError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PantallaEstado
      tono="error"
      icono={<TriangleAlert aria-hidden className="size-10" />}
      titulo="No pudimos cargar tus ofertas"
      texto="Puede ser un problema momentáneo de conexión. Probá de nuevo en unos segundos; si sigue pasando, avisá a la Oficina de Empleo."
      acciones={
        <button type="button" onClick={() => retry()} className={BOTON_PRINCIPAL}>
          <RotateCcw aria-hidden className="size-4" /> Reintentar
        </button>
      }
    />
  );
}
