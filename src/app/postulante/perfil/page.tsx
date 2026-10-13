import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/postulante/Avatar";
import { EncabezadoSeccion } from "@/components/postulante/EncabezadoSeccion";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { requerirRol } from "@/lib/auth";
import { ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { obtenerResumenPerfil, tareasDelPerfil } from "@/lib/perfil-postulante";

export const metadata: Metadata = { title: "Mi perfil" };

/** "Mi perfil": who you are for the Office, and every section of the profile in one place. */
export default async function PerfilPage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const { postulante } = resumen;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <EncabezadoSeccion
        titulo="Mi perfil"
        descripcion="Lo que ve la Oficina de Empleo cuando revisa tus postulaciones. Mantenelo al día."
      />
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <Avatar nombre={postulante.nombre} apellido={postulante.apellido} tamanio="lg" />
        <div className="min-w-0">
          <p className="truncate font-heading text-xl font-semibold">
            {postulante.nombre} {postulante.apellido}
          </p>
          <p className="text-muted-foreground">{ETIQUETAS_LOCALIDAD[postulante.localidad]}</p>
        </div>
      </div>
      <ListaTareas tareas={tareasDelPerfil(resumen)} />
    </div>
  );
}
