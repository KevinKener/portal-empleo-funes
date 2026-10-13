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
