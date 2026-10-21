import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, CalendarDays, FileCheck2, Globe, type LucideIcon } from "lucide-react";
import { abrirArchivo, eliminarArchivo, registrarArchivo } from "@/app/empresa/archivos";
import { FormularioEmpresa } from "@/components/empresa/FormularioEmpresa";
import { PerfilEmpresa } from "@/components/empresa/PerfilEmpresa";
import { TarjetaLogo } from "@/components/empresa/TarjetaLogo";
import { VerificacionEmpresa } from "@/components/empresa/VerificacionEmpresa";
import { VistaPreviaEmpresa } from "@/components/empresa/VistaPreviaEmpresa";
import { SubidaArchivo } from "@/components/formularios/SubidaArchivo";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { requerirRol } from "@/lib/auth";
import { resumirCandidatosPorOferta } from "@/lib/candidatos-empresa";
import { formatearMesAnio } from "@/lib/formato";
import { urlLogo } from "@/lib/logo-empresa";
import { listarOfertasEmpresa } from "@/lib/ofertas-empresa";
import { resumirEmpresa, tareasPerfilEmpresa } from "@/lib/panel-empresa";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi empresa" };

/**
 * "Mi empresa": the company's card with its logo, profile checklist and a
 * preview of how job seekers see it (same layout as the job seeker's "Mi
 * perfil"); on the other side its verification, activity, data and the
 * optional ARCA certificate (Rule 12).
 */
export default async function DatosEmpresaPage() {
  const { userId } = await requerirRol("empresa");
  const supabase = await createClient();
  const [{ data: empresa }, { data: usuario }] = await Promise.all([
    supabase
      .from("empresas")
      .select("id, razon_social, cuit, nombre_comercial, telefono, direccion, constancia_arca_url, estado, logo_url, created_at, motivo_rechazo")
      .eq("perfil_id", userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!empresa) notFound();

  // Only the editable fields stay in `iniciales`, the form's starting values
  const { id: empresaId, cuit, constancia_arca_url, estado, logo_url, created_at, motivo_rechazo, ...iniciales } = empresa;
  const verificada = estado === "verificado";
  const logo = urlLogo(logo_url);
  const [ofertas, candidatos] = await Promise.all([listarOfertasEmpresa(empresaId), resumirCandidatosPorOferta()]);
  const resumen = resumirEmpresa(ofertas, candidatos);

  return (
    <PaginaArea titulo="Mi empresa" descripcion="Mantené tus datos al día para que la Oficina de Empleo pueda contactarte.">
      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <TarjetaLogo
            userId={userId}
            nombreComercial={iniciales.nombre_comercial}
            razonSocial={iniciales.razon_social}
            estado={estado}
            logo={logo}
          />
          <PerfilEmpresa tareas={tareasPerfilEmpresa({ logo_url, constancia_arca_url }, ofertas.length)} />
          <VistaPreviaEmpresa nombre={iniciales.nombre_comercial} logo={logo} />
        </div>

        <div className="min-w-0 space-y-6">
          <VerificacionEmpresa estado={estado} motivo={motivo_rechazo} />

          {/* The company's track in the portal, at a glance */}
          <ul aria-label="Tu actividad en el portal" className="grid gap-3 sm:grid-cols-3">
            <Actividad Icono={CalendarDays} valor={formatearMesAnio(created_at)} texto="En el portal desde" />
            <Actividad Icono={Globe} valor={String(resumen.publicada + resumen.cerrada)} texto={resumen.publicada + resumen.cerrada === 1 ? "Oferta publicada" : "Ofertas publicadas"} />
            <Actividad Icono={BadgeCheck} valor={String(resumen.contratados)} texto={resumen.contratados === 1 ? "Contratación" : "Contrataciones"} destacada={resumen.contratados > 0} />
          </ul>

          <TarjetaSeccion
            id="datos"
            titulo="Datos de la empresa"
            descripcion="Cómo te contacta la Oficina de Empleo."
            icono={<Building2 className="size-5" />}
          >
            <FormularioEmpresa iniciales={iniciales} cuit={cuit} email={usuario.user?.email ?? ""} verificada={verificada} />
          </TarjetaSeccion>

          <TarjetaSeccion
            id="arca"
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

function Actividad({ Icono, valor, texto, destacada = false }: { Icono: LucideIcon; valor: string; texto: string; destacada?: boolean }) {
  return (
    <li className={cn("flex items-center gap-3 rounded-2xl border p-4", destacada ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card")}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", destacada ? "bg-primary-foreground/15" : "bg-secondary text-primary")}>
        <Icono aria-hidden className="size-5" />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-xs", destacada ? "text-primary-foreground/80" : "text-muted-foreground")}>{texto}</span>
        <span className="block font-heading text-lg leading-tight font-bold capitalize">{valor}</span>
      </span>
    </li>
  );
}
