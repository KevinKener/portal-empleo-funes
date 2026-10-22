import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FichaPostulante, PostulacionesPostulante } from "@/components/admin/FichaPostulante";
import { NotaLateral } from "@/components/layout/PaginaArea";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { obtenerPerfilPostulante } from "@/lib/admin/postulantes";
import { requerirRol } from "@/lib/auth";
import { ahora, formatearFecha } from "@/lib/formato";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same person.
const cargar = cache(async (id: string) => {
  await requerirRol("admin");
  return esUuid(id) ? obtenerPerfilPostulante(id) : null;
});

export async function generateMetadata({ params }: PageProps<"/admin/postulantes/[id]">): Promise<Metadata> {
  const postulante = await cargar((await params).id);
  return { title: postulante ? `${postulante.nombre} ${postulante.apellido}` : "Postulante no encontrado" };
}

/**
 * A job seeker's profile for the Office (branch D2): the shared
 * FichaPostulante and every application, each opening the page where the
 * Office decides (D1). Companies never see this (Rule 1).
 */
export default async function PostulanteAdminPage({ params }: PageProps<"/admin/postulantes/[id]">) {
  const { id } = await params;
  const postulante = await cargar(id);
  if (!postulante) notFound();

  const momento = ahora();
  const pendientes = postulante.postulaciones.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      <EnlaceVolver href="/admin/postulantes" texto="Postulantes" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          <FichaPostulante postulante={postulante} detalle={`Se registró el ${formatearFecha(postulante.creado)}`} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <PostulacionesPostulante titulo="Postulaciones" postulaciones={postulante.postulaciones} vacio="Todavía no se postuló a ninguna oferta." momento={momento} />
          {pendientes > 0 && (
            <NotaLateral titulo={pendientes === 1 ? "1 postulación por revisar" : `${pendientes} postulaciones por revisar`}>
              <p>Tocá la oferta para preseleccionar o rechazar: la decisión se toma en cada postulación.</p>
            </NotaLateral>
          )}
        </aside>
      </div>
    </div>
  );
}
