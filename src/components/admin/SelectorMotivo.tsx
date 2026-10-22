import type { MotivoRechazoPostulacion } from "@/lib/estados";
import { cn } from "@/lib/utils";

/** What each reason means for the job seeker, so the Office picks knowing how it reads (Rule 10). */
export const MOTIVOS_RECHAZO: { valor: MotivoRechazoPostulacion; texto: string; detalle: string }[] = [
  { valor: "no_seleccionado", texto: "No seleccionado", detalle: "El perfil no encaja con esta búsqueda." },
  { valor: "cupo_completo", texto: "Cupo completo", detalle: "Se cubrieron los puestos. La persona lo lee de forma más suave." },
];

/** The two rejection reasons as radio cards. Controlled: the parent keeps the choice. */
export function SelectorMotivo({ valor, onCambiar, nombre }: { valor: MotivoRechazoPostulacion | null; onCambiar: (motivo: MotivoRechazoPostulacion) => void; nombre: string }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">
        Motivo <span className="text-destructive">*</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {MOTIVOS_RECHAZO.map((motivo) => (
          <label
            key={motivo.valor}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border bg-card p-3 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              valor === motivo.valor ? "border-destructive bg-destructive/5" : "border-border hover:border-destructive/40",
            )}
          >
            <input
              type="radio"
              name={nombre}
              value={motivo.valor}
              checked={valor === motivo.valor}
              onChange={() => onCambiar(motivo.valor)}
              required
              className="mt-0.5 size-4 accent-destructive"
            />
            <span>
              <span className="block font-semibold">{motivo.texto}</span>
              <span className="text-muted-foreground">{motivo.detalle}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
