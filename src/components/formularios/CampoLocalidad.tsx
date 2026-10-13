import { Campo } from "@/components/formularios/Campo";
import type { PropsEstadoCampo } from "@/components/formularios/CampoTexto";
import { ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { LOCALIDADES } from "@/lib/validaciones/auth";

type PropsCampoLocalidad = PropsEstadoCampo & { ayuda?: string };

/**
 * Town select. Native select: on phones it opens the system picker, easier
 * than a custom list.
 */
export function CampoLocalidad({ nombre, valor, error, ayuda, onCambiar, onSalir }: PropsCampoLocalidad) {
  return (
    <Campo nombre={nombre} etiqueta="¿Dónde vivís?" ayuda={ayuda} error={error}>
      {(control) => (
        <select
          {...control}
          value={valor}
          onChange={(evento) => onCambiar(evento.target.value)}
          onBlur={onSalir}
        >
          <option value="" disabled>
            Elegí una opción
          </option>
          {LOCALIDADES.map((localidad) => (
            <option key={localidad} value={localidad}>
              {ETIQUETAS_LOCALIDAD[localidad]}
            </option>
          ))}
        </select>
      )}
    </Campo>
  );
}
