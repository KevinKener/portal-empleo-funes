import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CircleCheck, FileText, Lightbulb, Search, Send } from "lucide-react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { BandaBienvenida } from "@/components/layout/PanelBienvenida";
import { Avatar } from "@/components/postulante/Avatar";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { OfertasParaVos } from "@/components/postulante/panel/OfertasParaVos";
import { ProximoPaso } from "@/components/postulante/panel/ProximoPaso";
import { ResumenPostulaciones } from "@/components/postulante/panel/ResumenPostulaciones";
import { VistosPanel } from "@/components/postulante/panel/VistosPanel";
import { requerirRol } from "@/lib/auth";
import { encuadreDe } from "@/lib/encuadre";
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
  const enCurso = postulaciones.filter((p) => p.estado !== "rechazado").length;
  const conEmpresa = postulaciones.filter((p) => p.estado === "preseleccionado" || p.estado === "entrevista").length;

  return (
    <VistosPanel
      postulanteId={postulante.id}
      actual={{ perfilListo: listo, estados: Object.fromEntries(postulaciones.map((p) => [p.id, p.estado])) }}
    >
      <div className="space-y-6">
        <BandaBienvenida
          inicio={<Avatar nombre={postulante.nombre} apellido={postulante.apellido} foto={foto} encuadre={encuadreDe(postulante)} tamanio="lg" />}
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
          extra={<AccesosPanel enCurso={enCurso} conEmpresa={conEmpresa} />}
        />

        {/* min-w-0: grid items default to their content's width and pushed the page sideways on phones */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
          <div className="min-w-0 space-y-6">
            <ProximoPaso
              paso={proximoPaso(resumen, nuevas)}
              perfilListo={listo}
              postulaciones={postulaciones.map((p) => ({ id: p.id, estado: p.estado, titulo: p.oferta?.titulo ?? "la oferta" }))}
            />
            {!listo && <ListaTareas tareas={tareas} />}
            <ResumenPostulaciones postulaciones={postulaciones} empresas={empresas} />
            {resumen.rubros > 0 && <OfertasParaVos ofertas={ofertas} />}
          </div>

          <aside className="min-w-0 space-y-6">
            {listo && <PerfilCompleto domicilio={tareas.find((t) => t.clave === "domicilio")} />}
            <section
              aria-labelledby="titulo-consejo"
              className="relative isolate space-y-3 overflow-hidden rounded-2xl bg-primary-deep p-5 text-primary-foreground sm:p-6"
            >
              <FondoMarca compacto />
              <div className="flex items-center gap-3">
                {/* The bulb glows: the one moving thing in the side column */}
                <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary-foreground text-primary-deep">
                  <span aria-hidden className="absolute -inset-1 rounded-2xl bg-primary-foreground/40 blur-md motion-safe:animate-resplandor" />
                  <Lightbulb aria-hidden className="relative size-5" />
                </span>
                <h2 id="titulo-consejo" className="font-heading text-lg font-semibold">
                  Consejo del día
                </h2>
              </div>
              <p className="leading-relaxed text-primary-foreground/95">{consejoDelDia()}</p>
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

const VIDRIO = "flex items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-3.5 py-2 text-sm backdrop-blur-sm";

/** Figures and quick actions inside the greeting band, on frosted glass over the green. */
function AccesosPanel({ enCurso, conEmpresa }: { enCurso: number; conEmpresa: number }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <ul className="flex flex-wrap gap-2" aria-label="Tus postulaciones">
        <li className={VIDRIO}>
          <Send aria-hidden className="size-4" />
          <span>
            <strong className="font-heading text-base">{enCurso}</strong> {enCurso === 1 ? "postulación en curso" : "postulaciones en curso"}
          </span>
        </li>
        {conEmpresa > 0 && (
          <li className={VIDRIO}>
            <Building2 aria-hidden className="size-4" />
            <span>
              <strong className="font-heading text-base">{conEmpresa}</strong> con la empresa
            </span>
          </li>
        )}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/ofertas"
          className="group inline-flex h-10 items-center gap-2 rounded-xl bg-primary-foreground px-4 text-sm font-semibold text-primary-deep shadow-lg shadow-black/20 transition-[background-color,transform] hover:bg-secondary active:scale-[0.98]"
        >
          <Search aria-hidden className="size-4" />
          Buscar ofertas
        </Link>
        <Link
          href="/postulante/cv"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary-foreground/30 px-4 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
        >
          <FileText aria-hidden className="size-4" />
          Mi CV
        </Link>
      </div>
    </div>
  );
}
