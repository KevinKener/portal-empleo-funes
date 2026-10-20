import type { CSSProperties, ReactNode } from "react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { Escudo } from "@/components/layout/Escudo";

// The real order of things, so numbering is information here, not decoration
const PASOS = [
  "Creás tu cuenta y completás tu perfil o tus ofertas.",
  "La Oficina de Empleo revisa cada postulación y cada oferta.",
  "Las personas preseleccionadas llegan a la empresa, que las entrevista.",
];

/**
 * Account screens (sign up, sign in, password recovery). The form keeps a
 * narrow, focused card (GOV.UK "Create accounts"); from lg it sits next to a
 * dark-green panel that says how the portal works, so the screen does not
 * look like a lost card in an empty page.
 */
export function MarcoAuth({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-12 lg:px-8 lg:py-10 xl:grid-cols-[minmax(0,1fr)_32rem]">
      <aside className="relative isolate hidden min-h-[34rem] overflow-hidden rounded-3xl bg-primary-deep p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <FondoMarca />
        <div className="space-y-4 motion-safe:animate-entrada">
          <Escudo className="size-12 text-primary-foreground" />
          <p className="max-w-md font-heading text-4xl leading-tight font-semibold text-balance">
            Trabajo en Funes, con la Municipalidad de tu lado.
          </p>
        </div>
        <ol className="space-y-5">
          {PASOS.map((paso, i) => (
            <li
              key={paso}
              className="flex gap-4 motion-safe:animate-entrada"
              style={{ "--retraso": `${200 + i * 120}ms` } as CSSProperties}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary-foreground/30 font-heading text-sm font-semibold">
                {i + 1}
              </span>
              <span className="pt-1 text-primary-foreground/85">{paso}</span>
            </li>
          ))}
        </ol>
      </aside>

      <div className="mx-auto w-full max-w-lg lg:max-w-none lg:self-center">
        <div
          className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/[0.05] motion-safe:animate-entrada sm:p-8"
          style={{ "--retraso": "120ms" } as CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
