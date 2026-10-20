import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { abrirArchivo, eliminarArchivo, registrarArchivo } from "@/app/empresa/archivos";
import { FormularioEmpresa } from "@/components/empresa/FormularioEmpresa";
import { SubidaArchivo } from "@/components/formularios/SubidaArchivo";
import { EncabezadoSeccion } from "@/components/postulante/EncabezadoSeccion";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { requerirRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi empresa" };

/** The company's own data and its optional ARCA certificate (Rule 12). */
export default async function DatosEmpresaPage() {
  const { userId } = await requerirRol("empresa");
  const supabase = await createClient();
  const [{ data: empresa }, { data: usuario }] = await Promise.all([
    supabase
      .from("empresas")
      .select("razon_social, cuit, nombre_comercial, telefono, direccion, constancia_arca_url, estado")
      .eq("perfil_id", userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!empresa) notFound();

  const { cuit, constancia_arca_url, estado, ...iniciales } = empresa;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EncabezadoSeccion
        volver={{ href: "/empresa", texto: "Inicio" }}
        titulo="Mi empresa"
        descripcion="Mantené tus datos al día para que la Oficina de Empleo pueda contactarte."
      />

      <TarjetaSeccion titulo="Datos de la empresa">
        <FormularioEmpresa iniciales={iniciales} cuit={cuit} email={usuario.user?.email ?? ""} verificada={estado === "verificado"} />
      </TarjetaSeccion>

      <TarjetaSeccion
        titulo="Constancia de inscripción en ARCA (opcional)"
        descripcion="No es obligatoria, pero ayuda a la Oficina de Empleo a verificar tu empresa más rápido. La descargás desde la web de ARCA con tu clave fiscal. Solo la ve la Oficina."
      >
        <SubidaArchivo
          tipo="arca"
          userId={userId}
          etiqueta="constancia"
          cargado={Boolean(constancia_arca_url)}
          eliminable
          acciones={{ registrar: registrarArchivo, abrir: abrirArchivo, eliminar: eliminarArchivo }}
        />
      </TarjetaSeccion>
    </div>
  );
}
