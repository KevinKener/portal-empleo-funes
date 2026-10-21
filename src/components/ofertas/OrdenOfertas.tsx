import Link from "next/link";
import { Clock, Flame, Zap, type LucideIcon } from "lucide-react";
import { hrefOfertas, type OrdenOfertas as Orden } from "@/lib/validaciones/ofertas";
import { cn } from "@/lib/utils";

// `corto` fits three in a row on a 360 px phone
const OPCIONES: { orden: Orden; texto: string; corto: string; Icono: LucideIcon }[] = [
  { orden: "recientes", texto: "Más recientes", corto: "Recientes", Icono: Clock },
  { orden: "urgentes", texto: "Urgentes primero", corto: "Urgentes", Icono: Zap },
  { orden: "solicitadas", texto: "Más solicitadas", corto: "Solicitadas", Icono: Flame },
];

/**
 * Sort options for the offers listing as plain links (?orden=), like the
 * category chips: works without JavaScript and keeps the category. Going back
 * to page 1 on every change, since the order changes what each page holds.
 */
export function OrdenOfertas({ categoria, orden }: { categoria: string | null; orden: Orden }) {
  return (
    <nav aria-label="Ordenar ofertas" className="flex w-full items-center gap-2 sm:w-auto">
      <span className="hidden text-sm text-muted-foreground sm:inline">Ordenar:</span>
      <ul className="grid w-full grid-cols-3 gap-1 rounded-full border border-border bg-card p-1 sm:flex sm:w-auto">
        {OPCIONES.map(({ orden: opcion, texto, corto, Icono }) => {
          const activa = opcion === orden;
          return (
            <li key={opcion}>
              <Link
                href={hrefOfertas({ categoria, orden: opcion })}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center justify-center gap-1.5 rounded-full px-2 text-sm sm:px-3 font-medium whitespace-nowrap transition-colors duration-200",
                  activa ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-primary",
                )}
              >
                <Icono aria-hidden className="hidden size-4 shrink-0 min-[400px]:block" />
                <span className="sm:hidden">{corto}</span>
                <span className="hidden sm:inline">{texto}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
