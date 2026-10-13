"use client";

import { useActionState, useState, startTransition } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { ingresar, type EstadoIngreso } from "@/app/(publico)/ingresar/actions";
import { AvisoFormulario } from "@/components/auth/AvisoFormulario";
import { CampoContrasena } from "@/components/auth/CampoContrasena";
import { CampoTexto } from "@/components/auth/CampoTexto";
import { buttonVariants } from "@/components/ui/button";

const INICIAL: EstadoIngreso = { error: null };

/**
 * Sign-in form: one field that takes DNI, CUIT or email (resolved on the
 * server) and the password. `autocomplete` values let password managers
 * fill both fields (WCAG 3.3.8).
 */
export function FormularioIngreso({ siguiente }: { siguiente: string | null }) {
  const [estado, ejecutar, enviando] = useActionState(ingresar, INICIAL);
  const [identificador, setIdentificador] = useState("");
  const [contrasena, setContrasena] = useState("");

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    formData.set("identificador", identificador);
    formData.set("contrasena", contrasena);
    if (siguiente) formData.set("siguiente", siguiente);
    // Called by hand so React does not reset the form and wipe the identifier
    startTransition(() => ejecutar(formData));
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <AvisoFormulario error={estado.error} />

      <CampoTexto
        nombre="identificador"
        etiqueta="DNI, CUIT o email"
        ayuda="Postulantes: tu DNI. Empresas: el CUIT. También podés usar tu email."
        valor={identificador}
        onCambiar={setIdentificador}
        onSalir={() => {}}
        autoComplete="username"
        maxLength={254}
      />

      <div className="space-y-2">
        <CampoContrasena
          nombre="contrasena"
          etiqueta="Contraseña"
          valor={contrasena}
          onCambiar={setContrasena}
          onSalir={() => {}}
          autoComplete="current-password"
        />
        <Link href="/recuperar" className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover" })}
      >
        {enviando && <LoaderCircle aria-hidden className="animate-spin" />}
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>

      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
          Creá tu cuenta
        </Link>
      </p>
    </form>
  );
}
