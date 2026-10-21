import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronRight, FileText, House, Tags, UserRound, type LucideIcon } from "lucide-react";
import { AnilloProgreso } from "@/components/postulante/AnilloProgreso";
import type { EstadoTarea, Tarea } from "@/lib/perfil-postulante";
import { cn } from "@/lib/utils";

// Short labels and quiet colors; red only for a real problem (GOV.UK task list).
const ESTADOS: Record<EstadoTarea, { texto: string; clase: string }> = {
  completo: { texto: "Completo", clase: "bg-secondary text-secondary-foreground" },
  pendiente: { texto: "Pendiente", clase: "bg-muted text-foreground" },
  opcional: { texto: "Opcional", clase: "bg-muted text-muted-foreground" },
  en_revision: { texto: "En revisión", clase: "bg-muted text-foreground" },
  rechazado: { texto: "Subí otro", clase: "bg-destructive/10 text-destructive" },
};

const ICONOS: Record<Tarea["clave"], LucideIcon> = { datos: UserRound, rubros: Tags, cv: FileText, domicilio: House };

/**
 * "Completá tu perfil": tasks in any order, each with an honest status,
 * joined by a line that fills as they get done.
 */
export function ListaTareas({ tareas }: { tareas: Tarea[] }) {
  const requeridas = tareas.filter((t) => t.requerida);
  const hechas = requeridas.filter((t) => t.estado === "completo").length;
  const listo = hechas === requeridas.length;

  return (
    <section aria-labelledby="titulo-perfil" className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <AnilloProgreso hechas={hechas} total={requeridas.length} />
        <div className="space-y-1">
          <h2 id="titulo-perfil" className="font-heading text-xl font-semibold">
            {listo ? "Tu perfil está listo para postularte" : "Completá tu perfil para postularte"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hechas} de {requeridas.length} pasos necesarios completos
          </p>
        </div>
      </div>

      <ul className="relative">
        {tareas.map((tarea, i) => {
          const estado = ESTADOS[tarea.estado];
          const Icono = ICONOS[tarea.clave];
          const completa = tarea.estado === "completo";
          return (
            <li key={tarea.clave} className="relative">
              {/* Line to the next task, green once this one is done */}
              {i < tareas.length - 1 && (
                <span aria-hidden className="absolute top-12 -bottom-2 left-[1.375rem] w-0.5 overflow-hidden rounded-full bg-border">
                  {completa && (
                    <span
                      className="block size-full origin-top bg-primary motion-safe:animate-llenar-y"
                      style={{ "--retraso": `${300 + i * 200}ms` } as CSSProperties}
                    />
                  )}
                </span>
              )}
              <Link
                href={tarea.href}
                className="group flex items-center gap-4 rounded-xl py-2.5 pr-2 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-xl border-2 transition-[background-color,border-color,color,scale] duration-300 motion-safe:group-hover:scale-105",
                    completa
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground group-hover:border-primary group-hover:text-primary",
                  )}
                >
                  <Icono aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{tarea.titulo}</span>
                  <span className="block text-sm text-muted-foreground">{tarea.descripcion}</span>
                  {/* Phones: status under the text, so the text keeps the width */}
                  <span className={cn("mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium sm:hidden", estado.clase)}>
                    {estado.texto}
                  </span>
                </span>
                <span className={cn("hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block", estado.clase)}>
                  {estado.texto}
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform motion-safe:group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
