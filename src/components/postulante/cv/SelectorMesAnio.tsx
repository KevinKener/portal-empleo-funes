import { ESTILO_CONTROL } from "@/components/formularios/Campo";
import { MESES } from "@/lib/formato";
import { cn } from "@/lib/utils";

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 1949 }, (_, i) => ANIO_ACTUAL - i);

type PropsSelectorMesAnio = {
  prefijo: "desde" | "hasta";
  leyenda: string;
  /** "YYYY-MM-DD" when editing. */
  inicial: string | null;
  error?: string;
  deshabilitado?: boolean;
};

/**
 * Month + year as two native selects: works the same in every browser
 * (type="month" has no picker on desktop Firefox) and is clear for people
 * less used to forms.
 */
export function SelectorMesAnio({ prefijo, leyenda, inicial, error, deshabilitado }: PropsSelectorMesAnio) {
  const [anio, mes] = inicial ? inicial.split("-") : ["", ""];
  const idError = `${prefijo}-error`;

  return (
    <fieldset className="space-y-1.5" disabled={deshabilitado} aria-describedby={error ? idError : undefined}>
      <legend className="text-sm font-medium">{leyenda}</legend>
      <div className="grid grid-cols-2 gap-2">
        <select
          name={`${prefijo}_mes`}
          defaultValue={mes ? String(Number(mes)) : ""}
          aria-label={`${leyenda}: mes`}
          aria-invalid={Boolean(error)}
          className={cn(ESTILO_CONTROL, "pr-3")}
        >
          <option value="">Mes</option>
          {MESES.map((nombre, i) => (
            <option key={nombre} value={i + 1}>
              {nombre[0].toUpperCase() + nombre.slice(1)}
            </option>
          ))}
        </select>
        <select
          name={`${prefijo}_anio`}
          defaultValue={anio}
          aria-label={`${leyenda}: año`}
          aria-invalid={Boolean(error)}
          className={cn(ESTILO_CONTROL, "pr-3")}
        >
          <option value="">Año</option>
          {ANIOS.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={idError} className="text-sm text-destructive motion-safe:animate-in motion-safe:fade-in">
          {error}
        </p>
      )}
    </fieldset>
  );
}
