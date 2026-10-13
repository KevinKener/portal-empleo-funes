import "server-only"
import { cookies } from "next/headers"

/**
 * Remembers which email is waiting for a code (sign-up confirmation or
 * password recovery) between the request and the code step, so the address
 * never travels in the URL. httpOnly: only the server reads it, and each
 * flow scopes its cookie to its own path.
 */

const FLUJOS = {
  registro: { nombre: "registro_email", path: "/registro" },
  recuperar: { nombre: "recuperar_email", path: "/recuperar" },
} as const

export type Flujo = keyof typeof FLUJOS

export async function guardarEmailPendiente(flujo: Flujo, email: string): Promise<void> {
  const { nombre, path } = FLUJOS[flujo]
  const cookieStore = await cookies()
  cookieStore.set(nombre, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge: 60 * 60, // same as the code expiry in Supabase
  })
}

/** Email waiting for a code in this browser, or null. */
export async function leerEmailPendiente(flujo: Flujo): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(FLUJOS[flujo].nombre)?.value ?? null
}

/** Forgets the pending email once the code was accepted. */
export async function borrarEmailPendiente(flujo: Flujo): Promise<void> {
  const { nombre, path } = FLUJOS[flujo]
  const cookieStore = await cookies()
  cookieStore.delete({ name: nombre, path })
}
