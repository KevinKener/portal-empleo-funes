import type { ReactNode } from "react";
import { Encabezado } from "@/components/layout/Encabezado";
import { PiePagina } from "@/components/layout/PiePagina";

/**
 * Shell of the private areas: same header and footer as the public site, plus
 * the area's own navigation when it has one (a bottom bar on phones, so the
 * page leaves room for it).
 */
export function MarcoArea({ navegacion, children }: { navegacion?: ReactNode; children: ReactNode }) {
  return (
    <div className={navegacion ? "flex min-h-svh flex-col pb-16 sm:pb-0" : "flex min-h-svh flex-col"}>
      <Encabezado />
      {navegacion}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">{children}</main>
      <PiePagina />
    </div>
  );
}
