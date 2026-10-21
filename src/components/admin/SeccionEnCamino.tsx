import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { buttonVariants } from "@/components/ui/button";

/**
 * Stand-in for an Admin section that arrives in a later branch
 * (docs/research/admin.md §5), so tabs and Bandeja links never 404.
 * Replaced by the real page in that branch.
 */
export function SeccionEnCamino({ titulo, descripcion, funciones }: { titulo: string; descripcion: string; funciones: ReactNode[] }) {
  return (
    <PaginaArea titulo={titulo} descripcion={descripcion}>
      <section className="flex flex-col gap-5 rounded-2xl border border-dashed border-border bg-card p-6 sm:flex-row sm:items-start sm:p-8">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Construction aria-hidden className="size-7" />
        </span>
        <div className="min-w-0 space-y-3">
          <h2 className="font-heading text-lg font-semibold">Estamos armando esta sección</h2>
          <p className="text-muted-foreground">Muy pronto vas a poder:</p>
          <ul className="list-disc space-y-1 pl-5 text-foreground/85 marker:text-primary">
            {funciones.map((funcion, i) => (
              <li key={i}>{funcion}</li>
            ))}
          </ul>
          <Link href="/admin" className={buttonVariants({ variant: "outline", className: "mt-2 h-10" })}>
            <ArrowLeft aria-hidden /> Volver a la bandeja
          </Link>
        </div>
      </section>
    </PaginaArea>
  );
}
