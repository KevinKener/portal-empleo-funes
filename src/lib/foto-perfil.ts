import "server-only"
import { ARCHIVOS } from "@/lib/archivos"
import { createClient } from "@/lib/supabase/server"

// Long enough to stay on screen while the page is open; the bucket is private.
const DURACION_URL = 60 * 60

/**
 * Signed URL to show a job seeker's profile photo, or null without one (the
 * avatar then shows initials). Storage policies let only the owner and the
 * Admin sign it; companies never can (20261013150000_foto_perfil.sql).
 */
export async function urlFotoPerfil(ruta: string | null): Promise<string | null> {
  if (!ruta) return null
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(ARCHIVOS.foto.bucket).createSignedUrl(ruta, DURACION_URL)
  if (error) {
    // A missing photo must not break the page: fall back to the initials
    console.error("urlFotoPerfil failed:", error.message)
    return null
  }
  return data.signedUrl
}

/**
 * Signed URLs for many profile photos in one request (the Office's lists),
 * by path. Missing or failed ones are left out, so those avatars show
 * initials. Admin only: Storage policies refuse anyone else's photos.
 */
export async function urlsFotosPerfil(rutas: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>()
  if (rutas.length === 0) return urls
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(ARCHIVOS.foto.bucket).createSignedUrls(rutas, DURACION_URL)
  if (error) {
    console.error("urlsFotosPerfil failed:", error.message)
    return urls
  }
  for (const { path, signedUrl } of data) if (path && signedUrl) urls.set(path, signedUrl)
  return urls
}
