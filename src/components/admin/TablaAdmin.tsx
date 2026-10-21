import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ColumnaAdmin<T> = {
  titulo: string;
  celda: (fila: T) => ReactNode;
  /** Extra classes for the column's cells (width, alignment). */
  className?: string;
  /** Lower-priority columns only show on wide screens (xl). */
  secundaria?: boolean;
};

type PropsTablaAdmin<T> = {
  /** Read by screen readers as the table's caption. */
  titulo: string;
  filas: T[];
  clave: (fila: T) => string;
  columnas: ColumnaAdmin<T>[];
  /** The same row as a card, for screens below lg. */
  tarjeta: (fila: T) => ReactNode;
};

/**
 * Admin list: a real <table> from lg (sortable scanning, dates in their own
 * column, the action last) and the same rows as cards below that
 * (docs/research/admin.md §4.3). A row's main link can cover the whole row
 * with `after:absolute after:inset-0` (rows are positioned).
 */
export function TablaAdmin<T>({ titulo, filas, clave, columnas, tarjeta }: PropsTablaAdmin<T>) {
  return (
    <>
      <ul className="grid gap-3 lg:hidden">
        {filas.map((fila, i) => (
          <li key={clave(fila)} className="min-w-0 motion-safe:animate-entrada" style={{ "--retraso": `${Math.min(i, 8) * 50}ms` } as CSSProperties}>
            {tarjeta(fila)}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{titulo}</caption>
          <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
            <tr>
              {columnas.map((columna) => (
                <th key={columna.titulo} scope="col" className={cn("px-4 py-3 font-semibold", columna.secundaria && "hidden xl:table-cell", columna.className)}>
                  {columna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filas.map((fila) => (
              <tr key={clave(fila)} className="group relative transition-colors hover:bg-accent/60 has-[:focus-visible]:bg-accent/60">
                {columnas.map((columna) => (
                  <td key={columna.titulo} className={cn("h-14 px-4 py-2.5 align-middle", columna.secundaria && "hidden xl:table-cell", columna.className)}>
                    {columna.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
