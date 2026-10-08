import type { NextRequest } from "next/server";
import { obtenerOfertaPublica } from "@/lib/ofertas";
import { esUuid } from "@/lib/validaciones/ofertas";

const NO_ENCONTRADA = { error: "La oferta no existe o ya no está publicada." };

/**
 * GET /api/ofertas/[id]
 * Public (no session needed): one published offer. 404 when it does not
 * exist or is not published, so drafts and pending offers stay invisible (Rule 2).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/ofertas/[id]">) {
  const { id } = await ctx.params;
  if (!esUuid(id)) {
    return Response.json(NO_ENCONTRADA, { status: 404 });
  }

  try {
    const oferta = await obtenerOfertaPublica(id);
    if (!oferta) {
      return Response.json(NO_ENCONTRADA, { status: 404 });
    }
    return Response.json(oferta);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "No pudimos cargar la oferta. Probá de nuevo más tarde." }, { status: 500 });
  }
}
