"use client";

import { AccionesPreseleccion } from "@/components/admin/AccionesPreseleccion";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { usePreseleccion } from "@/hooks/usePreseleccion";

/**
 * The decision on one application from its candidate page. Stays mounted
 * after deciding (the page passes `pendiente={false}`), so the confirmation
 * toast is not lost when the buttons go away.
 */
export function AccionesPostulacion({ ofertaId, postulacionId, pendiente }: { ofertaId: string; postulacionId: string; pendiente: boolean }) {
  const acciones = usePreseleccion(ofertaId);
  return (
    <div className="space-y-3">
      <AvisoFormulario error={acciones.error} aviso={acciones.aviso} />
      {pendiente && <AccionesPreseleccion ids={[postulacionId]} acciones={acciones} />}
    </div>
  );
}
