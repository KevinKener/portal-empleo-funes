import { Campo } from "@/components/formularios/Campo";
import type { PropsEstadoCampo } from "@/components/formularios/CampoTexto";
import { Selector } from "@/components/formularios/Selector";
import { ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { LOCALIDADES } from "@/lib/validaciones/auth";

type PropsCampoLocalidad = PropsEstadoCampo & { ayuda?: string };

const OPCIONES = LOCALIDADES.map((localidad) => ({ valor: localidad, texto: ETIQUETAS_LOCALIDAD[localidad] }));

/** Town select, wired to a form state (see useFormularioPorPasos). */
export function CampoLocalidad({ nombre, valor, error, ayuda, onCambiar, onSalir }: PropsCampoLocalidad) {
  return (
    <Campo nombre={nombre} etiqueta="¿Dónde vivís?" ayuda={ayuda} error={error} requerido>
      {(control) => <Selector control={control} opciones={OPCIONES} valor={valor} onCambiar={onCambiar} onSalir={onSalir} />}
    </Campo>
  );
}
