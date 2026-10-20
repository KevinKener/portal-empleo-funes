import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck, Lightbulb } from "lucide-react";
import { BandaBienvenida } from "@/components/layout/PanelBienvenida";
import { Avatar } from "@/components/postulante/Avatar";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { OfertasParaVos } from "@/components/postulante/panel/OfertasParaVos";
import { ProximoPaso } from "@/components/postulante/panel/ProximoPaso";
import { ResumenPostulaciones } from "@/components/postulante/panel/ResumenPostulaciones";
import { VistosPanel } from "@/components/postulante/panel/VistosPanel";
import { requerirRol } from "@/lib/auth";
import { urlFotoPerfil } from "@/lib/foto-perfil";
import { consejoDelDia, nombresDeEmpresas, obtenerOfertasParaVos, proximoPaso } from "@/lib/panel-postulante";
import { obtenerResumenPerfil, puedePostularse, tareasDelPerfil, type Tarea } from "@/lib/perfil-postulante";
import { listarMisPostulaciones } from "@/lib/postulaciones";

export const metadata: Metadata = { title: "Mi panel" };

/**
 * Job seeker home ("Mi panel"): the next step, applications, offers in their
 * categories and the profile (docs/research/panel-postulante.md).
 */
export default async function PostulantePage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const { postulante } = resumen;

  const postulaciones = await listarMisPostulaciones(postulante.id);
  const ofertaIds = postulaciones.flatMap((p) => (p.oferta ? [p.oferta.id] : []));
  const [{ ofertas, nuevas }, empresas, foto] = await Promise.all([
    obtenerOfertasParaVos(postulante.id, ofertaIds),
    nombresDeEmpresas(ofertaIds),
    urlFotoPerfil(postulante.foto_url),
  ]);

  const listo = puedePostularse(resumen);
  const tareas = tareasDelPerfil(resumen);
  const faltan = tareas.filter((t) => t.requerida && t.estado !== "completo").length;

  return (
    <VistosPanel
      postulanteId={postulante.id}
      actual={{ perfilListo: listo, estados: Object.fromEntries(postulaciones.map((p) => [p.id, p.estado])) }}
    >
      <div className="space-y-6">
        <BandaBienvenida
          inicio={<Avatar nombre={postulante.nombre} apellido={postulante.apellido} foto={foto} tamanio="lg" />}
          saludo={`¡Hola, ${postulante.nombre}!`}
          descripcion={
            <p className="flex items-center gap-1.5">
              {listo ? (
                <>
                  <CircleCheck aria-hidden className="size-4 shrink-0" />
                  Tu perfil está listo para postularte
                </>
              ) : faltan === 1 ? (
                "Te falta 1 paso para poder postularte"
              ) : (
                `Te faltan ${faltan} pasos para poder postularte`
              )}
            </p>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
          <div className="space-y-6">
            <ProximoPaso
              paso={proximoPaso(resumen, nuevas)}
              perfilListo={listo}
              postulaciones={postulaciones.map((p) => ({ id: p.id, estado: p.estado, titulo: p.oferta?.titulo ?? "la oferta" }))}
            />
            {!listo && <ListaTareas tareas={tareas} />}
            <ResumenPostulaciones postulaciones={postulaciones} empresas={empresas} />
            {resumen.rubros > 0 && <OfertasParaVos ofertas={ofertas} />}
          </div>

          <aside className="space-y-6">
            {listo && <PerfilCompleto domicilio={tareas.find((t) => t.clave === "domicilio")} />}
            <section aria-labelledby="titulo-consejo" className="space-y-2 rounded-2xl bg-secondary p-5 text-secondary-foreground sm:p-6">
              <h2 id="titulo-consejo" className="flex items-center gap-2 font-heading font-semibold">
                <Lightbulb aria-hidden className="size-5" />
                Consejo
              </h2>
              <p className="text-sm">{consejoDelDia()}</p>
            </section>
          </aside>
        </div>
      </div>
    </VistosPanel>
  );
}

const TEXTO_DOMICILIO: Partial<Record<Tarea["estado"], string>> = {
  opcional: "Si querés, sumá tu comprobante de domicilio. Es opcional.",
  en_revision: "Tu comprobante de domicilio está en revisión.",
  rechazado: "Tu comprobante no se pudo verificar. Podés subir otro.",
};

/** Once the profile is ready the checklist shrinks to this card (it stays complete in "Mi perfil"). */
function PerfilCompleto({ domicilio }: { domicilio?: Tarea }) {
  const aviso = domicilio && TEXTO_DOMICILIO[domicilio.estado];
  return (
    <section aria-labelledby="titulo-perfil-completo" className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 id="titulo-perfil-completo" className="flex items-center gap-2 font-heading font-semibold">
        <CircleCheck aria-hidden className="size-5 text-primary" />
        Tu perfil está completo
      </h2>
      <div aria-hidden className="h-2 rounded-full bg-primary" />
      <p className="text-sm text-muted-foreground">Mantenelo al día: la Oficina de Empleo lo mira en cada postulación.</p>
      {aviso && <p className="text-sm">{aviso}</p>}
      <Link href="/postulante/perfil" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
        Ver mi perfil
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </section>
  );
}
