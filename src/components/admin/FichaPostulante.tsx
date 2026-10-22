import Link from "next/link";
import type { ReactNode } from "react";
import { FileText, Hash, Home, Phone, Tags, Target } from "lucide-react";
import { abrirCvPostulante } from "@/app/admin/postulantes/actions";
import { EtiquetaPostulacionAdmin } from "@/components/admin/EtiquetaPostulacionAdmin";
import { InsigniaDomicilio } from "@/components/admin/InsigniaDomicilio";
import { BotonCvCandidato } from "@/components/empresa/BotonCvCandidato";
import { CvCandidato } from "@/components/empresa/CvCandidato";
import { Avatar } from "@/components/postulante/Avatar";
import type { PerfilPostulanteAdmin, PostulacionDePostulante } from "@/lib/admin/postulantes";
import { haceCuanto } from "@/lib/formato";
import { cn } from "@/lib/utils";

type PropsFichaPostulante = {
  postulante: PerfilPostulanteAdmin;
  /** Line under the name: what brings the Office here (an application, the account's age). */
  detalle: ReactNode;
  /** The offer's category, highlighted among the person's (D1); null on the profile page. */
  rubroDestacado?: string | null;
  /** Extra action next to the name, e.g. "Ver perfil completo". */
  accion?: ReactNode;
};

/**
 * A job seeker as the Office sees them (branch D): data, photo, phone,
 * address status, categories and CV, built or uploaded. Shared by the
 * application page (D1) and the person's profile (D2). Companies never see
 * this (Rule 1): they get TarjetaCandidato instead.
 */
export function FichaPostulante({ postulante, detalle, rubroDestacado = null, accion }: PropsFichaPostulante) {
  const tieneCvArmado = postulante.experiencias.length > 0 || postulante.formaciones.length > 0;

  return (
    <>
      <section aria-labelledby="titulo-persona" className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm motion-safe:animate-entrada sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar nombre={postulante.nombre} apellido={postulante.apellido} foto={postulante.foto} encuadre={postulante.encuadre} tamanio="lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 id="titulo-persona" className="font-heading text-2xl font-bold text-balance">
              {postulante.nombre} {postulante.apellido}
            </h1>
            <InsigniaDomicilio localidad={postulante.localidad} estado={postulante.estadoDomicilio} tieneComprobante={postulante.tieneComprobante} />
            <p className="text-sm text-muted-foreground">{detalle}</p>
          </div>
          {accion && <div className="shrink-0">{accion}</div>}
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
                const coincide = categoria === rubroDestacado;
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
          {postulante.tieneCvPdf && <BotonCvCandidato id={postulante.id} abrir={abrirCvPostulante} />}
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
    </>
  );
}

/**
 * A person's applications, each linking to its own page where the Office
 * decides (D1). `vacio` is what to say when there are none.
 */
export function PostulacionesPostulante({ titulo, postulaciones, vacio, momento }: { titulo: string; postulaciones: PostulacionDePostulante[]; vacio: string; momento: number }) {
  return (
    <section aria-labelledby="titulo-postulaciones-persona" className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 id="titulo-postulaciones-persona" className="flex items-center gap-2 font-heading text-lg font-semibold">
        {titulo}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{postulaciones.length}</span>
      </h2>
      {postulaciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <ul className="divide-y divide-border">
          {postulaciones.map((p) => (
            <li key={p.id} className="group relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
              <span className="min-w-0">
                <Link
                  href={`/admin/ofertas/${p.ofertaId}/postulantes/${p.id}`}
                  className="font-medium group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {p.titulo}
                </Link>
                <span className="block text-xs text-muted-foreground">Se postuló {haceCuanto(p.creada, momento)}</span>
              </span>
              <EtiquetaPostulacionAdmin estado={p.estado} motivo={p.motivoRechazo} />
            </li>
          ))}
        </ul>
      )}
    </section>
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
