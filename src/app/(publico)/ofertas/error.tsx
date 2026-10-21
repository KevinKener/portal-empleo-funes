"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

// Covers the listing and the detail: shown when the database cannot be reached.
export default function OfertasError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PantallaEstado
      tono="error"
      icono={<TriangleAlert aria-hidden className="size-10" />}
      titulo="No pudimos cargar las ofertas"
      texto="Puede ser un problema momentáneo de conexión. Probá de nuevo en unos segundos; si sigue pasando, avisá a la Oficina de Empleo."
      acciones={
        <button type="button" onClick={() => retry()} className={BOTON_PRINCIPAL}>
          <RotateCcw aria-hidden className="size-4" /> Reintentar
        </button>
      }
    />
  );
}
