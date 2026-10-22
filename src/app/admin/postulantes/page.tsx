import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, Users, X } from "lucide-react";
import { BarraFiltrosPostulantes } from "@/components/admin/BarraFiltrosPostulantes";
import { TablaPostulantes } from "@/components/admin/TablaPostulantes";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { filtroLocalidad, listarPostulantesAdmin, ordenPostulantes } from "@/lib/admin/postulantes";
import { requerirRol } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { ahora, ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { esUuid } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Postulantes" };

const RUTA = "/admin/postulantes";
const LOCALIDADES = ["funes", "roldan", "rosario", "otra"] as const;

/**
 * "Postulantes" of the Office (branch D2): every registered job seeker in a
 * dense, sortable table (NN/g: tables beat cards for finding and comparing
 * records), searched by name or DNI and filtered by town, category and
 * verified address, all in the URL. Funes first by default (Rule 4). Below lg
 * each row is a card.
 */
export default async function PostulantesAdminPage({ searchParams }: PageProps<"/admin/postulantes">) {
  await requerirRol("admin");
  const { localidad, q, rubro, verificado, orden, pagina } = await searchParams;
  const filtro = filtroLocalidad(localidad);
  const busqueda = typeof q === "string" ? q.slice(0, 100) : "";
  const soloVerificados = verificado === "1";
  const ordenActual = ordenPostulantes(orden);
  const momento = ahora();

  const categorias = await listarCategorias();
  const rubroActual = typeof rubro === "string" && esUuid(rubro) && categorias.some((c) => c.id === rubro) ? rubro : null;
  const listado = await listarPostulantesAdmin({
    localidad: filtro,
    busqueda,
    rubro: rubroActual,
    soloVerificados,
    orden: ordenActual,
    pagina: Number.parseInt(typeof pagina === "string" ? pagina : "1", 10) || 1,
  });

  // Every link keeps the current filters and changes only what it says
  const href = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (filtro !== "todas") params.set("localidad", filtro);
    if (busqueda) params.set("q", busqueda);
    if (rubroActual) params.set("rubro", rubroActual);
    if (soloVerificados) params.set("verificado", "1");
    if (ordenActual !== "funes") params.set("orden", ordenActual);
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null) params.delete(clave);
      else params.set(clave, valor);
    }
    const texto = params.toString();
    return texto ? `${RUTA}?${texto}` : RUTA;
  };
  const filtrado = busqueda !== "" || soloVerificados || rubroActual !== null || filtro !== "todas";


  return (
    <PaginaArea titulo="Postulantes" descripcion="Todas las personas registradas, se hayan postulado o no. Por defecto, primero los vecinos de Funes.">
      <div className="space-y-3">
        <BarraFiltrosPostulantes
          localidades={LOCALIDADES.map((l) => ({ valor: l, texto: `${ETIQUETAS_LOCALIDAD[l]} (${listado.conteo[l]})` }))}
          localidad={filtro === "todas" ? null : filtro}
          rubros={categorias.map((c) => ({ valor: c.id, texto: c.nombre }))}
          rubro={rubroActual}
          soloVerificados={soloVerificados}
          hrefVerificados={href({ verificado: soloVerificados ? null : "1", pagina: null })}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground" aria-live="polite">
            {listado.total === 0 ? "Sin resultados" : listado.total === 1 ? "1 persona" : `${listado.total} personas`}
            {filtrado && " con estos filtros"}
          </p>
          {filtrado && (
            <Link href={RUTA} className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
              <X aria-hidden className="size-3.5" /> Quitar filtros
            </Link>
          )}
        </div>
      </div>

      {listado.filas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            {filtrado ? <SearchX aria-hidden className="size-7" /> : <Users aria-hidden className="size-7" />}
          </span>
          <p className="font-heading text-lg font-semibold">
            {busqueda ? `No encontramos postulantes para “${busqueda}”.` : filtrado ? "Nadie coincide con estos filtros." : "Todavía no se registró nadie."}
          </p>
        </div>
      ) : (
        <TablaPostulantes listado={listado} ordenActual={ordenActual} momento={momento} href={href} />
      )}
    </PaginaArea>
  );
}
