import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ColumnaAdmin<T> = {
  titulo: string;
  celda: (fila: T) => ReactNode;
  /** Extra classes for the column's cells (width, alignment). */
  className?: string;
  /** Lower-priority columns only show on wide screens (xl). */
  secundaria?: boolean;
  /** Figures: right-aligned so digits line up. */
  numerica?: boolean;
  /** The `?orden=` value this column sorts by; the header becomes a link. */
  orden?: string;
};

export type OrdenTabla = {
  actual: string;
  /** URL of the list sorted by `valor`, keeping its filters. */
  href: (valor: string) => string;
};

type PropsTablaAdmin<T> = {
  /** Read by screen readers as the table's caption. */
  titulo: string;
  filas: T[];
  clave: (fila: T) => string;
  columnas: ColumnaAdmin<T>[];
  /** The same row as a card, for screens below lg. */
  tarjeta: (fila: T) => ReactNode;
  /** Sortable headers (each column's `orden`). */
  orden?: OrdenTabla;
  /** Bottom strip inside the table's frame: counts, pagination. */
  pie?: ReactNode;
};

/**
 * Admin list: a real <table> from lg and the same rows as cards below that
 * (docs/research/admin.md §4.3). The header sticks under the site header
 * while scrolling, sortable columns are links with an arrow (aria-sort), and
 * figures line up with tabular digits. A row's main link can cover the whole
 * row with `after:absolute after:inset-0` (rows are positioned).
 */
export function TablaAdmin<T>({ titulo, filas, clave, columnas, tarjeta, orden, pie }: PropsTablaAdmin<T>) {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        <ul className="grid gap-3">
          {filas.map((fila, i) => (
            <li key={clave(fila)} className="min-w-0 motion-safe:animate-entrada" style={{ "--retraso": `${Math.min(i, 8) * 50}ms` } as CSSProperties}>
              {tarjeta(fila)}
            </li>
          ))}
        </ul>
        {pie}
      </div>

      {/* overflow-clip (not hidden) rounds the corners without breaking the sticky header */}
      <div className="hidden overflow-clip rounded-2xl border border-border bg-card shadow-sm lg:block">
        <table className="w-full text-left text-sm tabular-nums">
          <caption className="sr-only">{titulo}</caption>
          <thead className="text-xs font-semibold text-muted-foreground">
            <tr>
              {columnas.map((columna) => {
                const activa = orden && columna.orden === orden.actual;
                return (
                  <th
                    key={columna.titulo}
                    scope="col"
                    aria-sort={columna.orden && orden ? (activa ? "descending" : "none") : undefined}
                    className={cn(
                      // Sticks below the site header (h-16)
                      "sticky top-16 z-[15] h-11 border-b border-border bg-muted/90 px-4 font-semibold whitespace-nowrap backdrop-blur",
                      columna.secundaria && "hidden xl:table-cell",
                      columna.numerica && "text-right",
                      columna.className,
                    )}
                  >
                    {columna.orden && orden ? (
                      <Link
                        href={orden.href(columna.orden)}
                        scroll={false}
                        className={cn(
                          "group/orden -mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-accent hover:text-foreground",
                          activa && "text-foreground",
                        )}
                      >
                        {columna.titulo}
                        {activa ? (
                          <ArrowDown aria-hidden className="size-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown aria-hidden className="size-3.5 opacity-40 transition-opacity group-hover/orden:opacity-100" />
                        )}
                      </Link>
                    ) : (
                      columna.titulo
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filas.map((fila) => (
              <tr key={clave(fila)} className="group relative transition-colors hover:bg-accent/60 has-[:focus-visible]:bg-accent/60">
                {columnas.map((columna) => (
                  <td
                    key={columna.titulo}
                    className={cn(
                      "h-14 px-4 py-2.5 align-middle",
                      columna.secundaria && "hidden xl:table-cell",
                      columna.numerica && "text-right",
                      columna.className,
                    )}
                  >
                    {columna.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {pie && <div className="border-t border-border bg-muted/40 px-4 py-2.5">{pie}</div>}
      </div>
    </>
  );
}
