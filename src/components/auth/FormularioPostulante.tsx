"use client";

import { registrarPostulante } from "@/app/(publico)/registro/actions";
import { CampoContrasena } from "@/components/formularios/CampoContrasena";
import { CampoLocalidad } from "@/components/formularios/CampoLocalidad";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { MarcoPasos } from "@/components/auth/MarcoPasos";
import { useFormularioPorPasos, type Paso } from "@/hooks/useFormularioPorPasos";
import { CONTRASENA_MINIMA, type CampoPostulante } from "@/lib/validaciones/auth";

const PASOS: readonly Paso<CampoPostulante>[] = [
  { titulo: "Tus datos", campos: ["dni", "nombre", "apellido"] },
  { titulo: "Dónde vivís y cómo te contactamos", campos: ["localidad", "direccion", "telefono"] },
  { titulo: "Tu acceso", campos: ["email", "contrasena"] },
];

/** Job seeker sign-up in three short steps, submitted once at the end. */
export function FormularioPostulante() {
  const form = useFormularioPorPasos(PASOS, registrarPostulante);

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
      textoEnviar="Crear cuenta"
      onAnterior={form.anterior}
      onEnviar={form.enviar}
    >
      {form.paso === 0 && (
        <>
          <CampoTexto
            {...form.campo("dni")}
            etiqueta="DNI"
            ayuda="Con o sin puntos. Lo vas a usar para ingresar."
            inputMode="numeric"
            maxLength={12}
          />
          <CampoTexto {...form.campo("nombre")} etiqueta="Nombre" autoComplete="given-name" maxLength={100} />
          <CampoTexto {...form.campo("apellido")} etiqueta="Apellido" autoComplete="family-name" maxLength={100} />
        </>
      )}

      {form.paso === 1 && (
        <>
          <CampoLocalidad {...form.campo("localidad")} />
          <CampoTexto
            {...form.campo("direccion")}
            etiqueta="Dirección"
            ayuda="Calle y número. Más adelante vas a poder subir un comprobante de domicilio."
            autoComplete="street-address"
            maxLength={200}
          />
          <CampoTexto
            {...form.campo("telefono")}
            etiqueta="Teléfono celular"
            ayuda="Con característica, por ejemplo 341 555 1234."
            type="tel"
            autoComplete="tel"
            maxLength={30}
          />
        </>
      )}

      {form.paso === 2 && (
        <>
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
