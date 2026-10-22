import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  pagina: number;
  totalPaginas: number;
  /** URL of a page, keeping the list's filters (e.g. hrefOfertas for the public offers). */
  href: (pagina: number) => string;
};

/** Previous/next links for a paginated list. */
export function Paginacion({ pagina, totalPaginas, href }: Props) {
  if (totalPaginas <= 1) return null;

  const clase = buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-4" });

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link href={href(pagina - 1)} className={clase}>
          <ChevronLeft aria-hidden /> Anterior
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link href={href(pagina + 1)} className={clase}>
          Siguiente <ChevronRight aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
