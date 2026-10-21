import Link from "next/link";
import type { Categoria } from "@/lib/categorias";
import { hrefOfertas, type OrdenOfertas } from "@/lib/validaciones/ofertas";
import { cn } from "@/lib/utils";

/**
 * Category chips as plain links (?categoria=<id>), so filtering works without
 * JavaScript and every filtered listing has a shareable URL. Keeps the order.
 */
export function FiltroCategorias({
  categorias,
  seleccionada,
  orden,
}: {
  categorias: Categoria[];
  seleccionada: string | null;
  orden: OrdenOfertas;
}) {
  const opciones = [{ id: null, nombre: "Todas" }, ...categorias];

  return (
    <nav
      aria-label="Filtrar por categoría"
      // On phones the chips scroll sideways; the fading right edge shows there is more
      className="-mx-4 -mt-1 overflow-x-auto px-4 pt-1 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {opciones.map((categoria) => {
          const activa = categoria.id === seleccionada;
          return (
            <li key={categoria.id ?? "todas"}>
              <Link
                href={hrefOfertas({ categoria: categoria.id, orden })}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,translate,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5",
                  activa
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary hover:shadow-sm"
                )}
              >
                {categoria.nombre}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
