import type { Metadata } from "next";
import { SeccionEnCamino } from "@/components/admin/SeccionEnCamino";

export const metadata: Metadata = { title: "Postulantes" };

// Branches D (search) and E (feature/admin-domicilios) replace this page.
export default function PostulantesAdminPage() {
  return (
    <SeccionEnCamino
      titulo="Postulantes"
      descripcion="Las personas registradas en el portal."
      funciones={["Buscar postulantes por nombre, DNI, rubro o localidad.", "Ver el perfil, el CV y las postulaciones de cada persona.", "Verificar los comprobantes de domicilio de los vecinos de Funes."]}
    />
  );
}
