import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, FilePen, FilePlus2, FileWarning, ListChecks, MessagesSquare, ShieldCheck, UserSearch, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PasoEmpresa, TipoPaso } from "@/lib/panel-empresa";
import { cn } from "@/lib/utils";

const ICONOS: Record<TipoPaso, LucideIcon> = {
  arca: ShieldCheck,
  confirmar: ListChecks,
  candidatos: UserSearch,
  entrevistas: MessagesSquare,
  rechazada: FileWarning,
  borrador: FilePen,
  primera: FilePlus2,
};

/**
 * "Tu próximo paso" of the company: the most useful step big, with the
 * number it is about, and the rest of what is pending as short links under
 * "También tenés", so nothing waits unseen.
 */
export function ProximoPasoEmpresa({ pasos }: { pasos: PasoEmpresa[] }) {
  const [paso, ...resto] = pasos;
  const Icono = ICONOS[paso.tipo];

  return (
    <section
      aria-labelledby="titulo-proximo-paso"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary via-card to-card shadow-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <span aria-hidden className="absolute -inset-1 rounded-2xl bg-primary/20 motion-safe:animate-resplandor" />
            <Icono aria-hidden className="relative size-6" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-primary">Tu próximo paso</p>
            <h2 id="titulo-proximo-paso" className="font-heading text-xl font-semibold text-balance sm:text-2xl">
              {paso.titulo}
            </h2>
            <p className="max-w-2xl text-muted-foreground">{paso.texto}</p>
            <Link
              href={paso.href}
              className={buttonVariants({ className: "group/accion mt-3 h-11 px-6 text-base shadow-md shadow-primary/20 hover:bg-primary-hover" })}
            >
              {paso.accion}
              <ArrowRight aria-hidden className="transition-transform group-hover/accion:translate-x-1" />
            </Link>
          </div>
        </div>

        {paso.numero !== undefined && (
          // The number the step is about, big: the first thing the eye catches
          <div aria-hidden className="hidden shrink-0 sm:block">
            <div className="relative flex size-28 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-dashed border-primary/25 motion-safe:animate-giro" />
              <span className="absolute inset-3 rounded-full bg-primary/10" />
              <span
                className="contador relative font-heading text-5xl font-bold text-primary"
                style={{ "--hasta": paso.numero, "--retraso": "200ms" } as CSSProperties}
              />
            </div>
          </div>
        )}
      </div>

      {resto.length > 0 && (
        <div className="border-t border-primary/10 bg-card/60 px-5 py-4 sm:px-6">
          <p className="mb-2 text-sm font-semibold text-foreground">También tenés</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {resto.map((otro) => {
              const IconoOtro = ICONOS[otro.tipo];
              return (
                <li key={otro.tipo}>
                  <Link
                    href={otro.href}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        otro.tipo === "rechazada" ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary",
                      )}
                    >
                      <IconoOtro aria-hidden className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{otro.titulo}</span>
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
