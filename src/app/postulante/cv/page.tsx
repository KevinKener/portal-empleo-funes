import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, FileUp, GraduationCap, UserRound } from "lucide-react";
import { SeccionExperiencias, SeccionFormaciones } from "@/components/postulante/cv/SeccionesCv";
import { SobreMi } from "@/components/postulante/cv/SobreMi";
import { AyudaOficina } from "@/components/layout/AyudaOficina";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { Revelar } from "@/components/layout/Revelar";
import { ProgresoCv } from "@/components/postulante/cv/ProgresoCv";
import { IndiceCv } from "@/components/postulante/cv/IndiceCv";
import { VOLVER_A_MI_PERFIL } from "@/components/postulante/volver";
import { abrirArchivo, eliminarArchivo, registrarArchivo } from "@/app/postulante/archivos";
import { SubidaArchivo } from "@/components/formularios/SubidaArchivo";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { requerirRol } from "@/lib/auth";
import { obtenerResumenPerfil, tieneCv } from "@/lib/perfil-postulante";
import { createClient } from "@/lib/supabase/server";
import { rutaDeOferta } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Experiencia y formación" };

/**
 * CV built on the platform or uploaded as a file (PDF, Word or photo); either one is enough (Rule 6).
 * Coming from an offer (`?volver=<offer id>`), it offers the way back once the
 * CV is complete, so the person does not have to look for the offer again.
 */
export default async function CvPage({ searchParams }: PageProps<"/postulante/cv">) {
  const { userId } = await requerirRol("postulante");
  const oferta = rutaDeOferta((await searchParams).volver);
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();

  const supabase = await createClient();
  const id = resumen.postulante.id;
  const [{ data: experiencias, error: e1 }, { data: formaciones, error: e2 }] = await Promise.all([
    supabase
      .from("experiencias")
      .select("id, puesto, empresa, desde, hasta, tareas")
      .eq("postulante_id", id)
      .order("hasta", { ascending: false, nullsFirst: true })
      .order("desde", { ascending: false }),
    supabase.from("formaciones").select("id, nivel, titulo, institucion, estado").eq("postulante_id", id).order("created_at"),
  ]);
  if (e1 ?? e2) throw e1 ?? e2;

  const completo = tieneCv(resumen);
  const { descripcion, cv_url } = resumen.postulante;
  const secciones = [
    { id: "sobre-vos", titulo: "Sobre vos", hecho: Boolean(descripcion?.trim()) },
    { id: "experiencia", titulo: "Experiencia laboral", hecho: (experiencias ?? []).length > 0 },
    { id: "estudios", titulo: "Estudios y cursos", hecho: (formaciones ?? []).length > 0 },
  ];
  const hecho = (seccion: string) => secciones.find((s) => s.id === seccion)?.hecho ?? false;

  return (
    <PaginaArea
      volver={VOLVER_A_MI_PERFIL}
      titulo="Experiencia y formación"
      descripcion="Armalo acá completando las secciones, o subí el CV que ya tenés. Con cualquiera de los dos ya podés postularte."
      aside={
        <>
          <IndiceCv secciones={[...secciones, { id: "archivo", titulo: "CV adjunto", hecho: Boolean(cv_url) }]} />
          <AyudaOficina />
        </>
      }
    >
      <ProgresoCv secciones={secciones} completo={completo} oferta={oferta} />

      <Revelar>
        <TarjetaSeccion
          id="sobre-vos"
          titulo="Sobre vos"
          descripcion="Una presentación corta, en tus palabras."
          icono={<UserRound className="size-5" />}
          hecho={hecho("sobre-vos")}
        >
          <SobreMi inicial={descripcion ?? ""} />
        </TarjetaSeccion>
      </Revelar>
      <Revelar>
        <TarjetaSeccion
          id="experiencia"
          titulo="Experiencia laboral"
          descripcion="Empezá por la más reciente. También cuentan changas y trabajos sin registrar."
          icono={<BriefcaseBusiness className="size-5" />}
          hecho={hecho("experiencia")}
        >
          <SeccionExperiencias experiencias={experiencias ?? []} />
        </TarjetaSeccion>
      </Revelar>
      <Revelar>
        <TarjetaSeccion
          id="estudios"
          titulo="Estudios y cursos"
          descripcion="Escuela, carreras, cursos y capacitaciones, terminados o en curso."
          icono={<GraduationCap className="size-5" />}
          hecho={hecho("estudios")}
        >
          <SeccionFormaciones formaciones={formaciones ?? []} />
        </TarjetaSeccion>
      </Revelar>
      <Revelar>
        <TarjetaSeccion
          id="archivo"
          titulo="¿Ya tenés tu CV hecho?"
          descripcion="Subilo en PDF o Word, o sacale una foto si lo tenés en papel. La Oficina de Empleo lo va a ver junto con tu perfil."
          icono={<FileUp className="size-5" />}
          hecho={cv_url ? true : undefined}
        >
          <SubidaArchivo
            tipo="cv"
            userId={userId}
            etiqueta="tu CV"
            cargado={Boolean(cv_url)}
            eliminable
            acciones={{ registrar: registrarArchivo, abrir: abrirArchivo, eliminar: eliminarArchivo }}
          />
        </TarjetaSeccion>
      </Revelar>
    </PaginaArea>
  );
}
