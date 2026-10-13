"use client";

import { LoaderCircle } from "lucide-react";
import { actualizarDatos } from "@/app/postulante/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { CampoLocalidad } from "@/components/formularios/CampoLocalidad";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { buttonVariants } from "@/components/ui/button";
import { useFormularioPorPasos, type Paso } from "@/hooks/useFormularioPorPasos";
import { CAMPOS_DATOS, type CampoDatos } from "@/lib/validaciones/auth";

const PASOS: readonly Paso<CampoDatos>[] = [{ titulo: "Tus datos", campos: CAMPOS_DATOS }];

type PropsFormularioDatos = {
  iniciales: Record<CampoDatos, string>;
  dni: string;
  email: string;
};

/**
 * Personal data editor. DNI and email are shown but fixed: the DNI only
 * changes through the Employment Office, and it is the sign-in identifier.
 */
export function FormularioDatos({ iniciales, dni, email }: PropsFormularioDatos) {
  const form = useFormularioPorPasos(PASOS, actualizarDatos, iniciales);

  return (
    <form onSubmit={form.enviar} noValidate className="space-y-5">
      <AvisoFormulario error={form.mensaje} aviso={form.aviso} />

      <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">DNI</dt>
          <dd className="font-medium">{dni}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate font-medium">{email}</dd>
        </div>
        <p className="text-muted-foreground sm:col-span-2">
          Para cambiar tu DNI, comunicate con la Oficina de Empleo.
        </p>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto {...form.campo("nombre")} etiqueta="Nombre" autoComplete="given-name" maxLength={100} />
        <CampoTexto {...form.campo("apellido")} etiqueta="Apellido" autoComplete="family-name" maxLength={100} />
      </div>
      <CampoLocalidad
        {...form.campo("localidad")}
        ayuda="Si vivís en Funes, la Oficina de Empleo prioriza tu perfil."
      />
      <CampoTexto
        {...form.campo("direccion")}
        etiqueta="Dirección"
        ayuda="Si la cambiás, la Oficina vuelve a revisar tu comprobante de domicilio."
        autoComplete="street-address"
        maxLength={200}
      />
      <CampoTexto
        {...form.campo("telefono")}
        etiqueta="Teléfono celular"
        type="tel"
        autoComplete="tel"
        maxLength={30}
      />

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
