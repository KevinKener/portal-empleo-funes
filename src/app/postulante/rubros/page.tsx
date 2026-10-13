import type { Metadata } from "next";
import { EncabezadoSeccion } from "@/components/postulante/EncabezadoSeccion";
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
    <div className="mx-auto max-w-3xl space-y-6">
      <EncabezadoSeccion
        titulo="¿En qué te gustaría trabajar?"
        descripcion="Elegí todos los rubros que te interesen. La Oficina de Empleo los usa para encontrarte cuando aparece una oferta."
      />
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <SelectorRubros categorias={categorias} elegidas={(elegidas ?? []).map((fila) => fila.categoria_id)} />
      </div>
    </div>
  );
}
