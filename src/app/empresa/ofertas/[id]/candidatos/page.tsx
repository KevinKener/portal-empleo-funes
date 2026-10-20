import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ResumenSeleccion } from "@/components/empresa/ResumenSeleccion";
import { TarjetaCandidato } from "@/components/empresa/TarjetaCandidato";
import { requerirRol } from "@/lib/auth";
import { listarCandidatos } from "@/lib/candidatos-empresa";
import { ETAPAS_SELECCION } from "@/lib/formato";
import { obtenerEmpresaActual, obtenerOfertaEmpresa } from "@/lib/ofertas-empresa";
import { esUuid } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Candidatos" };

/**
 * Candidates the Employment Office pre-selected for one of the company's
 * offers, grouped by stage, with the selection draft (Rules 1 and 11).
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/empresa/ofertas/${id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" /> Volver a la oferta
        </Link>
        <h1 className="font-heading text-3xl font-bold">Candidatos</h1>
        <p className="max-w-2xl text-muted-foreground">
          Para «{oferta.titulo}». La Oficina de Empleo te envía los perfiles que preseleccionó. Marcá a quién querés
          entrevistar o contratar y confirmá la selección cuando estés listo.
        </p>
      </div>

      {candidatos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <Users aria-hidden className="size-10 text-muted-foreground" />
          <p className="font-medium">Todavía no hay candidatos preseleccionados.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cuando la Oficina de Empleo revise las postulaciones, los perfiles elegidos van a aparecer acá.
          </p>
        </div>
      ) : (
        <>
          <ResumenSeleccion
            ofertaId={id}
            entrevistas={contar("preseleccionado", "tomar")}
            contrataciones={contar("entrevista", "tomar")}
            descartes={candidatos.filter((c) => c.decision === "descartar").length}
          />
          {ETAPAS_SELECCION.map((etapa) => {
            const grupo = candidatos.filter((c) => c.estado === etapa.estado);
            if (grupo.length === 0) return null;
            return (
              <section key={etapa.estado} className="space-y-3">
                <h2 className="font-heading text-xl font-semibold">
                  {etapa.titulo} <span className="text-muted-foreground">({grupo.length})</span>
                </h2>
                <ul className="grid gap-4 lg:grid-cols-2">
                  {grupo.map((candidato) => (
                    <li key={candidato.postulacionId}>
                      <TarjetaCandidato ofertaId={id} candidato={candidato} textoTomar={etapa.tomar} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
