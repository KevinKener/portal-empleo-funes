import Link from "next/link";
import { BuscadorLista } from "@/components/admin/BuscadorLista";
import { cn } from "@/lib/utils";

export type FiltroLista = { valor: string; texto: string; cantidad: number };

type PropsFiltrosLista = {
  /** Page the filters belong to, e.g. "/admin/ofertas". */
  ruta: string;
  filtros: FiltroLista[];
  actual: string;
  busqueda: string;
  /** Placeholder of the search box: what can be searched. */
  buscarPor: string;
  /** Other URL params the page keeps while searching and filtering (e.g. `verificado`). */
  extra?: Record<string, string>;
  /** URL param the chips set; `estado` unless the list filters by something else (e.g. `localidad`). */
  parametro?: string;
};

function href(ruta: string, parametro: string, valor: string, q: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ ...extra, [parametro]: valor });
  if (q) params.set("q", q);
  return `${ruta}?${params}`;
}

/**
 * Search first, then filter chips with their counts (MoJ case list,
 * docs/research/admin.md §4.3). Everything lives in the URL (`?estado=` or `parametro`,
 * `?q=`), so a filtered list can be shared or reloaded. Without JavaScript
 * the search box still works as a plain GET form.
 */
export function FiltrosLista({ ruta, filtros, actual, busqueda, buscarPor, extra, parametro = "estado" }: PropsFiltrosLista) {
  return (
    <div className="space-y-3">
      <BuscadorLista buscarPor={buscarPor} className="max-w-xl" />

      <nav
        aria-label="Filtrar"
        // pt-1/-mt-1: room for the hover lift, which the scrolling box would clip
        className="-mx-4 -mt-1 overflow-x-auto px-4 pt-1 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {filtros.map(({ valor, texto: etiqueta, cantidad }) => {
            const activo = valor === actual;
            return (
              <li key={valor}>
                <Link
                  href={href(ruta, parametro, valor, busqueda, extra)}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,translate] duration-200 motion-safe:hover:-translate-y-0.5",
                    activo
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {etiqueta}
                  <span className={cn("rounded-full px-1.5 text-xs font-semibold", activo ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>
                    {cantidad}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
