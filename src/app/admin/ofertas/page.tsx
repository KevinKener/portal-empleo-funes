import type { Metadata } from "next";
import { SeccionEnCamino } from "@/components/admin/SeccionEnCamino";

export const metadata: Metadata = { title: "Ofertas" };

// Branches B (feature/admin-ofertas) and D (feature/admin-preseleccion) replace this page.
export default function OfertasAdminPage() {
  return (
    <SeccionEnCamino
      titulo="Ofertas"
      descripcion="Las ofertas que envían las empresas y sus postulantes."
      funciones={[
        "Revisar cada oferta tal como la van a ver los postulantes, y publicarla o rechazarla con el motivo.",
        "Ver quién se postuló, primero los vecinos de Funes.",
        "Preseleccionar postulantes para la empresa o rechazarlos con el motivo.",
      ]}
    />
  );
}
