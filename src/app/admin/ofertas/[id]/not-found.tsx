import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

// A missing id, or a company's draft (the Office only sees offers once they are sent)
export default function OfertaAdminNoEncontrada() {
  return (
    <PantallaEstado
      icono={<FileQuestion aria-hidden className="size-10" />}
      titulo="No encontramos esta oferta"
      texto="Puede que la empresa la haya vuelto a borrador o que el enlace esté incompleto."
      acciones={
        <Link href="/admin/ofertas" className={BOTON_PRINCIPAL}>
          Ver las ofertas
        </Link>
      }
    />
  );
}
