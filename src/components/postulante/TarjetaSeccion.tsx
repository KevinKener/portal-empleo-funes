import type { ReactNode } from "react";

/** A numbered card section of a profile page. */
export function TarjetaSeccion({ id, titulo, descripcion, children }: { id?: string; titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-titulo` : undefined} className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-1">
        <h2 id={id ? `${id}-titulo` : undefined} className="font-heading text-xl font-semibold">
          {titulo}
        </h2>
        {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}
