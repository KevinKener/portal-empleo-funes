import Link from "next/link";
import { ArrowRight, House, MapPinOff } from "lucide-react";
import { Encabezado } from "@/components/layout/Encabezado";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, PantallaEstado } from "@/components/layout/PantallaEstado";
import { PiePagina } from "@/components/layout/PiePagina";

/** 404 for any address that does not exist, with the site's header and footer. */
export default function NoEncontrada() {
  return (
    <div className="flex min-h-svh flex-col">
      <Encabezado />
      <main className="flex flex-1 items-center">
        <PantallaEstado
          icono={<MapPinOff aria-hidden className="size-10" />}
          titulo="No encontramos esta página"
          texto="Puede que el enlace esté mal escrito o que la página ya no exista. Desde acá podés seguir buscando trabajo."
          acciones={
            <>
              <Link href="/ofertas" className={BOTON_PRINCIPAL}>
                Ver ofertas <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link href="/" className={BOTON_SECUNDARIO}>
                <House aria-hidden className="size-4" /> Ir al inicio
              </Link>
            </>
          }
        />
      </main>
      <PiePagina />
    </div>
  );
}
