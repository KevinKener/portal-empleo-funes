"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Clock, ImageUp, LoaderCircle, Trash2, XCircle } from "lucide-react";
import { quitarLogo, registrarLogo } from "@/app/empresa/archivos";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { buttonVariants } from "@/components/ui/button";
import type { Enums } from "@/types/database";
import { BUCKET_LOGOS, errorLogo, prepararLogo, rutaLogo } from "@/lib/logo-empresa";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ESTADOS: Record<Enums<"estado_verificacion">, { texto: string; Icono: typeof BadgeCheck; clase: string }> = {
  verificado: { texto: "Verificada por la Oficina", Icono: BadgeCheck, clase: "bg-secondary text-secondary-foreground" },
  pendiente: { texto: "En revisión por la Oficina", Icono: Clock, clase: "bg-muted text-foreground" },
  rechazado: { texto: "No verificada", Icono: XCircle, clase: "bg-destructive/10 text-destructive" },
};

type PropsTarjetaLogo = {
  userId: string;
  nombreComercial: string;
  razonSocial: string;
  estado: Enums<"estado_verificacion">;
  /** Public URL of the current logo, or null. */
  logo: string | null;
};

/**
 * The company's card on "Mi empresa", with the same look as the job seeker's
 * photo card: brand cover, the logo (or the initial) on top, name and
 * verification status. The browser fits the logo into a white square and
 * uploads it straight to the public bucket; the action records it.
 */
export function TarjetaLogo({ userId, nombreComercial, razonSocial, estado, logo }: PropsTarjetaLogo) {
  const router = useRouter();
  const idInput = useId();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [quitando, iniciar] = useTransition();
  const { texto, Icono, clase } = ESTADOS[estado];

  async function subir(original: File) {
    setError(null);
    setAviso(null);
    const problema = errorLogo(original);
    if (problema) return setError(problema);

    setSubiendo(true);
    try {
      const archivo = await prepararLogo(original);
      const ruta = rutaLogo(userId);
      const { error: errorSubida } = await createClient()
        .storage.from(BUCKET_LOGOS)
        .upload(ruta, archivo, { contentType: archivo.type });
      if (errorSubida) throw errorSubida;

      const { error: errorRegistro } = await registrarLogo(ruta);
      if (errorRegistro) return setError(errorRegistro);
      setAviso("¡Listo! Tu logo ya se ve en tus ofertas.");
      router.refresh();
    } catch {
      setError("No pudimos subir el logo. Probá de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  function quitar() {
    setError(null);
    setAviso(null);
    iniciar(async () => {
      const { error: errorQuitar } = await quitarLogo();
      if (errorQuitar) return setError(errorQuitar);
      setAviso("Quitamos el logo. Se va a ver la inicial de tu empresa.");
      router.refresh();
    });
  }

  const ocupado = subiendo || quitando;

  return (
    <section aria-label="Logo de la empresa" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative isolate h-24 overflow-hidden bg-primary-deep">
        <FondoMarca compacto />
      </div>
      <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-12 flex items-end gap-4">
          <div className="relative rounded-3xl bg-card p-1 shadow-lg motion-safe:animate-entrada">
            <LogoEmpresa nombre={nombreComercial} logo={logo} tamanio="lg" />
            {ocupado && (
              <span className="absolute inset-1 flex items-center justify-center rounded-3xl bg-card/70">
                <LoaderCircle aria-hidden className="size-8 animate-spin text-primary" />
              </span>
            )}
          </div>
          <div className="min-w-0 pb-1">
            <p className="font-heading text-xl font-semibold">{nombreComercial}</p>
            <p className="truncate text-sm text-muted-foreground">{razonSocial}</p>
          </div>
        </div>

        <p className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", clase)}>
          <Icono aria-hidden className="size-4" />
          {texto}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={idInput}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "cursor-pointer has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              ocupado && "pointer-events-none opacity-60",
            )}
          >
            <ImageUp aria-hidden />
            {subiendo ? "Subiendo…" : logo ? "Cambiar logo" : "Subir logo"}
            <input
              id={idInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={ocupado}
              onChange={(evento) => {
                const archivo = evento.target.files?.[0];
                evento.target.value = "";
                if (archivo) void subir(archivo);
              }}
              className="sr-only"
            />
          </label>
          {logo && (
            <button
              type="button"
              onClick={quitar}
              disabled={ocupado}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive",
              })}
            >
              <Trash2 aria-hidden />
              Quitar logo
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Opcional. Se ve en tus ofertas del portal. Si no subís uno, se muestra la inicial de tu empresa.
        </p>
        <AvisoFormulario error={error} aviso={aviso} />
      </div>
    </section>
  );
}
