import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import { Campo } from "@/components/auth/Campo";

export type PropsEstadoCampo = {
  nombre: string;
  valor: string;
  error?: string;
  valido?: boolean;
  onCambiar: (valor: string) => void;
  onSalir: () => void;
};

type PropsCampoTexto = PropsEstadoCampo & {
  etiqueta: string;
  ayuda?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "numeric" | "tel" | "email";
  autoComplete?: HTMLInputAutoCompleteAttribute;
  maxLength?: number;
};

/** Text input wired to a form state (see useFormularioPorPasos). */
export function CampoTexto({
  nombre,
  etiqueta,
  ayuda,
  valor,
  error,
  valido,
  onCambiar,
  onSalir,
  type = "text",
  ...props
}: PropsCampoTexto) {
  return (
    <Campo nombre={nombre} etiqueta={etiqueta} ayuda={ayuda} error={error} valido={valido}>
      {(control) => (
        <input
          {...control}
          {...props}
          type={type}
          value={valor}
          onChange={(evento) => onCambiar(evento.target.value)}
          onBlur={onSalir}
        />
      )}
    </Campo>
  );
}
