import { Circle, CircleCheck } from "lucide-react";

type SeccionCv = { id: string; titulo: string; hecho: boolean };

/**
 * Side index of the CV page (from lg): jumps to each section and shows which
 * ones already have something, so a long page stays easy to move through.
 */
export function IndiceCv({ secciones }: { secciones: SeccionCv[] }) {
  return (
    <nav aria-label="Secciones del CV" className="hidden space-y-3 rounded-2xl border border-border bg-card p-4 lg:block">
      <div className="space-y-2 px-2">
        <p className="text-sm font-semibold">
          {secciones.filter((s) => s.hecho).length} de {secciones.length} secciones con datos
        </p>
        <span aria-hidden className="block h-1.5 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full origin-left rounded-full bg-primary motion-safe:animate-llenar-x"
            style={{ width: `${(secciones.filter((s) => s.hecho).length / secciones.length) * 100}%` }}
          />
        </span>
      </div>
      <ul className="space-y-0.5">
        {secciones.map(({ id, titulo, hecho }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {hecho ? (
                <CircleCheck aria-hidden className="size-4 shrink-0 text-primary" />
              ) : (
                <Circle aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              )}
              {titulo}
              <span className="sr-only">{hecho ? "(con datos)" : "(vacío)"}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
