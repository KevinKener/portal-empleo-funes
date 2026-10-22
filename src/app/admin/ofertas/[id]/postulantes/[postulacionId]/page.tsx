import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { AccionesPostulacion } from "@/components/admin/AccionesPostulacion";
import { EtiquetaPostulacionAdmin } from "@/components/admin/EtiquetaPostulacionAdmin";
import { FichaPostulante, PostulacionesPostulante } from "@/components/admin/FichaPostulante";
import { LineaTiempo, type HitoLinea } from "@/components/admin/LineaTiempo";
import { NotasAdmin } from "@/components/admin/NotasAdmin";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { obtenerFichaPostulacion, siguientePorPreseleccionar, type FichaPostulacion } from "@/lib/admin/postulaciones";
import { requerirRol } from "@/lib/auth";
import { ahora, haceCuanto } from "@/lib/formato";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same application.
const cargar = cache(async (id: string, postulacionId: string) => {
  await requerirRol("admin");
  return esUuid(id) && esUuid(postulacionId) ? obtenerFichaPostulacion(id, postulacionId) : null;
});

export async function generateMetadata({ params }: PageProps<"/admin/ofertas/[id]/postulantes/[postulacionId]">): Promise<Metadata> {
  const { id, postulacionId } = await params;
  const ficha = await cargar(id, postulacionId);
  return { title: ficha ? `${ficha.postulante.nombre} ${ficha.postulante.apellido}` : "Postulación no encontrada" };
}

const TEXTO_ESTADO: Record<FichaPostulacion["estado"], string> = {
  pendiente: "Espera tu revisión. La empresa todavía no la ve.",
  preseleccionado: "La empresa ya la ve y decide si la llama a entrevista.",
  entrevista: "La empresa la llamó a entrevista.",
  contratado: "La empresa la contrató.",
  rechazado: "La persona ve el motivo en su panel.",
};

/**
 * The application's life so far. Only creation and pre-selection have their
 * own dates; later steps are listed without one rather than guessed from
 * updated_at, which also moves when the notes change.
 */
function hitos(ficha: FichaPostulacion): HitoLinea[] {
  const lista: HitoLinea[] = [{ texto: "Se postuló", fecha: ficha.creada }];
  if (ficha.fechaPreseleccion) lista.push({ texto: "La Oficina la preseleccionó", fecha: ficha.fechaPreseleccion });
  if (ficha.estado === "entrevista" || ficha.estado === "contratado") lista.push({ texto: "La empresa la llamó a entrevista", fecha: null });
  if (ficha.estado === "contratado") lista.push({ texto: "La empresa la contrató", fecha: null });
  if (ficha.estado === "rechazado") {
    lista.push({ texto: ficha.fechaPreseleccion ? "La empresa no la eligió" : "La Oficina la rechazó", fecha: null, tono: "malo" });
  }
  return lista;
}

/**
 * One applicant of an offer as the Office sees it (branch D): personal data,
 * photo, categories, CV (built or uploaded), other applications, the decision,
 * history and private notes. Companies never see this page (Rule 1).
 */
export default async function PostulacionAdminPage({ params }: PageProps<"/admin/ofertas/[id]/postulantes/[postulacionId]">) {
  const { id, postulacionId } = await params;
  const ficha = await cargar(id, postulacionId);
  if (!ficha) notFound();

  const momento = ahora();
  const { postulante, oferta } = ficha;
  const pendiente = ficha.estado === "pendiente";
  const siguiente = await siguientePorPreseleccionar(oferta.id, ficha.id);
  const rutaLista = `/admin/ofertas/${oferta.id}/postulantes`;

  return (
    <div className="space-y-6">
      <EnlaceVolver href={rutaLista} texto={`Postulantes de ${oferta.titulo}`} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          <FichaPostulante
            postulante={postulante}
            rubroDestacado={oferta.categoria}
            detalle={
              <>
                Se postuló a <span className="font-medium text-foreground">{oferta.titulo}</span> {haceCuanto(ficha.creada, momento)}
              </>
            }
            accion={
              <Link
                href={`/admin/postulantes/${postulante.id}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold text-primary transition-colors hover:bg-accent"
              >
                <UserRound aria-hidden className="size-4" /> Ver perfil completo
              </Link>
            }
          />
          <PostulacionesPostulante titulo="Otras postulaciones" postulaciones={ficha.otras} vacio="Es su primera postulación en el portal." momento={momento} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-labelledby="titulo-decision" className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm motion-safe:animate-entrada sm:p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="titulo-decision" className="font-heading text-lg font-semibold">
                  {pendiente ? "Tu decisión" : "Estado"}
                </h2>
                <EtiquetaPostulacionAdmin estado={ficha.estado} motivo={ficha.motivoRechazo} />
              </div>
              <p className="text-sm text-muted-foreground">{TEXTO_ESTADO[ficha.estado]}</p>
            </div>

            <AccionesPostulacion ofertaId={oferta.id} postulacionId={ficha.id} pendiente={pendiente} />

            {siguiente && (
              <Link
                href={`${rutaLista}/${siguiente.id}`}
                className="group flex items-center justify-between gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
              >
                Revisar la siguiente ({siguiente.restantes} por revisar)
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}

            <div className="border-t border-border pt-4">
              <h3 className="mb-3 text-sm font-semibold">Historial</h3>
              <LineaTiempo hitos={hitos(ficha)} momento={momento} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <NotasAdmin ofertaId={oferta.id} postulacionId={ficha.id} notas={ficha.notas} />
          </section>
        </aside>
      </div>
    </div>
  );
}

