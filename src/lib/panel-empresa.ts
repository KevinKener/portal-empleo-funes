import type { ResumenCandidatos } from "@/lib/candidatos-empresa"
import type { EstadoOferta, EstadoVerificacion } from "@/lib/estados"
import type { OfertaEmpresa } from "@/lib/ofertas-empresa"
import type { ProximoPaso } from "@/lib/panel-postulante"

/**
 * Rules behind the company home: one suggested next step and a summary
 * (same pattern as the job seeker's panel, docs/research/mejoras.md #3).
 * Pure functions over data the page already read.
 */

export type ResumenEmpresa = Record<EstadoOferta, number> & {
  candidatos: number
  porRevisar: number
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
    porRevisar: sumar(candidatos, "porRevisar"),
    contratados: sumar(candidatos, "contratados"),
  }
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

/**
 * The single most useful thing to do now. People waiting on the company come
 * first (unconfirmed decisions, then candidates and interviews), then the
 * company's own offers. Null while the company is not verified: the notice
 * already says what happens.
 */
export function proximoPasoEmpresa(
  estado: EstadoVerificacion,
  ofertas: OfertaEmpresa[],
  candidatos: Candidatos,
): ProximoPaso | null {
  if (estado !== "verificado") return null
  const candidatosDe = (id: string) => `/empresa/ofertas/${id}/candidatos`

  const sinConfirmar = ofertaConMas(ofertas, candidatos, "sinConfirmar")
  if (sinConfirmar) {
    return {
      titulo: "Te falta confirmar tu selección",
      texto: `Marcaste ${cantidad(sinConfirmar.n, "decisión", "decisiones")} en «${sinConfirmar.oferta.titulo}». Los postulantes no se enteran hasta que confirmes.`,
      accion: "Revisar y confirmar",
      href: candidatosDe(sinConfirmar.oferta.id),
    }
  }

  const porRevisar = ofertaConMas(ofertas, candidatos, "porRevisar")
  if (porRevisar) {
    return {
      titulo: `Tenés ${cantidad(porRevisar.n, "candidato nuevo", "candidatos nuevos")}`,
      texto: `La Oficina de Empleo te preseleccionó perfiles para «${porRevisar.oferta.titulo}». Elegí a quién querés entrevistar.`,
      accion: "Ver candidatos",
      href: candidatosDe(porRevisar.oferta.id),
    }
  }

  const enEntrevista = ofertaConMas(ofertas, candidatos, "enEntrevista")
  if (enEntrevista) {
    return {
      titulo: "¿Cómo te fue en las entrevistas?",
      texto: `Tenés ${cantidad(enEntrevista.n, "persona", "personas")} en entrevista para «${enEntrevista.oferta.titulo}». Contanos a quién contratás.`,
      accion: "Ver entrevistas",
      href: candidatosDe(enEntrevista.oferta.id),
    }
  }

  // Ofertas come last touched first, so find() picks the most recent one.
  const rechazada = ofertas.find((o) => o.estado === "rechazada")
  if (rechazada) {
    return {
      titulo: "Una oferta necesita cambios",
      texto: `La Oficina de Empleo no aprobó «${rechazada.titulo}». Leé el motivo y usala como base para corregirla.`,
      accion: "Ver el motivo",
      href: `/empresa/ofertas/${rechazada.id}`,
    }
  }

  const borrador = ofertas.find((o) => o.estado === "borrador")
  if (borrador) {
    return {
      titulo: "Tenés un borrador sin enviar",
      texto: `«${borrador.titulo}» todavía no llegó a la Oficina de Empleo. Revisalo y envialo cuando esté listo.`,
      accion: "Terminar borrador",
      href: `/empresa/ofertas/${borrador.id}`,
    }
  }

  if (ofertas.length === 0) {
    return {
      titulo: "Cargá tu primera oferta",
      texto: "Contá qué puesto buscás. La Oficina de Empleo la revisa, la publica y te preselecciona candidatos.",
      accion: "Nueva oferta",
      href: "/empresa/ofertas/nueva",
    }
  }

  return null
}
