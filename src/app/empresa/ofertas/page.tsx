import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePlus2, FileText } from "lucide-react";
import { AvisoEmpresaSinVerificar } from "@/components/empresa/AvisoEmpresaSinVerificar";
import { TarjetaOfertaEmpresa } from "@/components/empresa/TarjetaOfertaEmpresa";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { listarOfertasEmpresa, obtenerEmpresaActual } from "@/lib/ofertas-empresa";

export const metadata: Metadata = { title: "Mis ofertas" };

/** Every offer of the signed-in company, with its status. */
export default async function OfertasEmpresaPage() {
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  if (!empresa) notFound();

  const ofertas = await listarOfertasEmpresa(empresa.id);
  const verificada = empresa.estado === "verificado";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold">Mis ofertas</h1>
          <p className="max-w-2xl text-muted-foreground">
            Cargá tus búsquedas como borrador y enviálas a revisión. La Oficina de Empleo las publica en el portal.
          </p>
        </div>
        {verificada && (
          <Link
            href="/empresa/ofertas/nueva"
            className={buttonVariants({ className: "h-11 shrink-0 px-5 text-base hover:bg-primary-hover" })}
          >
            <FilePlus2 aria-hidden /> Nueva oferta
          </Link>
        )}
      </div>

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
        <ul className="grid gap-4 lg:grid-cols-2">
          {ofertas.map((oferta) => (
            <li key={oferta.id}>
              <TarjetaOfertaEmpresa oferta={oferta} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
