/**
 * Files the job seeker uploads (CV in PDF, proof of address, profile photo). Shared by
 * the browser (checks before uploading) and the Server Actions (path
 * checks). Buckets enforce the same limits in Storage (20261006120100_storage.sql,
 * 20261013150000_foto_perfil.sql).
 */

export type TipoArchivo = "cv" | "comprobante" | "foto"

export const TAMANIO_MAXIMO = 5 * 1024 * 1024 // bucket file_size_limit

export const ARCHIVOS: Record<TipoArchivo, { bucket: string; tipos: Record<string, string>; formatos: string }> = {
  cv: { bucket: "cvs", tipos: { "application/pdf": "pdf" }, formatos: "PDF" },
  comprobante: {
    bucket: "comprobantes-domicilio",
    tipos: { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" },
    formatos: "PDF, JPG o PNG",
  },
  // Always stored as JPEG: the browser crops and converts it first (recortarFoto)
  foto: { bucket: "fotos-perfil", tipos: { "image/jpeg": "jpg" }, formatos: "JPG o PNG" },
}

/** Storage path of a file: always inside the owner's folder ("<auth uid>/..."). */
export function rutaArchivo(tipo: TipoArchivo, userId: string, extension: string): string {
  return `${userId}/${tipo}.${extension}`
}

/** Whether `ruta` is a valid path for this user and file type (checked on the server). */
export function rutaValida(tipo: TipoArchivo, userId: string, ruta: string): boolean {
  return Object.values(ARCHIVOS[tipo].tipos).some((extension) => ruta === rutaArchivo(tipo, userId, extension))
}

/** Error message for a file before uploading it, or null when it can go. */
export function errorArchivo(tipo: TipoArchivo, archivo: File): string | null {
  if (archivo.size === 0) return "El archivo está vacío."
  if (!(archivo.type in ARCHIVOS[tipo].tipos)) return `El archivo tiene que ser ${ARCHIVOS[tipo].formatos}.`
  if (archivo.size > TAMANIO_MAXIMO) return "El archivo tiene que pesar menos de 5 MB."
  return null
}

const LADO_MAXIMO = 2000 // px: a utility bill stays readable

/**
 * Shrinks phone photos (often 3–8 MB) to a JPEG of at most 2000 px per
 * side before uploading. PDFs and small images are returned untouched.
 * Browser only.
 */
export async function achicarImagen(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/") || archivo.size < 1024 * 1024) return archivo

  const imagen = await createImageBitmap(archivo)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height))
  const lienzo = document.createElement("canvas")
  lienzo.width = Math.round(imagen.width * escala)
  lienzo.height = Math.round(imagen.height * escala)
  lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  imagen.close()

  const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", 0.85))
  if (!blob || blob.size >= archivo.size) return archivo
  return new File([blob], archivo.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" })
}

const LADO_FOTO = 512 // px: enough for an avatar, ~50–100 KB
const FOTO_MAXIMA = 20 * 1024 * 1024 // raw phone photo, before cropping

/** Error message for a profile photo before cropping it, or null when it can go. */
export function errorFoto(archivo: File): string | null {
  if (archivo.size === 0) return "La foto está vacía."
  if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return "La foto tiene que ser JPG o PNG."
  if (archivo.size > FOTO_MAXIMA) return "La foto es muy pesada. Probá con otra."
  return null
}

/**
 * Crops the centre square of a photo and shrinks it to a 512 px JPEG, so
 * every avatar looks the same and uploads fast on a slow connection.
 * Browser only.
 */
export async function recortarFoto(archivo: File): Promise<File> {
  const imagen = await createImageBitmap(archivo)
  const lado = Math.min(imagen.width, imagen.height)
  const lienzo = document.createElement("canvas")
  lienzo.width = lienzo.height = Math.min(LADO_FOTO, lado)
  lienzo
    .getContext("2d")
    ?.drawImage(imagen, (imagen.width - lado) / 2, (imagen.height - lado) / 2, lado, lado, 0, 0, lienzo.width, lienzo.height)
  imagen.close()

  const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", 0.85))
  if (!blob) throw new Error("recortarFoto: canvas export failed")
  return new File([blob], "foto.jpg", { type: "image/jpeg" })
}
