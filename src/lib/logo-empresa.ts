/**
 * Company logo (optional, 20261021120000_logo_empresa.sql): stored in the
 * public bucket logos-empresa as "<auth uid>/logo-<timestamp>.jpg". The
 * timestamp makes every new logo a new URL, so browsers and the CDN never
 * keep showing the old one. Shared by the browser (preparing the file) and
 * the server (path checks, public URL).
 */

export const BUCKET_LOGOS = "logos-empresa"

const LADO_LOGO = 512 // px: crisp at every size the portal shows it, ~30–80 KB
const LOGO_MAXIMO = 10 * 1024 * 1024 // raw file, before shrinking

/** A new path for the logo, inside the owner's folder. */
export function rutaLogo(userId: string): string {
  return `${userId}/logo-${Date.now()}.jpg`
}

/** Whether `ruta` is a logo path of this user (checked on the server). */
export function rutaLogoValida(userId: string, ruta: string): boolean {
  return new RegExp(`^${userId}/logo-\\d{13}\\.jpg$`).test(ruta)
}

/** Public URL of a stored logo, or null without one. */
export function urlLogo(ruta: string | null | undefined): string | null {
  if (!ruta) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_LOGOS}/${ruta}`
}

/** Error message for a logo before preparing it, or null when it can go. */
export function errorLogo(archivo: File): string | null {
  if (archivo.size === 0) return "La imagen está vacía."
  if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return "El logo tiene que ser JPG o PNG."
  if (archivo.size > LOGO_MAXIMO) return "La imagen es muy pesada. Probá con otra."
  return null
}

/**
 * Fits the whole logo inside a 512 px white square (never cropped: a logo
 * cut at the edges looks broken) and exports it as JPEG. Browser only.
 */
export async function prepararLogo(archivo: File): Promise<File> {
  const imagen = await createImageBitmap(archivo)
  const lienzo = document.createElement("canvas")
  lienzo.width = lienzo.height = LADO_LOGO
  const contexto = lienzo.getContext("2d")
  if (!contexto) throw new Error("prepararLogo: no canvas context")
  contexto.fillStyle = "#ffffff"
  contexto.fillRect(0, 0, LADO_LOGO, LADO_LOGO)
  // A small margin so the logo never touches the round or square frame
  const espacio = LADO_LOGO * 0.92
  const escala = Math.min(espacio / imagen.width, espacio / imagen.height)
  const ancho = imagen.width * escala
  const alto = imagen.height * escala
  contexto.drawImage(imagen, (LADO_LOGO - ancho) / 2, (LADO_LOGO - alto) / 2, ancho, alto)
  imagen.close()

  const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", 0.9))
  if (!blob) throw new Error("prepararLogo: canvas export failed")
  return new File([blob], "logo.jpg", { type: "image/jpeg" })
}
