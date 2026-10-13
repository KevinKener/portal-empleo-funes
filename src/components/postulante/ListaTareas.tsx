import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { EstadoTarea, Tarea } from "@/lib/perfil-postulante";
import { cn } from "@/lib/utils";

// Short labels and quiet colors; red only for a real problem (GOV.UK task list).
const ESTADOS: Record<EstadoTarea, { texto: string; clase: string }> = {
  completo: { texto: "Completo", clase: "bg-secondary text-secondary-foreground" },
  pendiente: { texto: "Pendiente", clase: "bg-muted text-foreground" },
  opcional: { texto: "Opcional", clase: "bg-muted text-muted-foreground" },
  en_revision: { texto: "En revisión", clase: "bg-muted text-foreground" },
  rechazado: { texto: "Subí otro", clase: "bg-destructive/10 text-destructive" },
  proximamente: { texto: "Muy pronto", clase: "bg-muted text-muted-foreground" },
};

/** "Completá tu perfil": tasks in any order, each with an honest status. */
export function ListaTareas({ tareas }: { tareas: Tarea[] }) {
  const requeridas = tareas.filter((t) => t.requerida);
  const hechas = requeridas.filter((t) => t.estado === "completo").length;
  const listo = hechas === requeridas.length;

  return (
    <section aria-labelledby="titulo-perfil" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <h2 id="titulo-perfil" className="font-heading text-xl font-semibold">
          {listo ? "Tu perfil está listo para postularte" : "Completá tu perfil para postularte"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {hechas} de {requeridas.length} pasos completos
        </p>
        <div
          role="progressbar"
          aria-label="Progreso del perfil"
          aria-valuemin={0}
          aria-valuemax={requeridas.length}
          aria-valuenow={hechas}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${(hechas / requeridas.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-border">
        {tareas.map((tarea) => {
          const estado = ESTADOS[tarea.estado];
          const contenido = (
            <>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{tarea.titulo}</span>
                <span className="block text-sm text-muted-foreground">{tarea.descripcion}</span>
              </span>
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", estado.clase)}>
                {estado.texto}
              </span>
            </>
          );
          return (
            <li key={tarea.clave}>
              {tarea.estado === "proximamente" ? (
                // Not linked: the task cannot be started yet
                <div className="flex items-center gap-3 py-3 opacity-70">{contenido}</div>
              ) : (
                <Link
                  href={tarea.href}
                  className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {contenido}
                  <ChevronRight
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform motion-safe:group-hover:translate-x-0.5"
                  />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
