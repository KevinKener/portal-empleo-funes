import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSearch, SearchX, UserSearch } from "lucide-react";
import { EtiquetaOfertaAdmin } from "@/components/admin/EtiquetaOfertaAdmin";
import { FiltrosLista } from "@/components/admin/FiltrosLista";
import { TablaAdmin, type ColumnaAdmin } from "@/components/admin/TablaAdmin";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { InsigniasOferta } from "@/components/ofertas/InsigniasOferta";
import { filtroOfertasAdmin, listarOfertasAdmin, type FiltroOfertasAdmin, type FilaOfertaAdmin } from "@/lib/admin/ofertas";
import { ofertaVencida, textoCierre } from "@/lib/cierre-oferta";
import { ahora, haceCuanto } from "@/lib/formato";
import { urlLogo } from "@/lib/logo-empresa";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ofertas" };

const FILTROS: { valor: FiltroOfertasAdmin; texto: string }[] = [
  { valor: "pendiente", texto: "Por revisar" },
  { valor: "publicada", texto: "Publicadas" },
  { valor: "sin-postulantes", texto: "Sin postulantes" },
  { valor: "vencida", texto: "Vencidas" },
  { valor: "rechazada", texto: "Rechazadas" },
  { valor: "cerrada", texto: "Cerradas" },
  { valor: "todas", texto: "Todas" },
];

const VACIOS: Record<FiltroOfertasAdmin, string> = {
  pendiente: "No hay ofertas esperando revisión. ¡Al día!",
  publicada: "No hay ofertas publicadas.",
  "sin-postulantes": "Todas las ofertas publicadas hace más de una semana tienen postulantes.",
  vencida: "No hay ofertas vencidas.",
  rechazada: "No hay ofertas rechazadas.",
  cerrada: "No hay ofertas cerradas.",
  todas: "Todavía no llegó ninguna oferta.",
};

/** The date that matters in each status, in words. */
function cuando(fila: FilaOfertaAdmin, momento: number): string {
  switch (fila.estado) {
    case "pendiente":
      return `Enviada ${haceCuanto(fila.fecha_envio ?? fila.updated_at, momento)}`;
    case "publicada":
      // The closing date says more than the publication once it is near or past
      if (fila.fecha_cierre) return textoCierre(fila.fecha_cierre, momento);
      return fila.fecha_publicacion ? `Publicada ${haceCuanto(fila.fecha_publicacion, momento)}` : "Publicada";
    case "rechazada":
      return `Rechazada ${haceCuanto(fila.updated_at, momento)}`;
    default:
      return `Cerrada ${haceCuanto(fila.updated_at, momento)}`;
  }
}

function Postulaciones({ fila }: { fila: FilaOfertaAdmin }) {
  if (fila.estado === "pendiente" || fila.estado === "rechazada") return <span className="text-muted-foreground">—</span>;
  const { total, pendientes } = fila.postulaciones;
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span>
        <span className="font-semibold">{total}</span>
        {/* The column header says it on desktop; cards need the word */}
        <span className="lg:sr-only"> {total === 1 ? "postulación" : "postulaciones"}</span>
      </span>
      {pendientes > 0 && (
        // Above the row's link: goes straight to pre-selection (branch D)
        <Link
          href={`/admin/ofertas/${fila.id}/postulantes`}
          className="relative z-20 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <UserSearch aria-hidden className="size-3.5" />
          {pendientes} por revisar
        </Link>
      )}
    </span>
  );
}

function Titulo({ fila }: { fila: FilaOfertaAdmin }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {/* The title link covers the whole row or card */}
      <Link
        href={`/admin/ofertas/${fila.id}`}
        className="font-semibold text-foreground group-hover:text-primary after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
      >
        {fila.titulo}
      </Link>
      {fila.prioridad === "urgente" && fila.estado !== "rechazada" && fila.estado !== "cerrada" && <InsigniasOferta insignias={["urgente"]} />}
    </span>
  );
}

function Empresa({ fila }: { fila: FilaOfertaAdmin }) {
  const nombre = fila.empresa?.nombre_comercial ?? "Empresa";
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <LogoEmpresa nombre={nombre} logo={urlLogo(fila.empresa?.logo_url)} tamanio="sm" className="size-8 rounded-lg text-sm" />
      <span className="truncate">{nombre}</span>
    </span>
  );
}

const Accion = ({ fila }: { fila: FilaOfertaAdmin }) => (
  <span className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-primary">
    {fila.estado === "pendiente" ? "Revisar" : "Ver"}
    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
  </span>
);

/**
 * "Ofertas" of the Office: the review queue first (urgent, then oldest),
 * published offers with applications to review, and the rest (branch B).
 */
export default async function OfertasAdminPage({ searchParams }: PageProps<"/admin/ofertas">) {
  const { estado, q } = await searchParams;
  const filtro = filtroOfertasAdmin(estado);
  const busqueda = typeof q === "string" ? q.slice(0, 100) : "";
  const momento = ahora();
  const { filas, conteo } = await listarOfertasAdmin(filtro, busqueda, momento);

  const columnas: ColumnaAdmin<FilaOfertaAdmin>[] = [
    { titulo: "Oferta", celda: (fila) => <Titulo fila={fila} />, className: "w-[30%]" },
    { titulo: "Empresa", celda: (fila) => <Empresa fila={fila} />, className: "max-w-56" },
    { titulo: "Rubro", celda: (fila) => <span className="text-muted-foreground">{fila.categoria}</span>, secundaria: true, className: "max-w-40" },
    { titulo: "Estado", celda: (fila) => <EtiquetaOfertaAdmin estado={fila.estado} vencida={ofertaVencida(fila, momento)} /> },
    { titulo: "Fecha", celda: (fila) => <span className="whitespace-nowrap text-muted-foreground">{cuando(fila, momento)}</span> },
    { titulo: "Postulaciones", celda: (fila) => <Postulaciones fila={fila} /> },
    { titulo: "Acción", celda: (fila) => <Accion fila={fila} />, className: "text-right" },
  ];

  return (
    <PaginaArea titulo="Ofertas" descripcion="Revisá las ofertas que envían las empresas antes de que se vean en el portal.">
      <FiltrosLista
        ruta="/admin/ofertas"
        filtros={FILTROS.map((f) => ({ ...f, cantidad: conteo[f.valor] }))}
        actual={filtro}
        busqueda={busqueda}
        buscarPor="Buscar puesto, empresa o rubro"
      />

      {filas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            {busqueda ? <SearchX aria-hidden className="size-7" /> : <FileSearch aria-hidden className="size-7" />}
          </span>
          <p className="font-heading text-lg font-semibold">{busqueda ? `No encontramos ofertas para “${busqueda}”.` : VACIOS[filtro]}</p>
          {busqueda && <p className="text-sm text-muted-foreground">Probá con otra palabra o mirá en “Todas”.</p>}
        </div>
      ) : (
        <TablaAdmin
          titulo="Ofertas"
          filas={filas}
          clave={(fila) => fila.id}
          columnas={columnas}
          tarjeta={(fila) => (
            <article
              className={cn(
                "group relative space-y-3 rounded-2xl border bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:shadow-md has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                fila.estado === "pendiente" && fila.prioridad === "urgente" ? "border-aviso/40" : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <Titulo fila={fila} />
                <EtiquetaOfertaAdmin estado={fila.estado} vencida={ofertaVencida(fila, momento)} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Empresa fila={fila} />
                {fila.categoria && <span className="text-muted-foreground">{fila.categoria}</span>}
              </div>
              {(fila.estado === "publicada" || fila.estado === "cerrada") && (
                <div className="text-sm">
                  <Postulaciones fila={fila} />
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">{cuando(fila, momento)}</span>
                <Accion fila={fila} />
              </div>
            </article>
          )}
        />
      )}
    </PaginaArea>
  );
}
