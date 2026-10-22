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
  /** Open the list below the field instead of over it (Base UI's default, macOS style), e.g. in a filter bar. */
  debajo?: boolean;
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
  debajo = false,
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
      <SelectContent
        alignItemWithTrigger={!debajo}
        align="start"
        // Below the field it reads as a menu: rounder, deeper shadow, the bar's text size
        className={cn("max-h-72", debajo && "max-h-80 rounded-xl p-1.5 shadow-xl")}
      >
        {opciones.map((opcion, i) => (
          <SelectItem
            key={opcion.valor}
            value={opcion.valor}
            className={cn(
              "min-h-11 px-3 text-base",
              debajo && "min-h-10 rounded-lg sm:text-sm",
              // The first option of a filter clears it ("Todos los rubros"): a hairline sets it apart
              debajo && i === 0 && "mb-1 after:absolute after:inset-x-2 after:-bottom-[3px] after:h-px after:bg-border",
            )}
          >
            {opcion.texto}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
