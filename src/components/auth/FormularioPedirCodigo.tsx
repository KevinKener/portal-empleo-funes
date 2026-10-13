"use client";

import { useActionState, useState, startTransition } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { pedirCodigo, type EstadoRecuperacion } from "@/app/(publico)/recuperar/actions";
import { AvisoFormulario } from "@/components/auth/AvisoFormulario";
import { CampoTexto } from "@/components/auth/CampoTexto";
import { buttonVariants } from "@/components/ui/button";

const INICIAL: EstadoRecuperacion = { error: null, aviso: null };

/** Recovery step 1: the same identifier used to sign in. */
export function FormularioPedirCodigo() {
  const [estado, ejecutar, enviando] = useActionState(pedirCodigo, INICIAL);
  const [identificador, setIdentificador] = useState("");

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    formData.set("identificador", identificador);
    startTransition(() => ejecutar(formData));
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <AvisoFormulario error={estado.error} />
      <CampoTexto
        nombre="identificador"
        etiqueta="DNI, CUIT o email"
        ayuda="El mismo que usás para ingresar. Te vamos a mandar un código al email de tu cuenta."
        valor={identificador}
        onCambiar={setIdentificador}
        onSalir={() => {}}
        autoComplete="username"
        maxLength={254}
      />
      <button
        type="submit"
        disabled={enviando}
        className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover" })}
      >
        {enviando && <LoaderCircle aria-hidden className="animate-spin" />}
        {enviando ? "Enviando…" : "Enviarme un código"}
      </button>
      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
        ¿Te acordaste?{" "}
        <Link href="/ingresar" className="font-medium text-primary underline-offset-4 hover:underline">
          Volver a ingresar
        </Link>
      </p>
    </form>
  );
}
