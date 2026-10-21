import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { hrefOfertas, type OrdenOfertas } from "@/lib/validaciones/ofertas";

type Props = {
  pagina: number;
  totalPaginas: number;
  categoria: string | null;
  orden: OrdenOfertas;
};

/** Previous/next links for the offers listing, keeping the category filter and the order. */
export function Paginacion({ pagina, totalPaginas, categoria, orden }: Props) {
  if (totalPaginas <= 1) return null;

  const clase = buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-4" });

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link href={hrefOfertas({ categoria, orden, pagina: pagina - 1 })} className={clase}>
          <ChevronLeft aria-hidden /> Anterior
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link href={hrefOfertas({ categoria, orden, pagina: pagina + 1 })} className={clase}>
          Siguiente <ChevronRight aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
