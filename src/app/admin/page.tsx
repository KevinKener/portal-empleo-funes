import type { Metadata } from "next";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";

export const metadata: Metadata = { title: "Administración" };

/** Employment Office home. Approvals, pre-selection and metrics arrive in Phase 6. */
export default function AdminPage() {
  return (
    <PanelBienvenida
      saludo="Oficina de Empleo"
      descripcion="Desde acá vas a aprobar empresas y ofertas, verificar domicilios, preseleccionar postulantes y ver los indicadores."
    />
  );
}
