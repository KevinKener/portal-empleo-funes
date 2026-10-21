import Link from "next/link";
import { Building2 } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

// A missing or mistyped company id
export default function EmpresaAdminNoEncontrada() {
  return (
    <PantallaEstado
      icono={<Building2 aria-hidden className="size-10" />}
      titulo="No encontramos esta empresa"
      texto="Puede que el enlace esté incompleto. Buscala en la lista de empresas."
      acciones={
        <Link href="/admin/empresas" className={BOTON_PRINCIPAL}>
          Ver las empresas
        </Link>
      }
    />
  );
}
