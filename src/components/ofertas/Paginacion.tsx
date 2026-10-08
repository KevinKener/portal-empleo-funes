import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  pagina: number;
  totalPaginas: number;
  categoria: string | null;
};

function hrefPagina(pagina: number, categoria: string | null): string {
  const params = new URLSearchParams();
  if (categoria) params.set("categoria", categoria);
  if (pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/ofertas?${query}` : "/ofertas";
}

/** Previous/next links for the offers listing, keeping the category filter. */
export function Paginacion({ pagina, totalPaginas, categoria }: Props) {
  if (totalPaginas <= 1) return null;

  const clase = buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-4" });

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link href={hrefPagina(pagina - 1, categoria)} className={clase}>
          <ChevronLeft aria-hidden /> Anterior
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link href={hrefPagina(pagina + 1, categoria)} className={clase}>
          Siguiente <ChevronRight aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
