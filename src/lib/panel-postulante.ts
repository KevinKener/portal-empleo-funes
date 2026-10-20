import "server-only"
import { createClient } from "@/lib/supabase/server"
import { puedePostularse, tieneCv, type ResumenPerfil } from "@/lib/perfil-postulante"
import type { MiPostulacion } from "@/lib/postulaciones"
import type { Enums } from "@/types/database"

/**
 * Data and rules behind the job seeker's "Mi panel"
 * (decisions in docs/research/panel-postulante.md).
 */

/** An offer is "new" for this long after it was published. */
const DIAS_NUEVA = 7
const OFERTAS_EN_PANEL = 3

export type OfertaParaVos = {
  id: string
  titulo: string
  empresa: string | null
  categoria: string | null
  nueva: boolean
}

export type ProximoPaso = {
  titulo: string
  texto: string
  accion: string
  href: string
}

export type GrupoEstado = "en_revision" | "con_la_empresa" | "contratado" | "finalizada"

function haceDias(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Newest published offers in the job seeker's categories they have not
 * applied to yet, plus how many of those are new. Empty without categories.
 * Throws on database errors.
 */
export async function obtenerOfertasParaVos(
  postulanteId: string,
  yaPostuladas: string[],
): Promise<{ ofertas: OfertaParaVos[]; nuevas: number }> {
  const supabase = await createClient()
  const { data: rubros, error: errorRubros } = await supabase
    .from("postulante_categorias")
    .select("categoria_id")
    .eq("postulante_id", postulanteId)
  if (errorRubros) throw errorRubros
  if (rubros.length === 0) return { ofertas: [], nuevas: 0 }

  const categorias = rubros.map((r) => r.categoria_id)
  const desde = haceDias(DIAS_NUEVA)
  // PostgREST list syntax; ids are uuids read from our own rows
  const excluidas = `(${yaPostuladas.join(",")})`

  let lista = supabase
    .from("ofertas_publicas")
    .select("id, titulo, empresa_nombre, categoria_nombre, fecha_publicacion")
    .in("categoria_id", categorias)
    .order("fecha_publicacion", { ascending: false })
    .limit(OFERTAS_EN_PANEL)
  let nuevas = supabase
    .from("ofertas_publicas")
    .select("id", { count: "exact", head: true })
    .in("categoria_id", categorias)
    .gte("fecha_publicacion", desde)
  if (yaPostuladas.length > 0) {
    lista = lista.not("id", "in", excluidas)
    nuevas = nuevas.not("id", "in", excluidas)
  }

  const [resultadoLista, resultadoNuevas] = await Promise.all([lista, nuevas])
  if (resultadoLista.error) throw resultadoLista.error
  if (resultadoNuevas.error) throw resultadoNuevas.error

  return {
    // View columns are typed nullable even though the base columns are not
    ofertas: resultadoLista.data.flatMap((oferta) =>
      oferta.id && oferta.titulo
        ? [
            {
              id: oferta.id,
              titulo: oferta.titulo,
              empresa: oferta.empresa_nombre,
              categoria: oferta.categoria_nombre,
              nueva: oferta.fecha_publicacion !== null && new Date(oferta.fecha_publicacion) >= new Date(desde),
            },
          ]
        : [],
    ),
    nuevas: resultadoNuevas.count ?? 0,
  }
}

/**
 * Trade name of the company behind each published offer. Job seekers cannot
 * read `empresas` (RLS), so it comes from the public view; closed offers get none.
 */
export async function nombresDeEmpresas(ofertaIds: string[]): Promise<Map<string, string>> {
  if (ofertaIds.length === 0) return new Map()
  const supabase = await createClient()
  const { data, error } = await supabase.from("ofertas_publicas").select("id, empresa_nombre").in("id", ofertaIds)
  if (error) throw error
  return new Map(data.flatMap((o) => (o.id && o.empresa_nombre ? [[o.id, o.empresa_nombre] as const] : [])))
}

/** The single action the panel suggests now; the first matching rule wins. */
export function proximoPaso(resumen: ResumenPerfil, ofertasNuevas: number): ProximoPaso {
  if (!tieneCv(resumen)) {
    return {
      titulo: "Armá tu CV",
      texto: "Completalo acá en pocos pasos o subí el que ya tenés.",
      accion: "Armar mi CV",
      href: "/postulante/cv",
    }
  }
  if (resumen.rubros === 0) {
    return {
      titulo: "Elegí los rubros que te interesan",
      texto: "Así te mostramos las ofertas que van con vos.",
      accion: "Elegir rubros",
      href: "/postulante/rubros",
    }
  }
  if (resumen.postulante.localidad === "funes" && resumen.postulante.estado_domicilio === "rechazado" && resumen.postulante.comprobante_url) {
    return {
      titulo: "Tu comprobante no se pudo verificar",
      texto: "Subí otro cuando puedas. No te impide postularte.",
      accion: "Subir comprobante",
      href: "/postulante/domicilio",
    }
  }
  if (ofertasNuevas > 0) {
    return {
      titulo: ofertasNuevas === 1 ? "Hay 1 oferta nueva en tus rubros" : `Hay ${ofertasNuevas} ofertas nuevas en tus rubros`,
      texto: ofertasNuevas === 1 ? "Mirala y postulate en un toque." : "Miralas y postulate en un toque.",
      accion: ofertasNuevas === 1 ? "Ver la oferta" : "Ver ofertas para vos",
      href: "#ofertas-para-vos",
    }
  }
  return {
    titulo: puedePostularse(resumen) ? "Todo al día" : "Seguí completando tu perfil",
    texto: "Acá vas a ver las novedades de tus postulaciones y las ofertas nuevas de tus rubros.",
    accion: "Ver todas las ofertas",
    href: "/ofertas",
  }
}

const GRUPO_POR_ESTADO: Record<Enums<"estado_postulacion">, GrupoEstado> = {
  pendiente: "en_revision",
  preseleccionado: "con_la_empresa",
  entrevista: "con_la_empresa",
  contratado: "contratado",
  rechazado: "finalizada",
}

/** How many applications sit in each plain-words group, in display order. */
export function contarPorGrupo(postulaciones: MiPostulacion[]): { grupo: GrupoEstado; cantidad: number }[] {
  const orden: GrupoEstado[] = ["en_revision", "con_la_empresa", "contratado", "finalizada"]
  return orden
    .map((grupo) => ({ grupo, cantidad: postulaciones.filter((p) => GRUPO_POR_ESTADO[p.estado] === grupo).length }))
    .filter(({ cantidad }) => cantidad > 0)
}

/** Active applications first (they can still move), then the rest; newest first inside each. */
export function destacarActivas(postulaciones: MiPostulacion[], cantidad: number): MiPostulacion[] {
  const activa = (p: MiPostulacion) => p.estado !== "rechazado" && p.oferta?.estado !== "cerrada"
  return [...postulaciones.filter(activa), ...postulaciones.filter((p) => !activa(p))].slice(0, cantidad)
}

const CONSEJOS = [
  "Contá tareas concretas en tu experiencia: «atención al público», «manejo de caja», «carga y descarga».",
  "Revisá que tu teléfono esté al día: es la forma más rápida de que la Oficina te contacte.",
  "Elegir varios rubros te muestra más ofertas. Sumá los que de verdad te interesan.",
  "Los cursos y changas también cuentan como experiencia. Agregalos a tu CV.",
  "Si subiste tu CV, fijate que se lea bien desde el celular.",
]

/** A tip that changes once a day (same for everyone, so it renders the same on every visit that day). */
export function consejoDelDia(): string {
  const dia = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
  return CONSEJOS[dia % CONSEJOS.length]
}
