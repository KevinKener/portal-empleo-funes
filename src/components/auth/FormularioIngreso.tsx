"use client";

import { useActionState, useState, startTransition } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { ingresar, type EstadoIngreso } from "@/app/(publico)/ingresar/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { CampoContrasena } from "@/components/formularios/CampoContrasena";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { buttonVariants } from "@/components/ui/button";

const INICIAL: EstadoIngreso = { error: null };

// Fields arrive one after another once the card is in (animate-entrada)
const paso = (n: number) => ({ "--retraso": `${200 + n * 90}ms` }) as CSSProperties;

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

      <div className="motion-safe:animate-entrada" style={paso(1)}>
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
      </div>

      <div className="space-y-2 motion-safe:animate-entrada" style={paso(2)}>
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

      <div className="motion-safe:animate-entrada" style={paso(3)}>
        <button
          type="submit"
          disabled={enviando}
          className={buttonVariants({
            className: "group/ingresar relative h-12 w-full overflow-hidden px-6 text-base shadow-lg shadow-primary/25 hover:bg-primary-hover",
          })}
        >
          {/* A light crosses the button on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent opacity-0 group-hover/ingresar:opacity-100 motion-safe:group-hover/ingresar:animate-brillo"
          />
          {enviando ? <LoaderCircle aria-hidden className="animate-spin" /> : null}
          {enviando ? "Ingresando…" : "Ingresar"}
          {!enviando && <ArrowRight aria-hidden className="transition-transform group-hover/ingresar:translate-x-1" />}
        </button>
      </div>

      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground motion-safe:animate-entrada" style={paso(4)}>
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
          Creá tu cuenta
        </Link>
      </p>
    </form>
  );
}
