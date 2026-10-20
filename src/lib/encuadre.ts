import type { CSSProperties } from "react"

/**
 * Framing of the profile photo inside its round frame (tutor review
 * 2026-10-20), stored in postulantes.foto_x / foto_y / foto_zoom
 * (20261020150000_encuadre_foto.sql). Shared by the browser editor, the
 * avatar and the Server Action that saves it.
 */
export type Encuadre = {
  /** Point of the photo at the frame's centre, 0–100 (%). */
  x: number
  y: number
  /** 1 = the whole photo covers the frame, up to 3. */
  zoom: number
}

export const ENCUADRE_INICIAL: Encuadre = { x: 50, y: 50, zoom: 1 }
export const ZOOM_MAXIMO = 3

const limitar = (valor: number, minimo: number, maximo: number) => Math.min(maximo, Math.max(minimo, valor))

/** The framing with every value inside the database ranges. */
export function ajustarEncuadre({ x, y, zoom }: Encuadre): Encuadre {
  return {
    x: Math.round(limitar(x, 0, 100)),
    y: Math.round(limitar(y, 0, 100)),
    zoom: Math.round(limitar(zoom, 1, ZOOM_MAXIMO) * 100) / 100,
  }
}

/** Framing from untrusted input (a Server Action argument), or null when it is not one. */
export function validarEncuadre(valor: unknown): Encuadre | null {
  if (typeof valor !== "object" || valor === null) return null
  const { x, y, zoom } = valor as Record<string, unknown>
  if (![x, y, zoom].every((n) => typeof n === "number" && Number.isFinite(n))) return null
  return ajustarEncuadre({ x: x as number, y: y as number, zoom: zoom as number })
}

/** Inline style that shows a cover image with this framing (object-position plus a scale around it). */
export function estiloEncuadre({ x, y, zoom }: Encuadre): CSSProperties {
  return {
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
    transform: zoom === 1 ? undefined : `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  }
}

/** The framing stored in a postulantes row. */
export function encuadreDe(fila: { foto_x: number; foto_y: number; foto_zoom: number }): Encuadre {
  return ajustarEncuadre({ x: fila.foto_x, y: fila.foto_y, zoom: Number(fila.foto_zoom) })
}
