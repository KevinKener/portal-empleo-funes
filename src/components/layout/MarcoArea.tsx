import type { ReactNode } from "react";
import { Encabezado } from "@/components/layout/Encabezado";
import { PiePagina } from "@/components/layout/PiePagina";

/** Shell of the private areas: same header and footer as the public site. */
export function MarcoArea({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Encabezado />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">{children}</main>
      <PiePagina />
    </div>
  );
}
