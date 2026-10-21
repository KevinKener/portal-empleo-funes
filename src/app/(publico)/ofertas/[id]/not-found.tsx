import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { BOTON_PRINCIPAL, PantallaEstado } from "@/components/layout/PantallaEstado";

/** An offer that is missing or no longer published (Rule 2: both look the same). */
export default function OfertaNoEncontrada() {
  return (
    <PantallaEstado
      icono={<SearchX aria-hidden className="size-10" />}
      titulo="Esta oferta ya no está disponible"
      texto="Puede que se haya cerrado o que el enlace no sea correcto. Hay otras ofertas publicadas que te pueden interesar."
      acciones={
        <Link href="/ofertas" className={BOTON_PRINCIPAL}>
          Ver ofertas publicadas <ArrowRight aria-hidden className="size-4" />
        </Link>
      }
    />
  );
}
