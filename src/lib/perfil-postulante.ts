import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

/**
 * The job seeker's profile at a glance: what is done, what is missing and
 * whether they can apply (decisions in docs/research/postulante-ux.md §3).
 */

export type ResumenPerfil = {
  postulante: Pick<
    Tables<"postulantes">,
    "id" | "nombre" | "apellido" | "localidad" | "descripcion" | "cv_url" | "comprobante_url" | "estado_domicilio"
  >
  rubros: number
  itemsCv: number
}

export type EstadoTarea = "completo" | "pendiente" | "opcional" | "en_revision" | "rechazado"

export type Tarea = {
  clave: "datos" | "rubros" | "cv" | "domicilio"
  titulo: string
  descripcion: string
  href: string
  estado: EstadoTarea
  /** Counts towards "ready to apply" (the proof of address never does, Rule 4). */
  requerida: boolean
}

/** Profile summary of the signed-in job seeker, or null without a profile row. Throws on errors. */
export async function obtenerResumenPerfil(userId: string): Promise<ResumenPerfil | null> {
  const supabase = await createClient()
  const { data: postulante, error } = await supabase
    .from("postulantes")
    .select("id, nombre, apellido, localidad, descripcion, cv_url, comprobante_url, estado_domicilio")
    .eq("perfil_id", userId)
    .maybeSingle()
  if (error) throw error
  if (!postulante) return null

  const contar = (tabla: "postulante_categorias" | "experiencias" | "formaciones") =>
    supabase.from(tabla).select("id", { count: "exact", head: true }).eq("postulante_id", postulante.id)
  const [rubros, experiencias, formaciones] = await Promise.all([
    contar("postulante_categorias"),
    contar("experiencias"),
    contar("formaciones"),
  ])
  const fallo = rubros.error ?? experiencias.error ?? formaciones.error
  if (fallo) throw fallo

  return {
    postulante,
    rubros: rubros.count ?? 0,
    itemsCv: (experiencias.count ?? 0) + (formaciones.count ?? 0),
  }
}

/** A CV counts when there is a PDF, or "Sobre mí" plus at least one experience or education item (Rule 6). */
export function tieneCv({ postulante, itemsCv }: ResumenPerfil): boolean {
  return Boolean(postulante.cv_url) || (Boolean(postulante.descripcion?.trim()) && itemsCv > 0)
}

/** Minimum to apply: at least one category and a CV in either format. */
export function puedePostularse(resumen: ResumenPerfil): boolean {
  return resumen.rubros > 0 && tieneCv(resumen)
}

/**
 * Tasks of "Completá tu perfil", in any order (GOV.UK "Complete multiple
 * tasks"). The proof of address only shows up for Funes residents.
 */
export function tareasDelPerfil(resumen: ResumenPerfil): Tarea[] {
  const { postulante, rubros } = resumen
  const tareas: Tarea[] = [
    {
      clave: "datos",
      titulo: "Revisar tus datos",
      descripcion: "Nombre, dónde vivís y cómo te contactamos.",
      href: "/postulante/datos",
      estado: "completo",
      requerida: true,
    },
    {
      clave: "rubros",
      titulo: "Elegir rubros",
      descripcion: "Los tipos de trabajo que te interesan. Podés elegir varios.",
      href: "/postulante/rubros",
      estado: rubros > 0 ? "completo" : "pendiente",
      requerida: true,
    },
    {
      clave: "cv",
      titulo: "Armar tu CV",
      descripcion: "Completalo acá o subí tu CV en PDF.",
      href: "/postulante/cv",
      estado: tieneCv(resumen) ? "completo" : "pendiente",
      requerida: true,
    },
  ]

  if (postulante.localidad === "funes") {
    tareas.push({
      clave: "domicilio",
      titulo: "Subir comprobante de domicilio",
      descripcion: "Opcional. La Oficina de Empleo lo tiene en cuenta al revisar tu perfil.",
      href: "/postulante/domicilio",
      estado: estadoDomicilio(postulante),
      requerida: false,
    })
  }

  return tareas
}

function estadoDomicilio(postulante: ResumenPerfil["postulante"]): EstadoTarea {
  if (!postulante.comprobante_url) return "opcional"
  if (postulante.estado_domicilio === "verificado") return "completo"
  if (postulante.estado_domicilio === "rechazado") return "rechazado"
  return "en_revision"
}
