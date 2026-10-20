import { MarcaRequerido } from "@/components/formularios/Campo";
import { Selector } from "@/components/formularios/Selector";
import { MESES } from "@/lib/formato";

const ANIO_ACTUAL = new Date().getFullYear();
const OPCIONES_MES = MESES.map((nombre, i) => ({ valor: String(i + 1), texto: nombre[0].toUpperCase() + nombre.slice(1) }));
const OPCIONES_ANIO = Array.from({ length: ANIO_ACTUAL - 1949 }, (_, i) => {
  const anio = String(ANIO_ACTUAL - i);
  return { valor: anio, texto: anio };
});

export type MesAnio = { mes: string; anio: string };

/** Month and year of a stored "YYYY-MM-DD" date, empty when there is none. */
export function mesAnioDe(fecha: string | null | undefined): MesAnio {
  if (!fecha) return { mes: "", anio: "" };
  const [anio, mes] = fecha.split("-");
  return { mes: String(Number(mes)), anio };
}

type PropsSelectorMesAnio = {
  prefijo: "desde" | "hasta";
  leyenda: string;
  valor: MesAnio;
  onCambiar: (valor: MesAnio) => void;
  error?: string;
  deshabilitado?: boolean;
  requerido?: boolean;
};

/**
 * Month + year as two selects (clearer than a date picker for people less
 * used to forms). Controlled, so the form can check the dates while they
 * are picked. Fields: `<prefijo>_mes`, `<prefijo>_anio`.
 */
export function SelectorMesAnio({ prefijo, leyenda, valor, onCambiar, error, deshabilitado, requerido }: PropsSelectorMesAnio) {
  const idError = `${prefijo}-error`;

  return (
    <fieldset className="space-y-1.5" disabled={deshabilitado} aria-describedby={error ? idError : undefined}>
      <legend className="text-sm font-medium">
        {leyenda}
        {requerido && !deshabilitado && <MarcaRequerido />}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        <Selector
          name={`${prefijo}_mes`}
          opciones={OPCIONES_MES}
          valor={valor.mes}
          onCambiar={(mes) => onCambiar({ ...valor, mes })}
          placeholder="Mes"
          deshabilitado={deshabilitado}
          aria-label={`${leyenda}: mes`}
          aria-invalid={Boolean(error)}
        />
        <Selector
          name={`${prefijo}_anio`}
          opciones={OPCIONES_ANIO}
          valor={valor.anio}
          onCambiar={(anio) => onCambiar({ ...valor, anio })}
          placeholder="Año"
          deshabilitado={deshabilitado}
          aria-label={`${leyenda}: año`}
          aria-invalid={Boolean(error)}
        />
      </div>
      {error && (
        <p id={idError} className="text-sm text-destructive motion-safe:animate-in motion-safe:fade-in">
          {error}
        </p>
      )}
    </fieldset>
  );
}
