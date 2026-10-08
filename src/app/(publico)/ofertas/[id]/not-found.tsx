import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function OfertaNoEncontrada() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <SearchX aria-hidden className="size-10 text-muted-foreground" />
      <h1 className="font-heading text-2xl font-semibold">Esta oferta no está disponible</h1>
      <p className="text-muted-foreground">Puede que ya se haya cerrado o que el enlace no sea correcto.</p>
      <Link href="/ofertas" className={buttonVariants({ size: "lg", className: "h-10 px-5" })}>
        Ver ofertas publicadas
      </Link>
    </div>
  );
}
