import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { FotoPerfil } from "@/components/postulante/FotoPerfil";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { requerirRol } from "@/lib/auth";
import { encuadreDe } from "@/lib/encuadre";
import { urlFotoPerfil } from "@/lib/foto-perfil";
import { ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { obtenerResumenPerfil, tareasDelPerfil, type EstadoTarea } from "@/lib/perfil-postulante";

export const metadata: Metadata = { title: "Mi CV" };

// The proof of address in one word, for the band
const ESTADO_DOMICILIO: Record<EstadoTarea, string> = {
  completo: "Verificado",
  en_revision: "En revisión",
  rechazado: "Rechazado",
  opcional: "Sin subir",
  pendiente: "Sin subir",
};

/** "Mi CV": who you are for the Office, and every section of the profile in one place. */
export default async function PerfilPage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const { postulante } = resumen;
  const foto = await urlFotoPerfil(postulante.foto_url);
  const tareas = tareasDelPerfil(resumen);
  const necesarias = tareas.filter((t) => t.requerida);
  const hechas = necesarias.filter((t) => t.estado === "completo").length;
  const domicilio = tareas.find((t) => t.clave === "domicilio");

  return (
    <PaginaArea
      titulo="Mi CV"
      descripcion="Lo que ve la Oficina de Empleo cuando revisa tus postulaciones. Mantenelo al día."
      banda={{
        cifras: [
          { valor: `${hechas} de ${necesarias.length}`, texto: "Pasos necesarios", destacada: hechas < necesarias.length },
          { valor: resumen.rubros, texto: resumen.rubros === 1 ? "Rubro elegido" : "Rubros elegidos", href: "/postulante/rubros" },
          { valor: resumen.itemsCv, texto: "Experiencias y estudios", href: "/postulante/cv" },
          // Only Funes residents are asked for a proof (Rule 4)
          ...(domicilio ? [{ valor: ESTADO_DOMICILIO[domicilio.estado], texto: "Domicilio", href: "/postulante/domicilio" }] : []),
        ],
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <FotoPerfil
          userId={userId}
          nombre={postulante.nombre}
          apellido={postulante.apellido}
          localidad={ETIQUETAS_LOCALIDAD[postulante.localidad]}
          foto={foto}
          encuadre={encuadreDe(postulante)}
        />
        <ListaTareas tareas={tareas} />
      </div>
    </PaginaArea>
  );
}
