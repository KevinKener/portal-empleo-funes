import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, FileCheck2, SearchX } from "lucide-react";
import { BandaSeccion } from "@/components/admin/BandaSeccion";
import { EtiquetaEmpresaAdmin } from "@/components/admin/EtiquetaEmpresaAdmin";
import { FiltrosLista } from "@/components/admin/FiltrosLista";
import { TablaAdmin, type ColumnaAdmin } from "@/components/admin/TablaAdmin";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { filtroEmpresasAdmin, listarEmpresasAdmin, type FiltroEmpresasAdmin, type FilaEmpresaAdmin } from "@/lib/admin/empresas";
import { resumirEmpresas } from "@/lib/admin/resumenes";
import { ahora, formatearCuit, haceCuanto } from "@/lib/formato";
import { urlLogo } from "@/lib/logo-empresa";

export const metadata: Metadata = { title: "Empresas" };

const FILTROS: { valor: FiltroEmpresasAdmin; texto: string }[] = [
  { valor: "pendiente", texto: "Por verificar" },
  { valor: "verificado", texto: "Verificadas" },
  { valor: "rechazado", texto: "Rechazadas" },
  { valor: "todas", texto: "Todas" },
];

const VACIOS: Record<FiltroEmpresasAdmin, string> = {
  pendiente: "No hay empresas esperando verificación. ¡Al día!",
  verificado: "Todavía no hay empresas verificadas.",
  rechazado: "No hay empresas rechazadas.",
  todas: "Todavía no se registró ninguna empresa.",
};

/** The date that matters in each status, in words. */
function cuando(fila: FilaEmpresaAdmin, momento: number): string {
  if (fila.estado === "pendiente") {
    // A company that sent fixes after a rejection still has the old reason (D1)
    return fila.motivo_rechazo ? `Corrigió sus datos ${haceCuanto(fila.updated_at, momento)}` : `Se registró ${haceCuanto(fila.created_at, momento)}`;
  }
  if (fila.estado === "rechazado") return `Rechazada ${haceCuanto(fila.updated_at, momento)}`;
  return `Se registró ${haceCuanto(fila.created_at, momento)}`;
}

function Nombre({ fila }: { fila: FilaEmpresaAdmin }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <LogoEmpresa nombre={fila.nombre_comercial} logo={urlLogo(fila.logo_url)} tamanio="sm" className="size-9 rounded-lg text-base" />
      <span className="min-w-0">
        {/* The name link covers the whole row or card */}
        <Link
          href={`/admin/empresas/${fila.id}`}
          className="block truncate font-semibold text-foreground group-hover:text-primary after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
        >
          {fila.nombre_comercial}
        </Link>
        <span className="block truncate text-xs text-muted-foreground">{fila.razon_social}</span>
      </span>
    </span>
  );
}

const Arca = ({ fila }: { fila: FilaEmpresaAdmin }) =>
  fila.tieneArca ? (
    <span className="inline-flex items-center gap-1 text-primary">
      <FileCheck2 aria-hidden className="size-4" /> Subida
    </span>
  ) : (
    <span className="text-muted-foreground">No subió</span>
  );

const Accion = ({ fila }: { fila: FilaEmpresaAdmin }) => (
  <span className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-primary">
    {fila.estado === "pendiente" ? "Verificar" : "Ver"}
    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
  </span>
);

/** "Empresas" of the Office: the verification queue first, then every company (branch C, Rule 3). */
export default async function EmpresasAdminPage({ searchParams }: PageProps<"/admin/empresas">) {
  const { estado, q } = await searchParams;
  const filtro = filtroEmpresasAdmin(estado);
  const busqueda = typeof q === "string" ? q.slice(0, 100) : "";
  const momento = ahora();
  const [{ filas, conteo }, resumen] = await Promise.all([listarEmpresasAdmin(filtro, busqueda), resumirEmpresas()]);

  const columnas: ColumnaAdmin<FilaEmpresaAdmin>[] = [
    { titulo: "Empresa", celda: (fila) => <Nombre fila={fila} />, className: "w-[32%] max-w-0" },
    { titulo: "CUIT", celda: (fila) => <span className="whitespace-nowrap tabular-nums">{formatearCuit(fila.cuit)}</span> },
    { titulo: "Estado", celda: (fila) => <EtiquetaEmpresaAdmin estado={fila.estado} /> },
    { titulo: "Constancia ARCA", celda: (fila) => <Arca fila={fila} />, secundaria: true },
    { titulo: "Ofertas", celda: (fila) => <span className="font-semibold">{fila.ofertas}</span>, secundaria: true },
    { titulo: "Fecha", celda: (fila) => <span className="text-muted-foreground">{cuando(fila, momento)}</span> },
    { titulo: "Acción", celda: (fila) => <Accion fila={fila} />, className: "text-right" },
  ];

  return (
    <div className="space-y-6">
      <BandaSeccion
        titulo="Empresas"
        resumen={
          resumen.proxima
            ? `${resumen.pendientes === 1 ? "1 empresa espera" : `${resumen.pendientes} empresas esperan`} verificación para poder publicar. La que más espera llegó ${haceCuanto(resumen.proxima.desde, momento)}.`
            : "Ninguna empresa espera verificación. ¡Al día!"
        }
        cifras={[
          { valor: resumen.pendientes, texto: "Por verificar", href: "/admin/empresas?estado=pendiente", destacada: resumen.pendientes > 0 },
          { valor: resumen.verificadas, texto: "Verificadas", href: "/admin/empresas?estado=verificado" },
          { valor: resumen.rechazadas, texto: "Rechazadas", href: "/admin/empresas?estado=rechazado" },
        ]}
        accion={resumen.proxima && { href: `/admin/empresas/${resumen.proxima.id}`, texto: "Verificar la próxima" }}
      />
      <FiltrosLista
        ruta="/admin/empresas"
        filtros={FILTROS.map((f) => ({ ...f, cantidad: conteo[f.valor] }))}
        actual={filtro}
        busqueda={busqueda}
        buscarPor="Buscar empresa o CUIT"
      />

      {filas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            {busqueda ? <SearchX aria-hidden className="size-7" /> : <Building2 aria-hidden className="size-7" />}
          </span>
          <p className="font-heading text-lg font-semibold">{busqueda ? `No encontramos empresas para “${busqueda}”.` : VACIOS[filtro]}</p>
          {busqueda && <p className="text-sm text-muted-foreground">Probá con otra palabra o mirá en “Todas”.</p>}
        </div>
      ) : (
        <TablaAdmin
          titulo="Empresas"
          filas={filas}
          clave={(fila) => fila.id}
          columnas={columnas}
          tarjeta={(fila) => (
            <article className="group relative space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              <div className="flex items-start justify-between gap-3">
                <Nombre fila={fila} />
                <EtiquetaEmpresaAdmin estado={fila.estado} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="tabular-nums">CUIT {formatearCuit(fila.cuit)}</span>
                <Arca fila={fila} />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">{cuando(fila, momento)}</span>
                <Accion fila={fila} />
              </div>
            </article>
          )}
        />
      )}
    </div>
  );
}
