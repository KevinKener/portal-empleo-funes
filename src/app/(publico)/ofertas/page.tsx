import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { FiltroCategorias } from "@/components/ofertas/FiltroCategorias";
import { Paginacion } from "@/components/ofertas/Paginacion";
import { TarjetaOferta } from "@/components/ofertas/TarjetaOferta";
import { listarCategorias } from "@/lib/categorias";
import { listarOfertasPublicas } from "@/lib/ofertas";
import { validarFiltrosOfertas } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Ofertas de trabajo" };

// searchParams may repeat a key; only the first value counts, like in the API.
function aURLSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  const resultado = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    const primero = Array.isArray(valor) ? valor[0] : valor;
    if (primero !== undefined) resultado.set(clave, primero);
  }
  return resultado;
}

export default async function OfertasPage({ searchParams }: PageProps<"/ofertas">) {
  const filtros = validarFiltrosOfertas(aURLSearchParams(await searchParams));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-12">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">Ofertas de trabajo</h1>
        <p className="text-muted-foreground">
          Todas las ofertas fueron revisadas y aprobadas por la Oficina de Empleo.
        </p>
      </header>

      {filtros.ok ? (
        <Listado categoria={filtros.datos.categoria} pagina={filtros.datos.pagina} />
      ) : (
        <EstadoVacio titulo={filtros.error} />
      )}
    </div>
  );
}

async function Listado({ categoria, pagina }: { categoria: string | null; pagina: number }) {
  // Rule 2 is enforced by the ofertas_publicas view behind listarOfertasPublicas.
  const [categorias, resultado] = await Promise.all([
    listarCategorias(),
    listarOfertasPublicas({ categoria, pagina }),
  ]);
  const totalPaginas = Math.ceil(resultado.total / resultado.porPagina);

  return (
    <>
      <FiltroCategorias categorias={categorias} seleccionada={categoria} />

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {resultado.total === 1 ? "1 oferta publicada" : `${resultado.total} ofertas publicadas`}
      </p>

      {resultado.ofertas.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultado.ofertas.map((oferta) => (
            <li key={oferta.id}>
              <TarjetaOferta oferta={oferta} />
            </li>
          ))}
        </ul>
      ) : (
        <EstadoVacio titulo={mensajeSinResultados(resultado.total, categoria)} />
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} categoria={categoria} />
    </>
  );
}

function mensajeSinResultados(total: number, categoria: string | null): string {
  if (total > 0) return "No hay más ofertas en esta página.";
  return categoria ? "No hay ofertas en esta categoría por ahora." : "Todavía no hay ofertas publicadas.";
}

function EstadoVacio({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <SearchX aria-hidden className="size-10 text-muted-foreground" />
      <p className="font-medium text-foreground">{titulo}</p>
      <Link href="/ofertas" className="text-sm font-medium text-primary hover:underline">
        Ver todas las ofertas
      </Link>
    </div>
  );
}
