import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, SearchX } from "lucide-react";
import type { OfertaParaVos } from "@/lib/panel-postulante";

/**
 * "Ofertas para vos": newest published offers in the job seeker's categories
 * they have not applied to yet. Hidden while they have no categories (the
 * next-step card asks for them first).
 */
export function OfertasParaVos({ ofertas }: { ofertas: OfertaParaVos[] }) {
  return (
    <section id="ofertas-para-vos" aria-labelledby="titulo-ofertas-para-vos" className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-1">
        <h2 id="titulo-ofertas-para-vos" className="font-heading text-xl font-semibold">
          Ofertas para vos
        </h2>
        <p className="text-sm text-muted-foreground">De tus rubros, a las que todavía no te postulaste.</p>
      </div>

      {ofertas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <SearchX aria-hidden className="size-9 text-muted-foreground" />
          <p className="font-medium">Por ahora no hay ofertas nuevas en tus rubros.</p>
          <p className="text-sm text-muted-foreground">Apenas se publique una, la vas a ver acá.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {ofertas.map((oferta) => (
            <li key={oferta.id}>
              <Link
                href={`/ofertas/${oferta.id}`}
                className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-[background-color,translate] duration-200 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:translate-x-1"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-[background-color,color,rotate] duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:-rotate-6">
                  <BriefcaseBusiness aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium group-hover:text-primary">{oferta.titulo}</span>
                    {oferta.nueva && (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        Nueva
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {[oferta.empresa, oferta.categoria].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/ofertas" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
        Ver todas las ofertas
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </section>
  );
}
