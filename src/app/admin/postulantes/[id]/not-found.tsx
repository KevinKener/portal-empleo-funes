import Link from "next/link";
import { UserX } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

// A wrong id, or an account that no longer exists
export default function PostulanteAdminNoEncontrado() {
  return (
    <PantallaEstado
      icono={<UserX aria-hidden className="size-10" />}
      titulo="No encontramos a esta persona"
      texto="Puede que el enlace esté incompleto o que la cuenta ya no exista."
      acciones={
        <Link href="/admin/postulantes" className={BOTON_PRINCIPAL}>
          Ver los postulantes
        </Link>
      }
    />
  );
}
