import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BadgeCheck, SearchX, UserSearch, Users } from "lucide-react";
import { FiltrosLista } from "@/components/admin/FiltrosLista";
import { ListaPostulantes } from "@/components/admin/ListaPostulantes";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { obtenerOfertaAdmin } from "@/lib/admin/ofertas";
import { filtroPostulaciones, listarPostulacionesOferta, type FiltroPostulaciones } from "@/lib/admin/postulaciones";
import { requerirRol } from "@/lib/auth";
import { ahora } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { esUuid } from "@/lib/validaciones/ofertas";

// Deduplicated per request: generateMetadata and the page read the same offer.
const cargar = cache(async (id: string) => {
  await requerirRol("admin");
  return esUuid(id) ? obtenerOfertaAdmin(id) : null;
});

export async function generateMetadata({ params }: PageProps<"/admin/ofertas/[id]/postulantes">): Promise<Metadata> {
  const oferta = await cargar((await params).id);
  return { title: oferta ? `Postulantes: ${oferta.titulo}` : "Oferta no encontrada" };
}

const FILTROS: { valor: FiltroPostulaciones; texto: string }[] = [
  { valor: "pendiente", texto: "Por revisar" },
  { valor: "preseleccionado", texto: "Preseleccionados" },
  { valor: "entrevista", texto: "En entrevista" },
  { valor: "contratado", texto: "Contratados" },
  { valor: "rechazado", texto: "No seleccionados" },
  { valor: "todas", texto: "Todas" },
];

const VACIOS: Record<FiltroPostulaciones, string> = {
  pendiente: "No queda nadie por revisar en esta oferta. ¡Al día!",
  preseleccionado: "Todavía no preseleccionaste a nadie, o la empresa ya respondió por todos.",
  entrevista: "La empresa todavía no llamó a nadie a entrevista.",
  contratado: "Todavía no hay contrataciones en esta oferta.",
  rechazado: "No hay postulaciones rechazadas.",
  todas: "Todavía no se postuló nadie a esta oferta.",
};

/**
 * Applicants of an offer for the Office (branch D): Funes residents first,
 * then other towns, each by application date (Rule 4); status chips, search
 * by name or DNI and a "verified address" filter, all in the URL. Pending
 * ones are pre-selected or rejected from here, one by one or together.
 */
export default async function PostulantesOfertaPage({ params, searchParams }: PageProps<"/admin/ofertas/[id]/postulantes">) {
  const { id } = await params;
  const oferta = await cargar(id);
  if (!oferta) notFound();

  const { estado, q, verificado } = await searchParams;
  const filtro = filtroPostulaciones(estado);
  const busqueda = typeof q === "string" ? q.slice(0, 100) : "";
  const soloVerificados = verificado === "1";
  const momento = ahora();
  const { filas, conteo } = await listarPostulacionesOferta(oferta.id, filtro, { busqueda, soloVerificados });

  const ruta = `/admin/ofertas/${oferta.id}/postulantes`;
  const alternarVerificados = new URLSearchParams({ estado: filtro, ...(busqueda && { q: busqueda }), ...(!soloVerificados && { verificado: "1" }) });
  const filtrado = busqueda !== "" || soloVerificados;

  return (
    <PaginaArea
      titulo="Postulantes"
      volver={{ href: `/admin/ofertas/${oferta.id}`, texto: oferta.titulo }}
      descripcion={
        <>
          {oferta.titulo} · {oferta.empresa?.nombre_comercial ?? "Empresa"}
          {oferta.categoria && ` · ${oferta.categoria}`}
        </>
      }
    >
      <div className="space-y-3">
        <FiltrosLista
          ruta={ruta}
          filtros={FILTROS.map((f) => ({ ...f, cantidad: conteo[f.valor] }))}
          actual={filtro}
          busqueda={busqueda}
          buscarPor="Buscar por nombre o DNI"
          extra={soloVerificados ? { verificado: "1" } : undefined}
        />
        <Link
          href={`${ruta}?${alternarVerificados}`}
          aria-pressed={soloVerificados}
          className={cn(
            "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
            soloVerificados ? "border-primary bg-secondary text-secondary-foreground" : "border-dashed border-border bg-card hover:border-primary hover:text-primary",
          )}
        >
          <BadgeCheck aria-hidden className="size-4" />
          {soloVerificados ? "Mostrando solo domicilio verificado · Ver todos" : "Solo domicilio verificado"}
        </Link>
      </div>

      {filas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            {filtrado ? <SearchX aria-hidden className="size-7" /> : filtro === "pendiente" ? <UserSearch aria-hidden className="size-7" /> : <Users aria-hidden className="size-7" />}
          </span>
          <p className="font-heading text-lg font-semibold">
            {busqueda ? `No encontramos postulantes para “${busqueda}”.` : soloVerificados ? "Nadie con domicilio verificado en esta lista." : VACIOS[filtro]}
          </p>
          {filtrado && <p className="text-sm text-muted-foreground">Probá con otra búsqueda o mirá en “Todas”.</p>}
        </div>
      ) : (
        <ListaPostulantes ofertaId={oferta.id} filas={filas} rubroOferta={oferta.categoria} momento={momento} />
      )}
    </PaginaArea>
  );
}
