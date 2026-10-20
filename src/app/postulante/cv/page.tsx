import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleCheck, Info } from "lucide-react";
import { SeccionExperiencias, SeccionFormaciones } from "@/components/postulante/cv/SeccionesCv";
import { SobreMi } from "@/components/postulante/cv/SobreMi";
import { EncabezadoSeccion, VOLVER_A_MI_PERFIL } from "@/components/postulante/EncabezadoSeccion";
import { abrirArchivo, eliminarArchivo, registrarArchivo } from "@/app/postulante/archivos";
import { SubidaArchivo } from "@/components/formularios/SubidaArchivo";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { obtenerResumenPerfil, tieneCv } from "@/lib/perfil-postulante";
import { createClient } from "@/lib/supabase/server";
import { rutaDeOferta } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Tu CV" };

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
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <EncabezadoSeccion volver={VOLVER_A_MI_PERFIL}
        titulo="Tu CV"
        descripcion="Armalo acá completando las secciones, o subí el CV que ya tenés. Con cualquiera de los dos ya podés postularte."
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
              subí el CV que ya tenés
            </a>
          )}
          {!completo && "."}
        </p>
      </div>

      {oferta && !completo && (
        <p className="text-sm text-muted-foreground">Cuando tu CV esté completo, te aparece acá el botón para volver a la oferta.</p>
      )}
      {oferta && completo && (
        <Link href={oferta} className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover sm:w-auto" })}>
          Volver a la oferta y postularme
          <ArrowRight aria-hidden />
        </Link>
      )}

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
        titulo="¿Ya tenés tu CV hecho?"
        descripcion="Subilo en PDF o Word, o sacale una foto si lo tenés en papel. La Oficina de Empleo lo va a ver junto con tu perfil."
      >
        <SubidaArchivo
          tipo="cv"
          userId={userId}
          etiqueta="tu CV"
          cargado={Boolean(resumen.postulante.cv_url)}
          eliminable
          acciones={{ registrar: registrarArchivo, abrir: abrirArchivo, eliminar: eliminarArchivo }}
        />
      </TarjetaSeccion>
    </div>
  );
}
