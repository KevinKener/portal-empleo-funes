import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotaLateral, PaginaArea } from "@/components/layout/PaginaArea";
import { VOLVER_A_MI_PERFIL } from "@/components/postulante/volver";
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
    <PaginaArea
      volver={VOLVER_A_MI_PERFIL}
      banda={{}}
      titulo="Tus datos"
      descripcion="Mantené tus datos al día para que la Oficina de Empleo pueda contactarte."
      aside={<QuienVeTusDatos />}
    >
      <div className="max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-6">
        <FormularioDatos iniciales={iniciales} dni={dni} email={usuario.user?.email ?? ""} />
      </div>
    </PaginaArea>
  );
}

/** Who sees what (Rule 1 and 20261020120000_candidatos_empresa.sql), so people know why each field matters. */
function QuienVeTusDatos() {
  return (
    <NotaLateral titulo="¿Quién ve tus datos?">
      <p>La Oficina de Empleo ve todo tu perfil para acompañarte en cada postulación.</p>
      <p>
        Una empresa solo ve tu nombre, tu localidad, tus rubros y tu CV cuando la Oficina te preselecciona para una de sus ofertas. Tu
        teléfono y tu email los ve recién cuando te elige para una entrevista.
      </p>
      <p>Tu DNI, tu dirección y tu comprobante de domicilio nunca llegan a las empresas.</p>
    </NotaLateral>
  );
}
