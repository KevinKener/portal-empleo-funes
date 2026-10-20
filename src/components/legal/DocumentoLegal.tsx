import type { ReactNode } from "react";
import { Info } from "lucide-react";

export type SeccionLegal = { id: string; titulo: string; contenido: ReactNode };

/**
 * Layout of the legal pages: title, last update, a draft notice and the
 * sections with a side index from lg. The texts are a draft until the
 * Municipality's legal area reviews them.
 */
export function DocumentoLegal({
  titulo,
  actualizado,
  intro,
  secciones,
}: {
  titulo: string;
  actualizado: string;
  intro: ReactNode;
  secciones: SeccionLegal[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Secciones" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1 border-l border-border text-sm">
            {secciones.map(({ id, titulo: tituloSeccion }) => (
              <li key={id}>
                <a href={`#${id}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-muted-foreground hover:border-primary hover:text-foreground">
                  {tituloSeccion}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl space-y-8">
          <header className="space-y-3">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">{titulo}</h1>
            <p className="text-sm text-muted-foreground">Última actualización: {actualizado}</p>
            <p className="flex gap-2 rounded-xl border border-border bg-muted p-4 text-sm">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
              Versión preliminar: este texto está pendiente de revisión por el área legal de la Municipalidad de Funes.
            </p>
            <div className="text-lg text-muted-foreground">{intro}</div>
          </header>

          {secciones.map(({ id, titulo: tituloSeccion, contenido }, i) => (
            <section key={id} id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24 space-y-3">
              <h2 id={`${id}-titulo`} className="font-heading text-xl font-semibold">
                {i + 1}. {tituloSeccion}
              </h2>
              <div className="space-y-3 leading-relaxed text-foreground/90 [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">{contenido}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
