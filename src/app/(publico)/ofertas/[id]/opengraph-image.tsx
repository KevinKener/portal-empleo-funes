import { ImageResponse } from "next/og";
import { escudoBlanco, fuentesCompartir, TAMANIO_COMPARTIR, TarjetaCompartir } from "@/components/og/TarjetaCompartir";
import { ETIQUETAS_JORNADA } from "@/lib/formato";
import { urlLogo } from "@/lib/logo-empresa";
import { obtenerOfertaPublica } from "@/lib/ofertas";
import { esUuid } from "@/lib/validaciones/ofertas";

export const alt = "Oferta de trabajo en el Portal de Empleo de Funes";
export const size = TAMANIO_COMPARTIR;
export const contentType = "image/png";

/**
 * The preview WhatsApp shows for a shared offer: title, company (logo or
 * initial), category and working hours. Only public data from the
 * ofertas_publicas view; unpublished offers get the portal's generic card.
 */
export default async function Imagen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [escudo, oferta] = await Promise.all([escudoBlanco(), esUuid(id) ? obtenerOfertaPublica(id) : null]);

  return new ImageResponse(
    oferta ? (
      <TarjetaCompartir
        escudo={escudo}
        titulo={oferta.titulo ?? "Oferta de trabajo"}
        empresa={{ nombre: oferta.empresa_nombre ?? "", logo: urlLogo(oferta.empresa_logo_url) }}
        datos={[oferta.categoria_nombre, oferta.jornada ? ETIQUETAS_JORNADA[oferta.jornada] : null].filter((d): d is string => Boolean(d))}
        pie="Revisada por la Oficina de Empleo · Postulate en el Portal de Empleo"
      />
    ) : (
      <TarjetaCompartir escudo={escudo} titulo="Encontrá trabajo cerca de casa" pie="Portal de Empleo de Funes" />
    ),
    { ...size, fonts: await fuentesCompartir() },
  );
}
