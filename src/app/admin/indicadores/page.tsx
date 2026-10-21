import type { Metadata } from "next";
import { SeccionEnCamino } from "@/components/admin/SeccionEnCamino";

export const metadata: Metadata = { title: "Indicadores" };

// Branch G (feature/admin-indicadores) replaces this page.
export default function IndicadoresAdminPage() {
  return (
    <SeccionEnCamino
      titulo="Indicadores"
      descripcion="Cómo funciona el portal, en números."
      funciones={[
        "Ver postulantes, empresas, ofertas y contrataciones por período.",
        "Conocer la tasa de empleabilidad, los rechazos por motivo y la oferta y demanda por rubro.",
        "Descargar el reporte semanal en PDF o Excel.",
      ]}
    />
  );
}
