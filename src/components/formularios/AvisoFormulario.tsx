"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, X } from "lucide-react";

const DURACION = 4500; // ms on screen: enough to read a short confirmation

const suscribirse = () => () => {};

/**
 * Feedback of a form. Errors stay inline (role="alert"), right where the
 * person has to fix something. Confirmations float as a toast (role="status")
 * that leaves by itself, so saving does not push the form around: under the
 * header on phones (the bottom has the area bar and sticky save buttons),
 * at the bottom on desktop.
 */
export function AvisoFormulario({ error, aviso }: { error: string | null; aviso?: string | null }) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in"
      >
        {error}
      </p>
    );
  }
  return aviso ? <AvisoFlotante texto={aviso} /> : null;
}

function AvisoFlotante({ texto }: { texto: string }) {
  // Portals need the document: render nothing on the server and in the first client pass
  const enNavegador = useSyncExternalStore(suscribirse, () => true, () => false);
  const [cerrado, setCerrado] = useState<string | null>(null);

  useEffect(() => {
    const reloj = window.setTimeout(() => setCerrado(texto), DURACION);
    return () => window.clearTimeout(reloj);
  }, [texto]);

  if (!enNavegador || cerrado === texto) return null;

  return createPortal(
    <div
      role="status"
      className="fixed inset-x-4 top-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-primary-deep px-4 py-3 text-sm text-primary-foreground shadow-2xl shadow-black/25 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 md:top-auto md:bottom-6 md:motion-safe:slide-in-from-bottom-4"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
        <CircleCheck aria-hidden className="size-5" />
      </span>
      <p className="flex-1 font-medium">{texto}</p>
      <button
        type="button"
        onClick={() => setCerrado(texto)}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-primary-foreground/40 focus-visible:outline-none"
      >
        <X aria-hidden className="size-4" />
        <span className="sr-only">Cerrar aviso</span>
      </button>
    </div>,
    document.body,
  );
}
