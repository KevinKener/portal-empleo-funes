"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Campo } from "@/components/formularios/Campo";
import type { PropsEstadoCampo } from "@/components/formularios/CampoTexto";

type PropsCampoContrasena = PropsEstadoCampo & {
  etiqueta: string;
  ayuda?: string;
  autoComplete: "new-password" | "current-password";
};

/**
 * Password input with a show/hide toggle instead of a "repeat password"
 * field (WCAG 3.3.7). Paste stays allowed so password managers work
 * (WCAG 3.3.8).
 */
export function CampoContrasena({
  nombre,
  etiqueta,
  ayuda,
  valor,
  error,
  onCambiar,
  onSalir,
  autoComplete,
}: PropsCampoContrasena) {
  const [visible, setVisible] = useState(false);

  return (
    <Campo nombre={nombre} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      {(control) => (
        <>
          <input
            {...control}
            className={`${control.className} pr-12`}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            value={valor}
            onChange={(evento) => onCambiar(evento.target.value)}
            onBlur={onSalir}
          />
          <button
            type="button"
            onClick={() => setVisible((actual) => !actual)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña (se verá en pantalla)"}
            aria-pressed={visible}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        </>
      )}
    </Campo>
  );
}
