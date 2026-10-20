import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { FotoPerfil } from "@/components/postulante/FotoPerfil";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { requerirRol } from "@/lib/auth";
import { encuadreDe } from "@/lib/encuadre";
import { urlFotoPerfil } from "@/lib/foto-perfil";
import { ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { obtenerResumenPerfil, tareasDelPerfil } from "@/lib/perfil-postulante";

export const metadata: Metadata = { title: "Mi perfil" };

/** "Mi perfil": who you are for the Office, and every section of the profile in one place. */
export default async function PerfilPage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const { postulante } = resumen;
  const foto = await urlFotoPerfil(postulante.foto_url);

  return (
    <PaginaArea titulo="Mi perfil" descripcion="Lo que ve la Oficina de Empleo cuando revisa tus postulaciones. Mantenelo al día.">
      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <FotoPerfil
          userId={userId}
          nombre={postulante.nombre}
          apellido={postulante.apellido}
          localidad={ETIQUETAS_LOCALIDAD[postulante.localidad]}
          foto={foto}
          encuadre={encuadreDe(postulante)}
        />
        <ListaTareas tareas={tareasDelPerfil(resumen)} />
      </div>
    </PaginaArea>
  );
}
