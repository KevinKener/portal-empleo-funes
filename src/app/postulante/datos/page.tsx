import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EncabezadoSeccion, VOLVER_A_MI_PERFIL } from "@/components/postulante/EncabezadoSeccion";
import { FormularioDatos } from "@/components/postulante/FormularioDatos";
import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tus datos" };

/** Personal data of the signed-in job seeker. */
export default async function DatosPage() {
  const { userId } = await requerirRol("postulante");
  const supabase = await createClient();
  const [{ data: postulante }, { data: usuario }] = await Promise.all([
    supabase
      .from("postulantes")
      .select("dni, nombre, apellido, localidad, direccion, telefono")
      .eq("perfil_id", userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!postulante) notFound();

  const { dni, ...iniciales } = postulante;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EncabezadoSeccion volver={VOLVER_A_MI_PERFIL} titulo="Tus datos" descripcion="Mantené tus datos al día para que la Oficina de Empleo pueda contactarte." />
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <FormularioDatos iniciales={iniciales} dni={dni} email={usuario.user?.email ?? ""} />
      </div>
    </div>
  );
}
