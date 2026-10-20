"use client";

import { ESTILO_CONTROL, type PropsControl } from "@/components/formularios/Campo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type OpcionSelector = { valor: string; texto: string };

type PropsSelector = {
  /** From Campo: ties the trigger to its label, hint and error. */
  control?: PropsControl;
  /** Form field name when there is no Campo around it. */
  name?: string;
  opciones: readonly OpcionSelector[];
  placeholder?: string;
  /** Controlled value ("" = nothing chosen). */
  valor?: string;
  /** Starting value for uncontrolled forms read with FormData. */
  inicial?: string | null;
  onCambiar?: (valor: string) => void;
  /** Runs when the list closes, like blur on a native select. */
  onSalir?: () => void;
  deshabilitado?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

/**
 * Reusable select on Base UI (shadcn `select`), replacing native selects so
 * every browser shows the same list (tutor review 2026-10-20). A hidden
 * input keeps it working with FormData; same size as the text inputs.
 */
export function Selector({
  control,
  name,
  opciones,
  placeholder = "Elegí una opción",
  valor,
  inicial,
  onCambiar,
  onSalir,
  deshabilitado,
  className,
  ...aria
}: PropsSelector) {
  const items = opciones.map((opcion) => ({ value: opcion.valor, label: opcion.texto }));

  return (
    <Select
      name={control?.name ?? name}
      items={items}
      value={valor === undefined ? undefined : valor || null}
      defaultValue={inicial || null}
      onValueChange={(nuevo) => onCambiar?.(typeof nuevo === "string" ? nuevo : "")}
      onOpenChange={(abierto) => {
        if (!abierto) onSalir?.();
      }}
      disabled={deshabilitado}
    >
      <SelectTrigger
        id={control?.id}
        aria-describedby={control?.["aria-describedby"]}
        aria-required={control?.["aria-required"]}
        aria-invalid={control?.["aria-invalid"] ?? aria["aria-invalid"]}
        aria-label={aria["aria-label"]}
        className={cn(ESTILO_CONTROL, "flex items-center justify-between gap-2 pr-3 text-left", className)}
      >
        <SelectValue placeholder={placeholder} className="truncate" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {opciones.map((opcion) => (
          <SelectItem key={opcion.valor} value={opcion.valor} className="min-h-11 px-3 text-base">
            {opcion.texto}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
