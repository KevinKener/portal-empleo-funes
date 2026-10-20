"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle } from "lucide-react";
import { eliminarArchivo, registrarArchivo } from "@/app/postulante/archivos";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { buttonVariants } from "@/components/ui/button";
import { ARCHIVOS, errorFoto, recortarFoto, rutaArchivo } from "@/lib/archivos";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

type PropsFotoPerfil = {
  userId: string;
  nombre: string;
  apellido: string;
  localidad: string;
  /** Signed URL of the current photo, or null. */
  foto: string | null;
};

/**
 * Optional profile photo: the browser crops it to a centred square and
 * uploads it straight to Storage (same path as the CV and the proof of
 * address). Only the person and the Office see it, never companies.
 */
export function FotoPerfil({ userId, nombre, apellido, localidad, foto }: PropsFotoPerfil) {
  const router = useRouter();
  const idInput = useId();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [quitando, iniciar] = useTransition();

  async function subir(original: File) {
    setError(null);
    setAviso(null);
    const problema = errorFoto(original);
    if (problema) return setError(problema);

    setSubiendo(true);
    try {
      const archivo = await recortarFoto(original);
      const ruta = rutaArchivo("foto", userId, "jpg");
      const { error: errorSubida } = await createClient()
        .storage.from(ARCHIVOS.foto.bucket)
        .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
      if (errorSubida) throw errorSubida;

      const { error: errorRegistro } = await registrarArchivo("foto", ruta);
      if (errorRegistro) return setError(errorRegistro);
      setAviso("¡Listo! Ya tenés foto de perfil.");
      router.refresh();
    } catch {
      setError("No pudimos subir la foto. Probá de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  function quitar() {
    setError(null);
    setAviso(null);
    iniciar(async () => {
      const { error: errorBorrado } = await eliminarArchivo("foto");
      if (errorBorrado) return setError(errorBorrado);
      setAviso("Quitamos tu foto. Se van a ver tus iniciales.");
      router.refresh();
    });
  }

  const ocupado = subiendo || quitando;

  return (
    <section aria-label="Foto de perfil" className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Cover on the brand green, with the same moving background as the area homes */}
      <div className="relative isolate h-24 overflow-hidden bg-primary-deep">
        <FondoMarca compacto />
      </div>
      <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-12 flex items-end gap-4">
          <div className="relative rounded-full bg-card p-1 shadow-lg motion-safe:animate-entrada">
            <Avatar nombre={nombre} apellido={apellido} foto={foto} tamanio="lg" />
            {ocupado && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-card/70">
                <LoaderCircle aria-hidden className="size-8 animate-spin text-primary" />
              </span>
            )}
          </div>
          <div className="min-w-0 pb-1">
            <p className="truncate font-heading text-xl font-semibold">
              {nombre} {apellido}
            </p>
            <p className="text-muted-foreground">{localidad}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={idInput}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "cursor-pointer has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              ocupado && "pointer-events-none opacity-60",
            )}
          >
            <Camera aria-hidden />
            {subiendo ? "Subiendo…" : foto ? "Cambiar foto" : "Subir foto"}
            {/* No `capture`: phones offer both the camera and the gallery */}
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
          {foto && (
            <button
              type="button"
              onClick={quitar}
              disabled={ocupado}
              className={buttonVariants({ variant: "ghost", size: "lg", className: "text-destructive" })}
            >
              Quitar foto
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Opcional. La ven vos y la Oficina de Empleo; las empresas no.
        </p>
        <AvisoFormulario error={error} aviso={aviso} />
      </div>
    </section>
  );
}
