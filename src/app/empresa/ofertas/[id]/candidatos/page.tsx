import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, ListChecks, Lock, MousePointerClick, CalendarDays, ChevronRight, Clock, MessagesSquare, Tag, UserSearch, Users, UserX, type LucideIcon } from "lucide-react";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { ResumenSeleccion } from "@/components/empresa/ResumenSeleccion";
import { TarjetaCandidato } from "@/components/empresa/TarjetaCandidato";
import { requerirRol } from "@/lib/auth";
import { listarCandidatos } from "@/lib/candidatos-empresa";
import { ahora, ETAPAS_SELECCION, ETIQUETAS_JORNADA, haceCuanto } from "@/lib/formato";
import { obtenerEmpresaActual, obtenerOfertaEmpresa } from "@/lib/ofertas-empresa";
import { cn } from "@/lib/utils";
import { esUuid } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Candidatos" };

type Etapa = (typeof ETAPAS_SELECCION)[number]["estado"];

// Each stage with its icon, a short name (`movil` fits a 360 px phone) and what the company does there
const ETAPAS: Record<Etapa, { Icono: LucideIcon; corto: string; movil: string; ayuda: string | null }> = {
  preseleccionado: { Icono: UserSearch, corto: "Preseleccionados", movil: "Recibidos", ayuda: "Elegí a quién querés entrevistar. Sus datos de contacto aparecen cuando pasan a entrevista." },
  entrevista: { Icono: MessagesSquare, corto: "Entrevista", movil: "Entrevista", ayuda: "Ya podés llamarlos o escribirles. Después de la entrevista, marcá a quién contratás." },
  contratado: { Icono: BadgeCheck, corto: "Contratados", movil: "Contratados", ayuda: null },
  rechazado: { Icono: UserX, corto: "No seleccionados", movil: "No elegidos", ayuda: null },
};

/**
 * Candidates the Employment Office pre-selected for one of the company's
 * offers: the offer at a glance with its funnel, the candidates by stage
 * with their key facts, and the selection draft at the side (Rules 1 and 11).
 */
export default async function CandidatosPage({ params }: PageProps<"/empresa/ofertas/[id]/candidatos">) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  const oferta = empresa ? await obtenerOfertaEmpresa(empresa.id, id) : null;
  if (!oferta) notFound();

  const candidatos = await listarCandidatos(id);
  const contar = (estado: string, decision: string) =>
    candidatos.filter((c) => c.estado === estado && c.decision === decision).length;
  const porEtapa = (estado: Etapa) => candidatos.filter((c) => c.estado === estado);

  return (
    <div className="space-y-6">
      <EnlaceVolver href={`/empresa/ofertas/${id}`} texto="Volver a la oferta" />

      {/* The offer at a glance, and how many candidates sit in each stage */}
      <header className="space-y-5 rounded-2xl border border-border bg-gradient-to-br from-secondary via-card to-card p-5 shadow-sm motion-safe:animate-entrada sm:p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Candidatos para</p>
          <h1 className="font-heading text-2xl leading-tight font-bold text-balance sm:text-3xl">{oferta.titulo}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground/85">
            {oferta.categoria_nombre && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 shadow-sm">
                <Tag aria-hidden className="size-4 text-primary" /> {oferta.categoria_nombre}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 shadow-sm">
              <Clock aria-hidden className="size-4 text-primary" /> {ETIQUETAS_JORNADA[oferta.jornada]}
            </span>
            {oferta.fecha_publicacion && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 shadow-sm">
                <CalendarDays aria-hidden className="size-4 text-primary" /> Publicada {haceCuanto(oferta.fecha_publicacion, ahora())}
              </span>
            )}
            {oferta.prioridad === "urgente" && <InsigniasOferta insignias={["urgente"]} />}
          </div>
        </div>

        {candidatos.length > 0 && (
          <ol className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:gap-1.5" aria-label="Candidatos por etapa">
            {ETAPAS_SELECCION.map(({ estado }, i) => {
              const { Icono, corto, movil } = ETAPAS[estado];
              const cantidad = porEtapa(estado).length;
              return (
                <li key={estado} className="flex min-w-0 items-center gap-1.5 sm:flex-1">
                  <a
                    href={`#etapa-${estado}`}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 rounded-xl border p-3 transition-[border-color,box-shadow,translate] duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5",
                      cantidad === 0
                        ? "pointer-events-none border-transparent bg-card/60 text-muted-foreground"
                        : estado === "contratado"
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/40",
                    )}
                    aria-disabled={cantidad === 0 || undefined}
                  >
                    <Icono aria-hidden className="size-5 shrink-0" />
                    <span className="min-w-0">
                      <span
                        aria-hidden
                        className="contador block font-heading text-xl leading-none font-bold"
                        style={{ "--hasta": cantidad, "--retraso": `${i * 100}ms` } as CSSProperties}
                      />
                      <span className="block truncate text-xs font-medium">
                        <span className="sr-only">{cantidad} </span>
                        <span className="sm:hidden">{movil}</span>
                        <span className="hidden sm:inline">{corto}</span>
                      </span>
                    </span>
                  </a>
                  {i < ETAPAS_SELECCION.length - 1 && <ChevronRight aria-hidden className="hidden size-4 shrink-0 text-muted-foreground sm:block" />}
                </li>
              );
            })}
          </ol>
        )}
      </header>

      {candidatos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Users aria-hidden className="size-7" />
          </span>
          <p className="font-heading text-lg font-semibold">Todavía no hay candidatos preseleccionados.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            La Oficina de Empleo revisa a cada postulante antes de enviártelo. Cuando elija perfiles para esta oferta, van a
            aparecer acá.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div className="min-w-0 space-y-8">
            {ETAPAS_SELECCION.map((etapa) => {
              const grupo = porEtapa(etapa.estado);
              if (grupo.length === 0) return null;
              const { Icono, ayuda } = ETAPAS[etapa.estado];
              return (
                <section key={etapa.estado} id={`etapa-${etapa.estado}`} className="scroll-mt-24 space-y-4">
                  <div className="space-y-1">
                    <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
                      <Icono aria-hidden className="size-5 text-primary" />
                      {etapa.titulo}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{grupo.length}</span>
                    </h2>
                    {ayuda && <p className="text-sm text-muted-foreground">{ayuda}</p>}
                  </div>
                  <ul className={cn("grid gap-4", grupo.length > 1 && "xl:grid-cols-2")}>
                    {grupo.map((candidato, i) => (
                      <li
                        key={candidato.postulacionId}
                        className="motion-safe:animate-entrada"
                        style={{ "--retraso": `${Math.min(i, 6) * 80}ms` } as CSSProperties}
                      >
                        <TarjetaCandidato
                          ofertaId={id}
                          candidato={candidato}
                          textoTomar={etapa.tomar}
                          rubroOferta={oferta.categoria_nombre}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* Phones: the aside dissolves into the grid so "Tu selección" can stick to the bottom over the whole list */}
          <aside className="space-y-4 max-lg:contents lg:sticky lg:top-24">
            <ResumenSeleccion
              ofertaId={id}
              entrevistas={contar("preseleccionado", "tomar")}
              contrataciones={contar("entrevista", "tomar")}
              descartes={candidatos.filter((c) => c.decision === "descartar").length}
            />
            <ComoFunciona />
          </aside>
        </div>
      )}
    </div>
  );
}

const PASOS = [
  { Icono: Building2, texto: "La Oficina de Empleo te envía los perfiles que mejor encajan." },
  { Icono: MousePointerClick, texto: "Marcá a quién entrevistar, contratar o descartar. Podés cambiarlo." },
  { Icono: ListChecks, texto: "Confirmá la selección: recién ahí cada postulante ve su nuevo estado." },
];

/** The selection in three steps, joined by a line like the landing's "¿Cómo funciona?" (Rule 11). */
function ComoFunciona() {
  return (
    <section aria-labelledby="titulo-como-funciona" className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 id="titulo-como-funciona" className="font-heading font-semibold">
        Cómo funciona
      </h2>
      <ol className="relative space-y-4 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-0.5 before:-translate-x-1/2 before:rounded-full before:bg-border">
        {PASOS.map(({ Icono, texto }, i) => (
          <li key={texto} className="relative flex items-start gap-3 motion-safe:animate-entrada" style={{ "--retraso": `${200 + i * 120}ms` } as CSSProperties}>
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary ring-4 ring-card">
              <Icono aria-hidden className="size-4" />
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                {i + 1}
              </span>
            </span>
            <p className="pt-1 text-sm text-foreground/85">{texto}</p>
          </li>
        ))}
      </ol>
      {/* Rule 1: contact data only from the interview on (20261020120000_candidatos_empresa.sql) */}
      <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
        <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        Los datos de contacto aparecen cuando el candidato pasa a entrevista.
      </p>
    </section>
  );
}
