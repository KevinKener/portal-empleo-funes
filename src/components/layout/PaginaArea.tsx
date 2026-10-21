import type { ReactNode } from "react";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";

export type Volver = { href: string; texto: string };

type PropsPaginaArea = {
  titulo: string;
  descripcion?: ReactNode;
  /** Back link for sub-pages; top-level sections have the area tabs instead. */
  volver?: Volver;
  /** Main action of the page, next to the title (e.g. "Nueva oferta"). */
  acciones?: ReactNode;
  /** Side column from lg: context, an index or the next steps. */
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * Page inside a private area: left-aligned title over the full width, and an
 * optional side column so wide screens are used (tutor review 2026-10-20)
 * while forms keep a comfortable reading width.
 */
export function PaginaArea({ titulo, descripcion, volver, acciones, aside, children }: PropsPaginaArea) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          {volver && <EnlaceVolver href={volver.href} texto={volver.texto} className="mb-1" />}
          <h1 className="font-heading text-3xl font-bold text-balance">{titulo}</h1>
          {descripcion && <div className="max-w-2xl text-muted-foreground">{descripcion}</div>}
        </div>
        {acciones && <div className="shrink-0">{acciones}</div>}
      </header>

      {aside ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-6">{children}</div>
          <aside className="space-y-4 lg:sticky lg:top-24">{aside}</aside>
        </div>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </div>
  );
}

/** Quiet side card for PaginaArea's aside: a heading and a few lines of context. */
export function NotaLateral({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-2xl border border-border bg-muted/50 p-5">
      <h2 className="font-heading font-semibold">{titulo}</h2>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
