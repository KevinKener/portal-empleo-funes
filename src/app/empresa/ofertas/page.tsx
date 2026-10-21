import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePlus2, FileText } from "lucide-react";
import { FiltroOfertasEmpresa } from "@/components/empresa/FiltroOfertasEmpresa";
import { AvisoEmpresaSinVerificar } from "@/components/empresa/AvisoEmpresaSinVerificar";
import { TarjetaOfertaEmpresa } from "@/components/empresa/TarjetaOfertaEmpresa";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { resumirCandidatosPorOferta } from "@/lib/candidatos-empresa";
import { listarOfertasEmpresa, obtenerEmpresaActual } from "@/lib/ofertas-empresa";
import { FILTROS_OFERTAS, filtroOfertas, ofertasDelFiltro, type FiltroOfertas } from "@/lib/panel-empresa";

export const metadata: Metadata = { title: "Mis ofertas" };

/**
 * Every offer of the signed-in company, filtered by status (`?estado=`),
 * the ones waiting for the company first.
 */
export default async function OfertasEmpresaPage({ searchParams }: PageProps<"/empresa/ofertas">) {
  const filtro = filtroOfertas((await searchParams).estado);
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  if (!empresa) notFound();

  const [ofertas, candidatos] = await Promise.all([listarOfertasEmpresa(empresa.id), resumirCandidatosPorOferta()]);
  const verificada = empresa.estado === "verificado";
  const conteo = Object.fromEntries(
    FILTROS_OFERTAS.map((f) => [f, f === "todas" ? ofertas.length : ofertas.filter((o) => o.estado === f).length]),
  ) as Record<FiltroOfertas, number>;
  const visibles = ofertasDelFiltro(ofertas, candidatos, filtro);

  return (
    <PaginaArea
      titulo="Mis ofertas"
      descripcion="Cargá tus búsquedas como borrador y enviálas a revisión. La Oficina de Empleo las publica en el portal."
      acciones={
        verificada && (
          <Link href="/empresa/ofertas/nueva" className={buttonVariants({ className: "h-11 px-5 text-base hover:bg-primary-hover" })}>
            <FilePlus2 aria-hidden /> Nueva oferta
          </Link>
        )
      }
    >

      <AvisoEmpresaSinVerificar estado={empresa.estado} />

      {ofertas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <FileText aria-hidden className="size-10 text-muted-foreground" />
          <p className="font-medium">Todavía no cargaste ofertas.</p>
          {verificada && (
            <p className="max-w-sm text-sm text-muted-foreground">
              Empezá con &quot;Nueva oferta&quot;: se guarda como borrador hasta que decidas enviarla.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <FiltroOfertasEmpresa conteo={conteo} actual={filtro} />
          {visibles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No tenés ofertas en este estado.
            </p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibles.map((oferta, i) => (
                <li key={oferta.id} className="motion-safe:animate-entrada" style={{ "--retraso": `${Math.min(i, 8) * 70}ms` } as CSSProperties}>
                  <TarjetaOfertaEmpresa oferta={oferta} candidatos={candidatos.get(oferta.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PaginaArea>
  );
}
