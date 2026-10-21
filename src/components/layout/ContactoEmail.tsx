"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, Copy, ExternalLink, Mail } from "lucide-react";
import { OFICINA } from "@/lib/oficina";
import { cn } from "@/lib/utils";

const OPCION =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-popover-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

/**
 * The Office's email as a small menu instead of a bare mailto: link, which
 * does nothing on computers with no mail app set up: write from Gmail on the
 * web, open the person's own mail app, or copy the address.
 * `conCopiar={false}` where a separate copy button already sits next to it.
 */
export function ContactoEmail({ children, className, conCopiar = true }: { children: ReactNode; className?: string; conCopiar?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  // Close on a click outside or Escape, like any menu
  useEffect(() => {
    if (!abierto) return;
    const alTocarFuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", alTocarFuera);
    document.addEventListener("keydown", alTeclear);
    contenedor.current?.querySelector<HTMLElement>("[data-opcion]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", alTocarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(OFICINA.email);
      setCopiado(true);
      window.setTimeout(() => {
        setCopiado(false);
        setAbierto(false);
      }, 1500);
    } catch {
      // Clipboard blocked: the address is still on screen to copy by hand
    }
  }

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={() => setAbierto((valor) => !valor)}
        className={cn("cursor-pointer text-left", className)}
      >
        {children}
        <span className="sr-only"> (elegí cómo escribirles)</span>
      </button>

      {abierto && (
        <div
          id={idMenu}
          className="absolute top-full left-0 z-30 mt-2 w-64 rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/15 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
        >
          <a data-opcion href={OFICINA.emailGmail} target="_blank" rel="noopener noreferrer" onClick={() => setAbierto(false)} className={OPCION}>
            <ExternalLink aria-hidden className="size-4 shrink-0 text-primary" />
            Escribir desde Gmail
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          <a href={OFICINA.emailEnlace} onClick={() => setAbierto(false)} className={OPCION}>
            <Mail aria-hidden className="size-4 shrink-0 text-primary" />
            Abrir mi app de correo
          </a>
          {conCopiar && (
            <button type="button" onClick={copiar} className={OPCION}>
              {copiado ? <Check aria-hidden className="size-4 shrink-0 text-primary" /> : <Copy aria-hidden className="size-4 shrink-0 text-primary" />}
              {copiado ? "¡Copiado!" : "Copiar la dirección"}
            </button>
          )}
          <span aria-live="polite" className="sr-only">
            {copiado ? "Email copiado" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
