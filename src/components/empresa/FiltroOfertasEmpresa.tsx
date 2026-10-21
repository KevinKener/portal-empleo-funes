import Link from "next/link";
import { ESTADO_OFERTA_PARA_EMPRESA } from "@/lib/formato";
import { FILTROS_OFERTAS, type FiltroOfertas } from "@/lib/panel-empresa";
import { cn } from "@/lib/utils";

const PLURAL: Record<Exclude<FiltroOfertas, "todas">, string> = {
  publicada: "Publicadas",
  pendiente: ESTADO_OFERTA_PARA_EMPRESA.pendiente.titulo,
  borrador: "Borradores",
  rechazada: "Rechazadas",
  cerrada: "Cerradas",
};

/**
 * Status chips of "Mis ofertas" with their counts, as plain links
 * (?estado=). Statuses with no offers are left out so the row stays short.
 */
export function FiltroOfertasEmpresa({ conteo, actual }: { conteo: Record<FiltroOfertas, number>; actual: FiltroOfertas }) {
  const visibles = FILTROS_OFERTAS.filter((filtro) => filtro === "todas" || conteo[filtro] > 0);
  if (visibles.length <= 2) return null;

  return (
    <nav
      aria-label="Filtrar por estado"
      // pt-1/-mt-1: room for the hover lift, which the scrolling box would clip
      className="-mx-4 -mt-1 overflow-x-auto px-4 pt-1 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {visibles.map((filtro) => {
          const activo = filtro === actual;
          return (
            <li key={filtro}>
              <Link
                href={filtro === "todas" ? "/empresa/ofertas" : `/empresa/ofertas?estado=${filtro}`}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,translate] duration-200 motion-safe:hover:-translate-y-0.5",
                  activo
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
                  filtro === "rechazada" && !activo && "text-destructive",
                )}
              >
                {filtro === "todas" ? "Todas" : PLURAL[filtro]}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs font-semibold",
                    activo ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {conteo[filtro]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
