import { ImageResponse } from "next/og";
import { escudoBlanco, fuentesCompartir, TAMANIO_COMPARTIR, TarjetaCompartir } from "@/components/og/TarjetaCompartir";

export const alt = "Portal de Empleo de la Municipalidad de Funes";
export const size = TAMANIO_COMPARTIR;
export const contentType = "image/png";

/** The preview for any portal page without its own (home, offers list...). */
export default async function Imagen() {
  return new ImageResponse(
    (
      <TarjetaCompartir
        escudo={await escudoBlanco()}
        titulo="Encontrá trabajo cerca de casa"
        datos={["Ofertas de empresas de Funes", "Revisadas por la Municipalidad"]}
        pie="Portal de Empleo · Oficina de Empleo de la Municipalidad de Funes"
      />
    ),
    { ...size, fonts: await fuentesCompartir() },
  );
}
