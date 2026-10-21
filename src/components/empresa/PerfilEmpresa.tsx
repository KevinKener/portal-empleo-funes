import Link from "next/link";
import { ArrowRight, CircleCheck, Circle } from "lucide-react";
import { AnilloProgreso } from "@/components/postulante/AnilloProgreso";
import type { TareaPerfilEmpresa } from "@/lib/panel-empresa";
import { cn } from "@/lib/utils";

/**
 * "Perfil de tu empresa": a ring with what is done and the short list of
 * what is left, each one a link to where it is done (same idea as the job
 * seeker's "Completá tu perfil").
 */
export function PerfilEmpresa({ tareas }: { tareas: TareaPerfilEmpresa[] }) {
  const hechas = tareas.filter((t) => t.hecha).length;
  const completo = hechas === tareas.length;

  return (
    <section aria-labelledby="titulo-perfil-empresa" className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <AnilloProgreso hechas={hechas} total={tareas.length} />
        <div className="min-w-0">
          <h2 id="titulo-perfil-empresa" className="font-heading font-semibold">
            {completo ? "Tu perfil está completo" : "Completá tu perfil"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {completo ? "Los postulantes ven una empresa con todo en orden." : "Un perfil completo genera más confianza."}
          </p>
        </div>
      </div>
      <ul className="space-y-1">
        {tareas.map((tarea) => (
          <li key={tarea.clave}>
            <Link
              href={tarea.href}
              className={cn(
                "group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                tarea.hecha && "text-muted-foreground",
              )}
            >
              {tarea.hecha ? (
                <CircleCheck aria-hidden className="size-5 shrink-0 text-primary" />
              ) : (
                <Circle aria-hidden className="size-5 shrink-0 text-border" />
              )}
              <span className={cn("min-w-0 flex-1", tarea.hecha ? "line-through decoration-muted-foreground/40" : "font-medium")}>
                {tarea.texto}
                {tarea.opcional && <span className="font-normal text-muted-foreground"> (opcional)</span>}
                <span className="sr-only">{tarea.hecha ? " (hecho)" : " (pendiente)"}</span>
              </span>
              {!tarea.hecha && <ArrowRight aria-hidden className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
