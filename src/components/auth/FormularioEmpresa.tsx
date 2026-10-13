"use client";

import { registrarEmpresa } from "@/app/(publico)/registro/actions";
import { CampoContrasena } from "@/components/auth/CampoContrasena";
import { CampoTexto } from "@/components/auth/CampoTexto";
import { MarcoPasos } from "@/components/auth/MarcoPasos";
import { useFormularioPorPasos, type Paso } from "@/hooks/useFormularioPorPasos";
import { CONTRASENA_MINIMA, type CampoEmpresa } from "@/lib/validaciones/auth";

const PASOS: readonly Paso<CampoEmpresa>[] = [
  { titulo: "Datos de la empresa", campos: ["razon_social", "cuit", "nombre_comercial"] },
  { titulo: "Contacto y acceso", campos: ["telefono", "direccion", "email", "contrasena"] },
];

/**
 * Company sign-up in two steps. The ARCA certificate is optional and is
 * uploaded later from the company profile (Rule 12).
 */
export function FormularioEmpresa() {
  const form = useFormularioPorPasos(PASOS, registrarEmpresa);

  return (
    <MarcoPasos
      paso={form.paso}
      total={form.total}
      titulo={form.titulo}
      direccion={form.direccion}
      tituloRef={form.tituloRef}
      mensaje={form.mensaje}
      enviando={form.enviando}
      esUltimo={form.esUltimo}
      textoEnviar="Crear cuenta de empresa"
      onAnterior={form.anterior}
      onEnviar={form.enviar}
    >
      {form.paso === 0 && (
        <>
          <CampoTexto
            {...form.campo("razon_social")}
            etiqueta="Razón social"
            ayuda="Como figura en ARCA (ex AFIP)."
            autoComplete="organization"
            maxLength={200}
          />
          <CampoTexto
            {...form.campo("cuit")}
            etiqueta="CUIT"
            ayuda="Con o sin guiones. Lo vas a usar para ingresar."
            inputMode="numeric"
            maxLength={13}
          />
          <CampoTexto
            {...form.campo("nombre_comercial")}
            etiqueta="Nombre comercial"
            ayuda="El nombre con el que la conocen. Es el que verán los postulantes."
            maxLength={200}
          />
        </>
      )}

      {form.paso === 1 && (
        <>
          <CampoTexto
            {...form.campo("telefono")}
            etiqueta="Teléfono"
            ayuda="Con característica, por ejemplo 341 555 1234."
            type="tel"
            autoComplete="tel"
            maxLength={30}
          />
          <CampoTexto
            {...form.campo("direccion")}
            etiqueta="Dirección"
            autoComplete="street-address"
            maxLength={200}
          />
          <CampoTexto
            {...form.campo("email")}
            etiqueta="Email"
            ayuda="Te vamos a mandar un código para confirmar la cuenta."
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
          />
          <CampoContrasena
            {...form.campo("contrasena")}
            etiqueta="Creá una contraseña"
            ayuda={`Al menos ${CONTRASENA_MINIMA} caracteres. Una frase corta es más fácil de recordar.`}
            autoComplete="new-password"
          />
        </>
      )}
    </MarcoPasos>
  );
}
