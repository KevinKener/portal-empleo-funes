import type { Metadata } from "next";
import { SeccionEnCamino } from "@/components/admin/SeccionEnCamino";

export const metadata: Metadata = { title: "Empresas" };

// Branch C (feature/admin-empresas) replaces this page.
export default function EmpresasAdminPage() {
  return (
    <SeccionEnCamino
      titulo="Empresas"
      descripcion="Las empresas registradas en el portal y las que esperan verificación."
      funciones={["Ver los datos y la constancia de ARCA de cada empresa.", "Verificar o rechazar empresas nuevas, con el motivo.", "Ver las ofertas de cada empresa."]}
    />
  );
}
