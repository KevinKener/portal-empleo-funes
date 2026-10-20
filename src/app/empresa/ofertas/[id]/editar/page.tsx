import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FormularioOferta } from "@/components/empresa/FormularioOferta";
import { PasosOferta } from "@/components/empresa/PasosOferta";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { requerirRol } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { obtenerEmpresaActual, obtenerOfertaEmpresa } from "@/lib/ofertas-empresa";
import { esUuid } from "@/lib/validaciones/ofertas";

export const metadata: Metadata = { title: "Editar oferta" };

/** Edit a draft. Any other status goes back to the offer's page (Rule 9). */
export default async function EditarOfertaPage({ params }: PageProps<"/empresa/ofertas/[id]/editar">) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  if (!empresa) notFound();
  const [oferta, categorias] = await Promise.all([obtenerOfertaEmpresa(empresa.id, id), listarCategorias()]);
  if (!oferta) notFound();

  const volver = `/empresa/ofertas/${id}`;
  if (oferta.estado !== "borrador") redirect(volver);

  return (
    <PaginaArea
      volver={{ href: volver, texto: "Volver a la oferta" }}
      titulo="Editar oferta"
      descripcion="Podés cambiarla todas las veces que quieras mientras sea un borrador."
      aside={<PasosOferta />}
    >
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-6">
        <FormularioOferta categorias={categorias} oferta={oferta} volver={volver} />
      </div>
    </PaginaArea>
  );
}
