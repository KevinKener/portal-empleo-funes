import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import { ArrowRight, FileText, Hash, Home, Phone, Tags, Target } from "lucide-react";
import { abrirCvPostulacion } from "@/app/admin/ofertas/[id]/postulantes/actions";
import { AccionesPostulacion } from "@/components/admin/AccionesPostulacion";
import { EtiquetaPostulacionAdmin } from "@/components/admin/EtiquetaPostulacionAdmin";
import { InsigniaDomicilio } from "@/components/admin/InsigniaDomicilio";
import { LineaTiempo, type HitoLinea } from "@/components/admin/LineaTiempo";
import { NotasAdmin } from "@/components/admin/NotasAdmin";
import { BotonCvCandidato } from "@/components/empresa/BotonCvCandidato";
import { CvCandidato } from "@/components/empresa/CvCandidato";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { Avatar } from "@/components/postulante/Avatar";
import { obtenerFichaPostulacion, siguientePorPreseleccionar, type FichaPostulacion } from "@/lib/admin/postulaciones";
import { requerirRol } from "@/lib/auth";
import { ahora, haceCuanto } from "@/lib/formato";
import { cn } from "@/lib/utils";
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
  const tieneCvArmado = postulante.experiencias.length > 0 || postulante.formaciones.length > 0;
  const rutaLista = `/admin/ofertas/${oferta.id}/postulantes`;

  return (
    <div className="space-y-6">
      <EnlaceVolver href={rutaLista} texto={`Postulantes de ${oferta.titulo}`} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section aria-labelledby="titulo-persona" className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm motion-safe:animate-entrada sm:p-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar nombre={postulante.nombre} apellido={postulante.apellido} foto={postulante.foto} encuadre={postulante.encuadre} tamanio="lg" />
              <div className="min-w-0 space-y-1.5">
                <h1 id="titulo-persona" className="font-heading text-2xl font-bold text-balance">
                  {postulante.nombre} {postulante.apellido}
                </h1>
                <InsigniaDomicilio localidad={postulante.localidad} estado={postulante.estadoDomicilio} tieneComprobante={postulante.tieneComprobante} />
                <p className="text-sm text-muted-foreground">
                  Se postuló a <span className="font-medium text-foreground">{oferta.titulo}</span> {haceCuanto(ficha.creada, momento)}
                </p>
              </div>
            </header>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Dato Icono={Hash} etiqueta="DNI">
                {postulante.dni}
              </Dato>
              <Dato Icono={Phone} etiqueta="Teléfono">
                {/* The Office may call before deciding; companies get it only from the interview on */}
                <a href={`tel:${postulante.telefono.replace(/[^\d+]/g, "")}`} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {postulante.telefono}
                </a>
              </Dato>
              <Dato Icono={Home} etiqueta="Dirección" ancho>
                {postulante.direccion}
              </Dato>
            </dl>

            {postulante.categorias.length > 0 && (
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Tags aria-hidden className="size-4 text-primary" /> Rubros que eligió
                </h2>
                <ul className="flex flex-wrap gap-1.5">
                  {postulante.categorias.map((categoria) => {
                    const coincide = categoria === oferta.categoria;
                    return (
                      <li
                        key={categoria}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          coincide ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80",
                        )}
                      >
                        {coincide && <Target aria-hidden className="size-3" />}
                        {categoria}
                        {coincide && <span className="sr-only"> (el rubro de la oferta)</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          <section aria-labelledby="titulo-cv" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="titulo-cv" className="flex items-center gap-2 font-heading text-lg font-semibold">
                <FileText aria-hidden className="size-5 text-primary" /> CV
              </h2>
              {postulante.tieneCvPdf && <BotonCvCandidato postulacionId={ficha.id} abrir={abrirCvPostulacion} />}
            </div>
            {postulante.descripcion && (
              <blockquote className="border-l-2 border-primary/30 pl-3 text-sm whitespace-pre-line text-foreground/85 italic">{postulante.descripcion}</blockquote>
            )}
            {tieneCvArmado ? (
              <div className="space-y-5 text-sm">
                <CvCandidato experiencias={postulante.experiencias} formaciones={postulante.formaciones} />
              </div>
            ) : (
              !postulante.descripcion && (
                <p className="text-sm text-muted-foreground">
                  {postulante.tieneCvPdf ? "Subió su CV como archivo: abrilo con el botón." : "Todavía no cargó su CV."}
                </p>
              )
            )}
          </section>

          <section aria-labelledby="titulo-otras" className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 id="titulo-otras" className="font-heading text-lg font-semibold">
              Otras postulaciones
            </h2>
            {ficha.otras.length === 0 ? (
              <p className="text-sm text-muted-foreground">Es su primera postulación en el portal.</p>
            ) : (
              <ul className="divide-y divide-border">
                {ficha.otras.map((otra) => (
                  <li key={otra.id} className="group relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <Link
                        href={`/admin/ofertas/${otra.ofertaId}/postulantes/${otra.id}`}
                        className="font-medium group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {otra.titulo}
                      </Link>
                      <span className="block text-xs text-muted-foreground">Se postuló {haceCuanto(otra.creada, momento)}</span>
                    </span>
                    <EtiquetaPostulacionAdmin estado={otra.estado} motivo={otra.motivoRechazo} />
                  </li>
                ))}
              </ul>
            )}
          </section>
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

function Dato({ Icono, etiqueta, ancho = false, children }: { Icono: typeof Hash; etiqueta: string; ancho?: boolean; children: ReactNode }) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2.5 rounded-xl bg-muted px-3 py-2.5", ancho && "sm:col-span-2")}>
      <Icono aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
        <dd className="font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}
