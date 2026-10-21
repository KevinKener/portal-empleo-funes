import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, FileCheck2 } from "lucide-react";
import { abrirArchivo, eliminarArchivo, registrarArchivo } from "@/app/empresa/archivos";
import { FormularioEmpresa } from "@/components/empresa/FormularioEmpresa";
import { TarjetaLogo } from "@/components/empresa/TarjetaLogo";
import { SubidaArchivo } from "@/components/formularios/SubidaArchivo";
import { NotaLateral, PaginaArea } from "@/components/layout/PaginaArea";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { requerirRol } from "@/lib/auth";
import { urlLogo } from "@/lib/logo-empresa";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi empresa" };

/**
 * "Mi empresa": the company's card with its logo and status (same layout as
 * the job seeker's "Mi perfil"), its data and the optional ARCA certificate
 * (Rule 12).
 */
export default async function DatosEmpresaPage() {
  const { userId } = await requerirRol("empresa");
  const supabase = await createClient();
  const [{ data: empresa }, { data: usuario }] = await Promise.all([
    supabase
      .from("empresas")
      .select("razon_social, cuit, nombre_comercial, telefono, direccion, constancia_arca_url, estado, logo_url")
      .eq("perfil_id", userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!empresa) notFound();

  const { cuit, constancia_arca_url, estado, logo_url, ...iniciales } = empresa;
  const verificada = estado === "verificado";
  return (
    <PaginaArea titulo="Mi empresa" descripcion="Mantené tus datos al día para que la Oficina de Empleo pueda contactarte.">
      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <TarjetaLogo
            userId={userId}
            nombreComercial={iniciales.nombre_comercial}
            razonSocial={iniciales.razon_social}
            estado={estado}
            logo={urlLogo(logo_url)}
          />
          <QueVenLosPostulantes verificada={verificada} />
        </div>

        <div className="min-w-0 space-y-6">
          <TarjetaSeccion
            titulo="Datos de la empresa"
            descripcion="Cómo te contacta la Oficina de Empleo."
            icono={<Building2 className="size-5" />}
          >
            <FormularioEmpresa iniciales={iniciales} cuit={cuit} email={usuario.user?.email ?? ""} verificada={verificada} />
          </TarjetaSeccion>

          <TarjetaSeccion
            titulo="Constancia de ARCA"
            descripcion="Opcional. Ayuda a la Oficina de Empleo a verificar tu empresa más rápido. La descargás desde la web de ARCA con tu clave fiscal. Solo la ve la Oficina."
            icono={<FileCheck2 className="size-5" />}
            hecho={constancia_arca_url ? true : undefined}
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
      </div>
    </PaginaArea>
  );
}

/** What is public and what only the Office sees (public views never carry the CUIT, AGENTS.md §3). */
function QueVenLosPostulantes({ verificada }: { verificada: boolean }) {
  return (
    <NotaLateral titulo="¿Qué ven los postulantes?">
      <p>
        En tus ofertas publicadas aparecen tu nombre comercial y tu logo. El resto de tus datos y la constancia solo los ve
        la Oficina de Empleo.
      </p>
      {!verificada && <p>Mientras la Oficina verifica tu empresa, podés corregir la razón social si la cargaste mal.</p>}
    </NotaLateral>
  );
}
