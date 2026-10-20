import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, SearchX } from "lucide-react";
import { FiltroCategorias } from "@/components/ofertas/FiltroCategorias";
import { Paginacion } from "@/components/ofertas/Paginacion";
import { TarjetaOferta } from "@/components/ofertas/TarjetaOferta";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { Revelar } from "@/components/layout/Revelar";
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
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="relative isolate overflow-hidden rounded-3xl bg-primary-deep px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <FondoMarca compacto />
        <div className="max-w-2xl space-y-3 motion-safe:animate-entrada">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Ofertas de trabajo</h1>
          <p className="flex items-center gap-2 text-primary-foreground/85 sm:text-lg">
            <BadgeCheck aria-hidden className="size-5 shrink-0" />
            Todas fueron revisadas y aprobadas por la Oficina de Empleo.
          </p>
        </div>
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
          {resultado.ofertas.map((oferta, i) => (
            <li key={oferta.id}>
              {/* Cards arrive row by row as the list scrolls in */}
              <Revelar retraso={(i % 3) * 90} className="h-full">
                <TarjetaOferta oferta={oferta} />
              </Revelar>
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
