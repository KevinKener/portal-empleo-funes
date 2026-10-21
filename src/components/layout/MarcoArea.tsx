import type { ReactNode } from "react";
import { Encabezado } from "@/components/layout/Encabezado";
import type { VarianteNavegacion } from "@/components/layout/NavegacionArea";
import { PiePagina } from "@/components/layout/PiePagina";

/**
 * Shell of the private areas: same header and footer as the public site. The
 * area's navigation goes inside the header as tabs from md and as a bottom
 * bar below that (the page leaves room for it), so there is one bar only.
 */
export function MarcoArea({
  navegacion,
  children,
}: {
  navegacion?: (variante: VarianteNavegacion) => ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={navegacion ? "flex min-h-svh flex-col pb-[4.5rem] md:pb-0" : "flex min-h-svh flex-col"}>
      <Encabezado navegacion={navegacion?.("pestanias")} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
      {navegacion?.("barra")}
      <PiePagina />
    </div>
  );
}
