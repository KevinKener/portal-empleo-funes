/**
 * Files the job seeker uploads (CV in PDF, proof of address). Shared by
 * the browser (checks before uploading) and the Server Actions (path
 * checks). Buckets enforce the same limits in Storage (20261006120100_storage.sql).
 */

export type TipoArchivo = "cv" | "comprobante"

export const TAMANIO_MAXIMO = 5 * 1024 * 1024 // bucket file_size_limit

export const ARCHIVOS: Record<TipoArchivo, { bucket: string; tipos: Record<string, string>; formatos: string }> = {
  cv: { bucket: "cvs", tipos: { "application/pdf": "pdf" }, formatos: "PDF" },
  comprobante: {
    bucket: "comprobantes-domicilio",
    tipos: { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" },
    formatos: "PDF, JPG o PNG",
  },
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
