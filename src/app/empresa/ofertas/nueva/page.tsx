import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FormularioOferta } from "@/components/empresa/FormularioOferta";
import { PasosOferta } from "@/components/empresa/PasosOferta";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { requerirRol } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { obtenerEmpresaActual } from "@/lib/ofertas-empresa";

export const metadata: Metadata = { title: "Nueva oferta" };

const VOLVER = { href: "/empresa/ofertas", texto: "Mis ofertas" };

/** New offer, saved as a draft. Only verified companies get here (Rule 3). */
export default async function NuevaOfertaPage() {
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  if (!empresa) notFound();
  if (empresa.estado !== "verificado") redirect(VOLVER.href);

  const categorias = await listarCategorias();
  return (
    <PaginaArea
      volver={VOLVER}
      titulo="Nueva oferta"
      descripcion="Se guarda como borrador. Después la revisás y la enviás a la Oficina de Empleo."
      aside={<PasosOferta />}
    >
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-6">
        <FormularioOferta categorias={categorias} volver={VOLVER.href} />
      </div>
    </PaginaArea>
  );
}
