import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inbox } from "lucide-react";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { TarjetaPostulacion } from "@/components/postulante/TarjetaPostulacion";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { empresasDeOfertas } from "@/lib/panel-postulante";
import { obtenerResumenPerfil } from "@/lib/perfil-postulante";
import { listarMisPostulaciones } from "@/lib/postulaciones";

export const metadata: Metadata = { title: "Mis postulaciones" };

/** Every application of the signed-in job seeker, newest first, with its status. */
export default async function PostulacionesPage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const postulaciones = await listarMisPostulaciones(resumen.postulante.id);
  const empresas = await empresasDeOfertas(postulaciones.flatMap((p) => (p.oferta ? [p.oferta.id] : [])));

  return (
    <PaginaArea
      titulo="Mis postulaciones"
      descripcion="Seguí en qué etapa está cada postulación. La Oficina de Empleo revisa tu perfil antes de enviarlo a la empresa."
    >
      {postulaciones.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-12 text-center">
          <Inbox aria-hidden className="size-10 text-muted-foreground" />
          <p className="font-medium">Todavía no te postulaste a ninguna oferta.</p>
          <Link href="/ofertas" className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}>
            Ver ofertas
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {postulaciones.map((postulacion) => (
            <TarjetaPostulacion
              key={postulacion.id}
              postulacion={postulacion}
              empresa={postulacion.oferta ? empresas.get(postulacion.oferta.id) : undefined}
            />
          ))}
        </div>
      )}
    </PaginaArea>
  );
}
