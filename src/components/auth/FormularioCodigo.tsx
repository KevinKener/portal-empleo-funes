"use client";

import { useActionState, useState, startTransition } from "react";
import Link from "next/link";
import { LoaderCircle, MailCheck } from "lucide-react";
import { reenviarCodigo, verificarCodigo, type EstadoCodigo } from "@/app/(publico)/registro/actions";
import { ESTILO_CONTROL, MarcaRequerido } from "@/components/formularios/Campo";
import { CuentaConfirmada } from "@/components/auth/CuentaConfirmada";
import { buttonVariants } from "@/components/ui/button";
import { useCuentaRegresiva } from "@/hooks/useCuentaRegresiva";
import { cn } from "@/lib/utils";

const ESPERA_REENVIO = 60; // seconds, same as Supabase's resend interval
const INICIAL: EstadoCodigo = { error: null, aviso: null, confirmada: false, rol: null };

/**
 * "Check your email" step: one field for the code (paste and
 * one-time-code autofill work, WCAG 3.3.8), resend with a countdown, and a
 * success state once the account is confirmed.
 */
export function FormularioCodigo({ email }: { email: string }) {
  const [estado, verificar, verificando] = useActionState(verificarCodigo, INICIAL);
  const [reenvio, reenviar, reenviando] = useActionState(reenviarCodigo, INICIAL);
  const [codigo, setCodigo] = useState("");
  const espera = useCuentaRegresiva(ESPERA_REENVIO);

  if (estado.confirmada) return <CuentaConfirmada rol={estado.rol} />;

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData();
    formData.set("codigo", codigo);
    startTransition(() => verificar(formData));
  }

  function pedirOtro() {
    espera.reiniciar();
    startTransition(() => reenviar());
  }

  const error = estado.error ?? reenvio.error;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <MailCheck aria-hidden className="size-10 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Revisá tu mail</h1>
        <p className="text-muted-foreground">
          Te mandamos un código de confirmación a <strong className="break-all text-foreground">{email}</strong>.
        </p>
        <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Si no lo ves en unos minutos, buscalo en la carpeta de <strong>spam</strong> o correo no deseado.
        </p>
      </div>

      <form onSubmit={enviar} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="codigo" className="block text-sm font-medium">
            Código de confirmación
            <MarcaRequerido />
          </label>
          <input
            aria-required
            id="codigo"
            name="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6,10}"
            maxLength={12}
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value)}
            aria-invalid={Boolean(estado.error)}
            aria-describedby={error ? "codigo-error" : undefined}
            className={cn(ESTILO_CONTROL, "h-14 pr-3 text-center font-heading text-2xl tracking-[0.3em]")}
          />
          {error && (
            <p id="codigo-error" role="alert" className="text-sm text-destructive motion-safe:animate-in motion-safe:fade-in">
              {error}
            </p>
          )}
          {reenvio.aviso && !error && (
            <p role="status" className="text-sm text-primary motion-safe:animate-in motion-safe:fade-in">
              {reenvio.aviso}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={verificando}
          className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover" })}
        >
          {verificando && <LoaderCircle aria-hidden className="animate-spin" />}
          {verificando ? "Confirmando…" : "Confirmar cuenta"}
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
          ¿El email está mal?{" "}
          <Link href="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
            Volvé a crear la cuenta
          </Link>{" "}
          con el email correcto.
        </p>
      </div>
    </div>
  );
}
