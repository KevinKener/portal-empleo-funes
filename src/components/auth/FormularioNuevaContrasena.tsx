"use client";

import { useActionState, useState, startTransition } from "react";
import Link from "next/link";
import { KeyRound, LoaderCircle } from "lucide-react";
import {
  cambiarContrasena,
  reenviarCodigoRecuperacion,
  type EstadoRecuperacion,
} from "@/app/(publico)/recuperar/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { ESTILO_CONTROL } from "@/components/formularios/Campo";
import { CampoContrasena } from "@/components/formularios/CampoContrasena";
import { buttonVariants } from "@/components/ui/button";
import { useCuentaRegresiva } from "@/hooks/useCuentaRegresiva";
import { CONTRASENA_MINIMA } from "@/lib/validaciones/auth";
import { cn } from "@/lib/utils";

const INICIAL: EstadoRecuperacion = { error: null, aviso: null };
const ESPERA_REENVIO = 60; // seconds, same as Supabase's resend interval

/**
 * Recovery step 2: code and new password in one form. The email is never
 * shown: the identifier may have been a DNI, and showing its email would
 * leak it.
 */
export function FormularioNuevaContrasena() {
  const [estado, ejecutar, enviando] = useActionState(cambiarContrasena, INICIAL);
  const [reenvio, reenviar, reenviando] = useActionState(reenviarCodigoRecuperacion, INICIAL);
  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const espera = useCuentaRegresiva(ESPERA_REENVIO);

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    formData.set("codigo", codigo);
    formData.set("contrasena", contrasena);
    startTransition(() => ejecutar(formData));
  }

  function pedirOtro() {
    espera.reiniciar();
    startTransition(() => reenviar());
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <KeyRound aria-hidden className="size-10 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Creá una contraseña nueva</h1>
        <p className="text-muted-foreground">
          Si hay una cuenta con esos datos, te mandamos un código al email registrado. Si no lo ves en unos minutos,
          buscalo en la carpeta de <strong className="text-foreground">spam</strong>.
        </p>
      </div>

      <form onSubmit={enviar} noValidate className="space-y-5">
        <AvisoFormulario error={estado.error ?? reenvio.error} aviso={reenvio.aviso} />
        <div className="space-y-1.5">
          <label htmlFor="codigo" className="block text-sm font-medium">
            Código del email
          </label>
          <input
            id="codigo"
            name="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6,10}"
            maxLength={12}
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value)}
            className={cn(ESTILO_CONTROL, "h-14 pr-3 text-center font-heading text-2xl tracking-[0.3em]")}
          />
        </div>
        <CampoContrasena
          nombre="contrasena"
          etiqueta="Contraseña nueva"
          ayuda={`Al menos ${CONTRASENA_MINIMA} caracteres. Una frase corta es más fácil de recordar.`}
          valor={contrasena}
          onCambiar={setContrasena}
          onSalir={() => {}}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={enviando}
          className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover" })}
        >
          {enviando && <LoaderCircle aria-hidden className="animate-spin" />}
          {enviando ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <p className="text-muted-foreground">¿No te llegó?</p>
        <button
          type="button"
          onClick={pedirOtro}
          disabled={espera.restantes > 0 || reenviando}
          className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {espera.restantes > 0 ? `Pedir otro código en ${espera.texto}` : "Pedir otro código"}
        </button>
        <p className="text-muted-foreground">
          ¿Usaste otros datos?{" "}
          <Link href="/recuperar" className="font-medium text-primary underline-offset-4 hover:underline">
            Empezá de nuevo
          </Link>
        </p>
      </div>
    </div>
  );
}
