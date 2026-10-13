import { NextResponse, type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";

// Private areas. The role check lives in each area's layout (requerirRol):
// the proxy only does the optimistic "is there a session" redirect, as the
// Next.js docs recommend.
const AREAS_PRIVADAS = ["/postulante", "/empresa", "/admin"];

/** Refreshes the session and sends visitors without one to the login page. */
export async function proxy(request: NextRequest) {
  const { response, conSesion } = await actualizarSesion(request);
  const { pathname, search } = request.nextUrl;

  const esPrivada = AREAS_PRIVADAS.some((area) => pathname === area || pathname.startsWith(`${area}/`));
  if (esPrivada && !conSesion) {
    const destino = new URL("/ingresar", request.url);
    destino.searchParams.set("siguiente", `${pathname}${search}`);
    const redireccion = NextResponse.redirect(destino);
    // Keep any cookie the refresh just wrote (e.g. clearing an expired session)
    response.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
    return redireccion;
  }

  return response;
}

export const config = {
  // Everything except static files, images and the favicon.
  matcher: ["/((?!_next/static|_next/image|icon.png|marca/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
