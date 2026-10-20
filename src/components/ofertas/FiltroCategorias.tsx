import Link from "next/link";
import type { Categoria } from "@/lib/categorias";
import { tonoRubro } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Category chips as plain links (?categoria=<id>), so filtering works without
 * JavaScript and every filtered listing has a shareable URL.
 */
export function FiltroCategorias({
  categorias,
  seleccionada,
}: {
  categorias: Categoria[];
  seleccionada: string | null;
}) {
  const opciones = [{ id: null, nombre: "Todas" }, ...categorias];

  return (
    <nav aria-label="Filtrar por categoría" className="-mx-4 overflow-x-auto px-4 pb-1">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {opciones.map((categoria) => {
          const activa = categoria.id === seleccionada;
          const tono = categoria.id ? tonoRubro(categoria.nombre) : null;
          return (
            <li key={categoria.id ?? "todas"}>
              <Link
                href={categoria.id ? `/ofertas?categoria=${categoria.id}` : "/ofertas"}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,translate,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5",
                  activa
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary hover:shadow-sm"
                )}
              >
                {/* Same color as the category's cards, so the filter and the list match */}
                {tono && <span aria-hidden className={cn("size-2 rounded-full", activa ? "bg-primary-foreground" : tono.barra)} />}
                {categoria.nombre}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
