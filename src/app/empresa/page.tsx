import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvisoEmpresaSinVerificar } from "@/components/empresa/AvisoEmpresaSinVerificar";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { obtenerEmpresaActual } from "@/lib/ofertas-empresa";

export const metadata: Metadata = { title: "Mi empresa" };

/** Company home. Pre-selected candidates arrive later in Phase 5. */
export default async function EmpresaPage() {
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);

  return (
    <PanelBienvenida
      saludo={empresa ? `¡Hola, ${empresa.nombre_comercial}!` : "¡Hola!"}
      descripcion="Desde acá vas a poder publicar ofertas y ver los candidatos que te preselecciona la Oficina de Empleo."
    >
      {empresa && <AvisoEmpresaSinVerificar estado={empresa.estado} />}
      <Link href="/empresa/ofertas" className={buttonVariants({ className: "h-11 px-5 text-base hover:bg-primary-hover" })}>
        Ver mis ofertas <ArrowRight aria-hidden />
      </Link>
    </PanelBienvenida>
  );
}
