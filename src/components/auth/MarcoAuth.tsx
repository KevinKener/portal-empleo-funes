import type { CSSProperties, ReactNode } from "react";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { Escudo } from "@/components/layout/Escudo";
import { PasosCuenta } from "@/components/auth/PasosCuenta";

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
        <PasosCuenta pasos={PASOS} />
      </aside>

      <div className="mx-auto w-full max-w-lg lg:max-w-none lg:self-center">
        {/* 1.5px frame with a light circling it (borde-vivo), the card sits inside */}
        <div
          className="borde-vivo rounded-[1.1rem] p-[1.5px] shadow-2xl shadow-primary/[0.08] motion-safe:animate-entrada"
          style={{ "--retraso": "120ms" } as CSSProperties}
        >
          <div className="relative overflow-hidden rounded-2xl bg-card p-5 sm:p-8">
            {/* Soft brand glow in a corner, so the white card is not flat */}
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-secondary blur-3xl motion-safe:animate-luz" />
            <div className="relative">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
