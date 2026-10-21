import type { ResumenCandidatos } from "@/lib/candidatos-empresa"
import type { EstadoOferta } from "@/lib/estados"
import type { EmpresaActual, OfertaEmpresa } from "@/lib/ofertas-empresa"
import type { ProximoPaso } from "@/lib/panel-postulante"

/**
 * Rules behind the company home and "Mis ofertas": pending steps, a
 * summary and the status filters (same pattern as the job seeker's panel,
 * docs/research/mejoras.md #3).
 * Pure functions over data the page already read.
 */

export type ResumenEmpresa = Record<EstadoOferta, number> & {
  candidatos: number
  /** New candidates plus drafted decisions: what waits for the company. */
  paraDecidir: number
  enEntrevista: number
  contratados: number
}

type Candidatos = Map<string, ResumenCandidatos>

const sumar = (candidatos: Candidatos, campo: keyof ResumenCandidatos) =>
  [...candidatos.values()].reduce((total, resumen) => total + resumen[campo], 0)

/** Offers per status and candidates across every offer. */
export function resumirEmpresa(ofertas: OfertaEmpresa[], candidatos: Candidatos): ResumenEmpresa {
  const porEstado: Record<EstadoOferta, number> = { borrador: 0, pendiente: 0, publicada: 0, rechazada: 0, cerrada: 0 }
  for (const oferta of ofertas) porEstado[oferta.estado] += 1
  return {
    ...porEstado,
    candidatos: sumar(candidatos, "total"),
    paraDecidir: sumar(candidatos, "porRevisar") + sumar(candidatos, "sinConfirmar"),
    enEntrevista: sumar(candidatos, "enEntrevista"),
    contratados: sumar(candidatos, "contratados"),
  }
}

/** Status filters of "Mis ofertas" (`?estado=`); "todas" is the default. */
export const FILTROS_OFERTAS = ["todas", "publicada", "pendiente", "borrador", "rechazada", "cerrada"] as const
export type FiltroOfertas = (typeof FILTROS_OFERTAS)[number]

/** `?estado=` as a known filter, or "todas" for anything else. */
export function filtroOfertas(valor: string | string[] | undefined): FiltroOfertas {
  return (FILTROS_OFERTAS as readonly string[]).includes(String(valor)) ? (valor as FiltroOfertas) : "todas"
}

/** Whether an offer waits for the company: candidates to decide on, a rejection to fix or a draft to send. */
export function necesitaAtencion(oferta: OfertaEmpresa, candidatos: Candidatos): boolean {
  const resumen = candidatos.get(oferta.id)
  if (resumen && resumen.porRevisar + resumen.enEntrevista + resumen.sinConfirmar > 0) return true
  return oferta.estado === "rechazada" || oferta.estado === "borrador"
}

/**
 * The offers of one filter, those waiting for the company first; otherwise
 * the input order (last touched first) is kept.
 */
export function ofertasDelFiltro(ofertas: OfertaEmpresa[], candidatos: Candidatos, filtro: FiltroOfertas): OfertaEmpresa[] {
  const elegidas = filtro === "todas" ? ofertas : ofertas.filter((o) => o.estado === filtro)
  return [...elegidas].sort((a, b) => Number(necesitaAtencion(b, candidatos)) - Number(necesitaAtencion(a, candidatos)))
}

function cantidad(n: number, singular: string, plural: string) {
  return n === 1 ? `1 ${singular}` : `${n} ${plural}`
}

/** The offer with the most of `campo`, or undefined when none has any. */
function ofertaConMas(ofertas: OfertaEmpresa[], candidatos: Candidatos, campo: keyof ResumenCandidatos) {
  let elegida: { oferta: OfertaEmpresa; n: number } | undefined
  for (const oferta of ofertas) {
    const n = candidatos.get(oferta.id)?.[campo] ?? 0
    if (n > 0 && (!elegida || n > elegida.n)) elegida = { oferta, n }
  }
  return elegida
}

/** What a step is about: picks its icon on the home. */
export type TipoPaso = "arca" | "confirmar" | "candidatos" | "entrevistas" | "rechazada" | "borrador" | "primera"

export type PasoEmpresa = ProximoPaso & {
  tipo: TipoPaso
  /** The number the step is about (candidates, interviews…), shown big next to it. */
  numero?: number
}

/**
 * Every pending thing for the company, most useful first. People waiting on
 * the company come first (unconfirmed decisions, then new candidates and
 * interviews), then its own offers. While pending, the only useful step is
 * the optional ARCA certificate (Rule 12), which helps the Office verify
 * faster. The home shows the first one big and the rest as "También tenés".
 */
export function pasosEmpresa(empresa: EmpresaActual, ofertas: OfertaEmpresa[], candidatos: Candidatos): PasoEmpresa[] {
  if (empresa.estado === "pendiente" && !empresa.constancia_arca_url) {
    return [
      {
        tipo: "arca",
        titulo: "Ayudanos a verificar tu empresa",
        texto: "Subí tu constancia de inscripción en ARCA. No es obligatoria, pero la Oficina de Empleo te puede habilitar más rápido.",
        accion: "Subir constancia",
        href: "/empresa/datos",
      },
    ]
  }
  if (empresa.estado !== "verificado") return []
  const candidatosDe = (id: string) => `/empresa/ofertas/${id}/candidatos`
  const pasos: PasoEmpresa[] = []

  const sinConfirmar = ofertaConMas(ofertas, candidatos, "sinConfirmar")
  if (sinConfirmar) {
    pasos.push({
      tipo: "confirmar",
      numero: sinConfirmar.n,
      titulo: "Te falta confirmar tu selección",
      texto: `Marcaste ${cantidad(sinConfirmar.n, "decisión", "decisiones")} en «${sinConfirmar.oferta.titulo}». Los postulantes no se enteran hasta que confirmes.`,
      accion: "Revisar y confirmar",
      href: candidatosDe(sinConfirmar.oferta.id),
    })
  }

  const porRevisar = ofertaConMas(ofertas, candidatos, "porRevisar")
  if (porRevisar) {
    pasos.push({
      tipo: "candidatos",
      numero: porRevisar.n,
      titulo: `Tenés ${cantidad(porRevisar.n, "candidato nuevo", "candidatos nuevos")}`,
      texto: `La Oficina de Empleo te preseleccionó perfiles para «${porRevisar.oferta.titulo}». Elegí a quién querés entrevistar.`,
      accion: "Ver candidatos",
      href: candidatosDe(porRevisar.oferta.id),
    })
  }

  const enEntrevista = ofertaConMas(ofertas, candidatos, "enEntrevista")
  if (enEntrevista) {
    pasos.push({
      tipo: "entrevistas",
      numero: enEntrevista.n,
      titulo: `Tenés ${cantidad(enEntrevista.n, "entrevista en curso", "entrevistas en curso")}`,
      texto: `Para «${enEntrevista.oferta.titulo}». Cuando decidas, marcá a quién contratás: la Oficina de Empleo le avisa a cada postulante.`,
      accion: "Registrar el resultado",
      href: candidatosDe(enEntrevista.oferta.id),
    })
  }

  // Ofertas come last touched first, so find() picks the most recent one.
  const rechazada = ofertas.find((o) => o.estado === "rechazada")
  if (rechazada) {
    pasos.push({
      tipo: "rechazada",
      titulo: "Una oferta necesita cambios",
      texto: `La Oficina de Empleo no aprobó «${rechazada.titulo}». Leé el motivo y usala como base para corregirla.`,
      accion: "Ver el motivo",
      href: `/empresa/ofertas/${rechazada.id}`,
    })
  }

  const borrador = ofertas.find((o) => o.estado === "borrador")
  if (borrador) {
    pasos.push({
      tipo: "borrador",
      titulo: "Tenés un borrador sin enviar",
      texto: `«${borrador.titulo}» todavía no llegó a la Oficina de Empleo. Revisalo y envialo cuando esté listo.`,
      accion: "Terminar borrador",
      href: `/empresa/ofertas/${borrador.id}`,
    })
  }

  if (ofertas.length === 0) {
    pasos.push({
      tipo: "primera",
      titulo: "Cargá tu primera oferta",
      texto: "Contá qué puesto buscás. La Oficina de Empleo la revisa, la publica y te preselecciona candidatos.",
      accion: "Nueva oferta",
      href: "/empresa/ofertas/nueva",
    })
  }

  return pasos
}

/** One item of the company's profile checklist on "Mi empresa". */
export type TareaPerfilEmpresa = { clave: string; texto: string; hecha: boolean; href: string; opcional?: boolean }

/**
 * What a company can still add, for the ring on "Mi empresa": the logo shows
 * on its offers, the ARCA certificate (optional, Rule 12) speeds up the
 * verification, and a first offer is what the portal is for. Phone and
 * address are required at sign-up, so they are never pending.
 */
export function tareasPerfilEmpresa(empresa: { logo_url: string | null; constancia_arca_url: string | null }, cantidadOfertas: number): TareaPerfilEmpresa[] {
  return [
    { clave: "logo", texto: "Subí el logo de tu empresa", hecha: Boolean(empresa.logo_url), href: "#logo" },
    { clave: "arca", texto: "Subí la constancia de ARCA", hecha: Boolean(empresa.constancia_arca_url), href: "#arca", opcional: true },
    { clave: "oferta", texto: "Cargá tu primera oferta", hecha: cantidadOfertas > 0, href: "/empresa/ofertas/nueva" },
  ]
}
