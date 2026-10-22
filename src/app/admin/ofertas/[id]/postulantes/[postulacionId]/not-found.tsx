import Link from "next/link";
import { UserX } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

// A wrong id, or an application of another offer
export default function PostulacionAdminNoEncontrada() {
  return (
    <PantallaEstado
      icono={<UserX aria-hidden className="size-10" />}
      titulo="No encontramos esta postulación"
      texto="Puede que el enlace esté incompleto o que sea de otra oferta."
      acciones={
        <Link href="/admin/ofertas?estado=publicada" className={BOTON_PRINCIPAL}>
          Ver las ofertas publicadas
        </Link>
      }
    />
  );
}
