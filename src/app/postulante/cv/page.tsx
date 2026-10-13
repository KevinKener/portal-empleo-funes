import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck, Info } from "lucide-react";
import { SeccionExperiencias, SeccionFormaciones } from "@/components/postulante/cv/SeccionesCv";
import { SobreMi } from "@/components/postulante/cv/SobreMi";
import { EncabezadoSeccion } from "@/components/postulante/EncabezadoSeccion";
import { SubidaArchivo } from "@/components/postulante/SubidaArchivo";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { requerirRol } from "@/lib/auth";
import { obtenerResumenPerfil, tieneCv } from "@/lib/perfil-postulante";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tu CV" };

/** CV built on the platform or uploaded as a PDF; either one is enough (Rule 6). */
export default async function CvPage() {
  const { userId } = await requerirRol("postulante");
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
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <EncabezadoSeccion
        titulo="Tu CV"
        descripcion="Armalo acá completando las secciones, o subí tu CV en PDF. Con cualquiera de los dos ya podés postularte."
      />

      <div
        className={
          completo
            ? "flex gap-3 rounded-xl bg-secondary p-4 text-secondary-foreground"
            : "flex gap-3 rounded-xl border border-border bg-muted p-4"
        }
      >
        {completo ? <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" /> : <Info aria-hidden className="mt-0.5 size-5 shrink-0" />}
        <p className="text-sm">
          {completo
            ? "Tu CV está listo. Podés seguir sumando información cuando quieras."
            : "Para completar tu CV: escribí unas líneas sobre vos y cargá al menos una experiencia o un estudio, o "}
          {!completo && (
            <a href="#pdf" className="font-medium text-primary underline underline-offset-4">
              subí tu CV en PDF
            </a>
          )}
          {!completo && "."}
        </p>
      </div>

      <TarjetaSeccion id="sobre-vos" titulo="Sobre vos">
        <SobreMi inicial={resumen.postulante.descripcion ?? ""} />
      </TarjetaSeccion>
      <TarjetaSeccion id="experiencia" titulo="Experiencia laboral">
        <SeccionExperiencias experiencias={experiencias ?? []} />
      </TarjetaSeccion>
      <TarjetaSeccion id="estudios" titulo="Estudios y cursos">
        <SeccionFormaciones formaciones={formaciones ?? []} />
      </TarjetaSeccion>
      <TarjetaSeccion
        id="pdf"
        titulo="¿Ya tenés tu CV en PDF?"
        descripcion="Subilo y la Oficina de Empleo lo va a ver junto con tu perfil."
      >
        <SubidaArchivo tipo="cv" userId={userId} etiqueta="CV en PDF" cargado={Boolean(resumen.postulante.cv_url)} eliminable />
      </TarjetaSeccion>
    </div>
  );
}
