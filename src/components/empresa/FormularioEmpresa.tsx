"use client";

import { LoaderCircle } from "lucide-react";
import { actualizarDatosEmpresa } from "@/app/empresa/datos/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { buttonVariants } from "@/components/ui/button";
import { useFormularioPorPasos, type Paso } from "@/hooks/useFormularioPorPasos";
import { CAMPOS_DATOS_EMPRESA, type CampoDatosEmpresa } from "@/lib/validaciones/auth";

const PASOS_PENDIENTE: readonly Paso<CampoDatosEmpresa>[] = [{ titulo: "Datos de la empresa", campos: CAMPOS_DATOS_EMPRESA }];
const PASOS_VERIFICADA: readonly Paso<CampoDatosEmpresa>[] = [
  { titulo: "Datos de la empresa", campos: CAMPOS_DATOS_EMPRESA.filter((c) => c !== "razon_social") },
];

type PropsFormularioEmpresa = {
  iniciales: Record<CampoDatosEmpresa, string>;
  cuit: string;
  email: string;
  /** Once verified, the legal name is fixed like the CUIT. */
  verificada: boolean;
};

/** "XX-XXXXXXXX-X", how a CUIT is usually read. */
function formatearCuit(cuit: string) {
  return cuit.length === 11 ? `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}` : cuit;
}

/**
 * Company data editor. Fixed data (CUIT, email and, once verified, the legal
 * name) is shown apart, with who can change it.
 */
export function FormularioEmpresa({ iniciales, cuit, email, verificada }: PropsFormularioEmpresa) {
  const form = useFormularioPorPasos(verificada ? PASOS_VERIFICADA : PASOS_PENDIENTE, actualizarDatosEmpresa, iniciales);

  return (
    <form onSubmit={form.enviar} noValidate className="space-y-5">
      <AvisoFormulario error={form.mensaje} aviso={form.aviso} />

      <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">
        {verificada && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Razón social</dt>
            <dd className="font-medium">{iniciales.razon_social}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground">CUIT</dt>
          <dd className="font-medium">{formatearCuit(cuit)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate font-medium">{email}</dd>
        </div>
        <p className="text-muted-foreground sm:col-span-2">
          {verificada
            ? "Para cambiar la razón social o el CUIT, comunicate con la Oficina de Empleo."
            : "Para cambiar el CUIT, comunicate con la Oficina de Empleo."}
        </p>
      </dl>

      {!verificada && (
        <CampoTexto
          {...form.campo("razon_social")}
          etiqueta="Razón social"
          ayuda="Como figura en ARCA. Cuando la Oficina verifique tu empresa, ya no se puede cambiar desde acá."
          autoComplete="organization"
          maxLength={200}
        />
      )}
      <CampoTexto
        {...form.campo("nombre_comercial")}
        etiqueta="Nombre comercial"
        ayuda="Es el nombre que ven los postulantes en tus ofertas."
        maxLength={200}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto {...form.campo("telefono")} etiqueta="Teléfono" type="tel" autoComplete="tel" maxLength={30} />
        <CampoTexto {...form.campo("direccion")} etiqueta="Dirección" autoComplete="street-address" maxLength={200} />
      </div>

      <button
        type="submit"
        disabled={form.enviando}
        className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover sm:w-auto" })}
      >
        {form.enviando && <LoaderCircle aria-hidden className="animate-spin" />}
        {form.enviando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
