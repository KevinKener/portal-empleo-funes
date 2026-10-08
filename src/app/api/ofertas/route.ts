import type { NextRequest } from "next/server";
import { listarOfertasPublicas } from "@/lib/ofertas";
import { validarFiltrosOfertas } from "@/lib/validaciones/ofertas";

/**
 * GET /api/ofertas?categoria=<uuid>&pagina=<n>
 * Public (no session needed): published offers only (Rule 2), paginated.
 * Returns { ofertas, total, pagina, porPagina }.
 */
export async function GET(request: NextRequest) {
  const filtros = validarFiltrosOfertas(request.nextUrl.searchParams);
  if (!filtros.ok) {
    return Response.json({ error: filtros.error }, { status: 400 });
  }

  try {
    return Response.json(await listarOfertasPublicas(filtros.datos));
  } catch (error) {
    console.error(error);
    return Response.json({ error: "No pudimos cargar las ofertas. Probá de nuevo más tarde." }, { status: 500 });
  }
}
