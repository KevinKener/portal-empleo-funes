import type { Metadata } from "next";
import { NotaLateral, PaginaArea } from "@/components/layout/PaginaArea";
import { VOLVER_A_MI_PERFIL } from "@/components/postulante/volver";
import { SelectorRubros } from "@/components/postulante/SelectorRubros";
import { requerirRol } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tus rubros" };

/** Categories the job seeker is interested in (Rule 5). */
export default async function RubrosPage() {
  await requerirRol("postulante");
  const supabase = await createClient();
  // RLS returns only the signed-in job seeker's categories
  const [categorias, { data: elegidas }] = await Promise.all([
    listarCategorias(),
    supabase.from("postulante_categorias").select("categoria_id"),
  ]);

  return (
    <PaginaArea
      volver={VOLVER_A_MI_PERFIL}
      banda={{}}
      titulo="¿En qué te gustaría trabajar?"
      descripcion="Elegí todos los rubros que te interesen. La Oficina de Empleo los usa para encontrarte cuando aparece una oferta."
      aside={
        <NotaLateral titulo="¿Para qué sirven?">
          <p>Con tus rubros te mostramos en tu panel las ofertas que van con vos, y la Oficina de Empleo te encuentra más rápido.</p>
          <p>No son obligatorios para postularte: podés postularte a cualquier oferta publicada.</p>
        </NotaLateral>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <SelectorRubros categorias={categorias} elegidas={(elegidas ?? []).map((fila) => fila.categoria_id)} />
      </div>
    </PaginaArea>
  );
}
