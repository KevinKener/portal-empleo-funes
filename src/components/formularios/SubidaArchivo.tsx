"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, FileText, LoaderCircle, Upload } from "lucide-react";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import { ARCHIVOS, aceptados, achicarImagen, conTipo, errorArchivo, rutaArchivo, type AccionesArchivo, type TipoArchivo } from "@/lib/archivos";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type PropsSubidaArchivo = {
  tipo: TipoArchivo;
  userId: string;
  etiqueta: string;
  /** Whether a file is already saved for this person. */
  cargado: boolean;
  /** Whether the saved file can be removed (not a verified proof of address). */
  eliminable?: boolean;
  /** The area's Server Actions that record, open and remove the file. */
  acciones: AccionesArchivo;
};

/**
 * Upload straight from the browser to Storage, then record it on the
 * server. No `capture` attribute: phones then offer both "take photo" and
 * "choose file" (GOV.UK File upload; docs/research/postulante-ux.md §2.4).
 */
export function SubidaArchivo({ tipo, userId, etiqueta, cargado, eliminable = false, acciones }: PropsSubidaArchivo) {
  const router = useRouter();
  const idInput = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const { bucket, tipos, formatos } = ARCHIVOS[tipo];

  async function subir(elegido: File) {
    const original = conTipo(tipo, elegido);
    setError(null);
    setAviso(null);
    const problema = errorArchivo(tipo, original);
    if (problema) return setError(problema);

    setSubiendo(true);
    try {
      const archivo = await achicarImagen(original);
      const ruta = rutaArchivo(tipo, userId, tipos[archivo.type]);
      const { error: errorSubida } = await createClient()
        .storage.from(bucket)
        .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
      if (errorSubida) throw errorSubida;

      const { error: errorRegistro } = await acciones.registrar(tipo, ruta);
      if (errorRegistro) return setError(errorRegistro);
      setAviso("¡Listo! Guardamos tu archivo.");
      router.refresh();
    } catch {
      setError("No pudimos subir el archivo. Probá de nuevo.");
    } finally {
      setSubiendo(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  function ver() {
    iniciar(async () => {
      const { url, error: errorUrl } = await acciones.abrir(tipo);
      if (url) window.open(url, "_blank", "noopener");
      else setError(errorUrl);
    });
  }

  function borrar() {
    iniciar(async () => {
      const { error: errorBorrado } = await acciones.eliminar(tipo);
      if (errorBorrado) return setError(errorBorrado);
      setAviso("Borramos el archivo.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <AvisoFormulario error={error} aviso={aviso} />

      {cargado && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary p-4 text-secondary-foreground">
          <CircleCheck aria-hidden className="size-5 shrink-0" />
          {/* min-w-40: on phones the buttons wrap below instead of squeezing the text word by word */}
          <p className="min-w-40 flex-1 text-sm font-medium">Ya subiste tu archivo.</p>
          <button type="button" onClick={ver} disabled={pendiente} className={buttonVariants({ variant: "outline", size: "lg" })}>
            <FileText aria-hidden />
            Ver
          </button>
          {eliminable && (
            <button
              type="button"
              onClick={borrar}
              disabled={pendiente}
              className={buttonVariants({ variant: "ghost", size: "lg", className: "text-destructive" })}
            >
              Borrar
            </button>
          )}
        </div>
      )}

      <label
        htmlFor={idInput}
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(evento) => {
          evento.preventDefault();
          setArrastrando(false);
          const archivo = evento.dataTransfer.files[0];
          if (archivo) void subir(archivo);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
          arrastrando ? "border-primary bg-accent" : "border-input hover:border-primary hover:bg-accent",
          subiendo && "pointer-events-none opacity-70",
        )}
      >
        {subiendo ? (
          <LoaderCircle aria-hidden className="size-8 animate-spin text-primary" />
        ) : (
          <Upload aria-hidden className="size-8 text-primary" />
        )}
        <span className="font-medium">{subiendo ? "Subiendo…" : cargado ? `Reemplazar ${etiqueta}` : `Subir ${etiqueta}`}</span>
        <span className="text-sm text-muted-foreground">
          {formatos}, hasta 5 MB.{tipo !== "arca" && " Desde el celular podés sacar una foto."}
        </span>
        <input
          ref={entrada}
          id={idInput}
          type="file"
          accept={aceptados(tipo)}
          disabled={subiendo}
          onChange={(evento) => {
            const archivo = evento.target.files?.[0];
            if (archivo) void subir(archivo);
          }}
          className="sr-only"
        />
      </label>
    </div>
  );
}
