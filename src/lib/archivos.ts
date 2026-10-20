/**
 * Files people upload: the job seeker's CV (PDF, Word or a photo), proof of address and
 * profile photo, and the company's ARCA certificate (Rule 12). Shared by
 * the browser (checks before uploading) and the Server Actions (path
 * checks). Buckets enforce the same limits in Storage (20261006120100_storage.sql,
 * 20261013150000_foto_perfil.sql).
 */

export type TipoArchivo = "cv" | "comprobante" | "foto" | "arca"

export const TAMANIO_MAXIMO = 5 * 1024 * 1024 // bucket file_size_limit

export const ARCHIVOS: Record<TipoArchivo, { bucket: string; tipos: Record<string, string>; formatos: string }> = {
  // Word and photos too (tutor review 2026-10-20): many people have their CV as a .doc or on paper
  cv: {
    bucket: "cvs",
    tipos: {
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "image/jpeg": "jpg",
      "image/png": "png",
    },
    formatos: "PDF, Word, JPG o PNG",
  },
  comprobante: {
    bucket: "comprobantes-domicilio",
    tipos: { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" },
    formatos: "PDF, JPG o PNG",
  },
  // Always stored as JPEG: the browser shrinks and converts it first (prepararFoto)
  foto: { bucket: "fotos-perfil", tipos: { "image/jpeg": "jpg" }, formatos: "JPG o PNG" },
  arca: { bucket: "constancias-arca", tipos: { "application/pdf": "pdf" }, formatos: "PDF" },
}

/** Server Actions behind an upload field, so the same field serves every area. */
export type AccionesArchivo = {
  registrar: (tipo: string, ruta: string) => Promise<{ error: string | null }>
  abrir: (tipo: string) => Promise<{ url: string | null; error: string | null }>
  eliminar: (tipo: string) => Promise<{ error: string | null }>
}

/** Storage path of a file: always inside the owner's folder ("<auth uid>/..."). */
export function rutaArchivo(tipo: TipoArchivo, userId: string, extension: string): string {
  return `${userId}/${tipo}.${extension}`
}

/** Whether `ruta` is a valid path for this user and file type (checked on the server). */
export function rutaValida(tipo: TipoArchivo, userId: string, ruta: string): boolean {
  return Object.values(ARCHIVOS[tipo].tipos).some((extension) => ruta === rutaArchivo(tipo, userId, extension))
}

/** Value for the file input's accept: MIME types plus extensions (some systems report no type for .doc). */
export function aceptados(tipo: TipoArchivo): string {
  const { tipos } = ARCHIVOS[tipo]
  return [...Object.keys(tipos), ...Object.values(tipos).map((extension) => `.${extension}`)].join(",")
}

/**
 * The file with its MIME type taken from the extension when the browser
 * left it empty (common for Word files), so the checks and the upload agree.
 */
export function conTipo(tipo: TipoArchivo, archivo: File): File {
  if (archivo.type) return archivo
  const extension = archivo.name.split(".").pop()?.toLowerCase()
  const mime = Object.entries(ARCHIVOS[tipo].tipos).find(([, ext]) => ext === extension)?.[0]
  return mime ? new File([archivo], archivo.name, { type: mime }) : archivo
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

const LADO_FOTO = 1024 // px on the longest side: room to move and zoom it inside the frame, ~100–200 KB
const FOTO_MAXIMA = 20 * 1024 * 1024 // raw phone photo, before shrinking

/** Error message for a profile photo before preparing it, or null when it can go. */
export function errorFoto(archivo: File): string | null {
  if (archivo.size === 0) return "La foto está vacía."
  if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return "La foto tiene que ser JPG o PNG."
  if (archivo.size > FOTO_MAXIMA) return "La foto es muy pesada. Probá con otra."
  return null
}

/**
 * Shrinks a photo to a JPEG of at most 1024 px on its longest side, without
 * cropping: the person frames it afterwards (src/lib/encuadre.ts), so the
 * whole picture is kept. Browser only.
 */
export async function prepararFoto(archivo: File): Promise<File> {
  const imagen = await createImageBitmap(archivo)
  const escala = Math.min(1, LADO_FOTO / Math.max(imagen.width, imagen.height))
  const lienzo = document.createElement("canvas")
  lienzo.width = Math.round(imagen.width * escala)
  lienzo.height = Math.round(imagen.height * escala)
  lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  imagen.close()

  const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", 0.85))
  if (!blob) throw new Error("prepararFoto: canvas export failed")
  return new File([blob], "foto.jpg", { type: "image/jpeg" })
}
