import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Share previews (Open Graph images) that WhatsApp and social networks show
 * for a link to the portal, rendered by next/og's ImageResponse: inline styles
 * and flexbox only (no Tailwind there). Brand green, the Funes shield and the
 * facts that make someone tap the link.
 */

export const TAMANIO_COMPARTIR = { width: 1200, height: 630 };

const VERDE = "#052f14";
const VERDE_CLARO = "#e8f1eb";

/**
 * The portal's typefaces for ImageResponse (TTF only, files in ./fuentes,
 * SIL Open Font License): Sora for the title, Be Vietnam Pro for the rest.
 */
export async function fuentesCompartir() {
  const leer = (archivo: string) => readFile(join(process.cwd(), "src/components/og/fuentes", archivo));
  const [sora, regular, semibold] = await Promise.all([
    leer("Sora-Bold.ttf"),
    leer("BeVietnamPro-Regular.ttf"),
    leer("BeVietnamPro-SemiBold.ttf"),
  ]);
  return [
    { name: "Sora", data: sora, weight: 700 as const, style: "normal" as const },
    { name: "Be Vietnam Pro", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Be Vietnam Pro", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

/** The white shield as a data URL, read once (ImageResponse cannot read /public by path). */
export async function escudoBlanco(): Promise<string> {
  const archivo = await readFile(join(process.cwd(), "public/marca/escudo-blanco.png"));
  return `data:image/png;base64,${archivo.toString("base64")}`;
}

type PropsTarjeta = {
  escudo: string;
  /** Big line: the job title, or the portal's tagline. */
  titulo: string;
  /** Company shown above the title (offer previews). */
  empresa?: { nombre: string; logo: string | null };
  /** Small facts as pills (category, working hours). */
  datos?: string[];
  /** Bottom line. */
  pie: string;
};

export function TarjetaCompartir({ escudo, titulo, empresa, datos = [], pie }: PropsTarjeta) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        background: `linear-gradient(135deg, ${VERDE} 0%, #074a1f 100%)`,
        color: "#fff",
        fontFamily: "Be Vietnam Pro",
        position: "relative",
      }}
    >
      {/* Big shield watermark, like the portal's green banners */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
      <img src={escudo} alt="" width={460} height={460} style={{ position: "absolute", right: -60, bottom: -90, opacity: 0.08 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", background: "#fff", borderRadius: 18, padding: "10px 18px 10px 10px", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: VERDE_CLARO, alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
            <img src={escudo} alt="" width={34} height={34} style={{ filter: "brightness(0)", opacity: 0.7 }} />
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: VERDE }}>Oficina de Empleo · Municipalidad de Funes</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {empresa && (
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 76,
                height: 76,
                borderRadius: 20,
                background: "#fff",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontFamily: "Sora",
                fontWeight: 700,
                color: VERDE,
                overflow: "hidden",
              }}
            >
              {empresa.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img
                <img src={empresa.logo} alt="" width={76} height={76} style={{ objectFit: "contain" }} />
              ) : (
                empresa.nombre.trim().charAt(0).toLocaleUpperCase("es-AR") || "?"
              )}
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, opacity: 0.9 }}>{empresa.nombre}</div>
          </div>
        )}
        <div style={{ display: "flex", fontFamily: "Sora", fontSize: titulo.length > 34 ? 64 : 82, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, maxWidth: 1000 }}>
          {titulo}
        </div>
        {datos.length > 0 && (
          <div style={{ display: "flex", gap: 14 }}>
            {datos.map((dato) => (
              <div
                key={dato}
                style={{
                  display: "flex",
                  fontSize: 26,
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.22)",
                }}
              >
                {dato}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, opacity: 0.85 }}>
        <div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: "#7fc79a" }} />
        {pie}
      </div>
    </div>
  );
}
