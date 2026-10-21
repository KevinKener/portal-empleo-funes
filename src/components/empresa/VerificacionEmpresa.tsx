import { BadgeCheck, Check, Clock, UserPlus, XCircle, type LucideIcon } from "lucide-react";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

type Estado = Enums<"estado_verificacion">;

const TEXTO: Record<Estado, string> = {
  pendiente: "La Oficina de Empleo está revisando tus datos. Mientras tanto podés completar tu perfil; las ofertas se habilitan cuando te verifiquen.",
  verificado: "La Oficina de Empleo verificó tu empresa: ya podés publicar ofertas y recibir candidatos.",
  rechazado: "La Oficina de Empleo no pudo verificar tu empresa. Corregí tus datos o subí la constancia de ARCA y la vuelve a revisar.",
};

/**
 * The company's verification as three steps (Rule 3): signed up, in review,
 * verified. A rejection replaces the last step, in red, with what to do.
 */
export function VerificacionEmpresa({ estado, motivo }: { estado: Estado; motivo: string | null }) {
  const pasos: { texto: string; Icono: LucideIcon; hecho: boolean; actual: boolean; error?: boolean }[] = [
    { texto: "Registrada", Icono: UserPlus, hecho: true, actual: false },
    { texto: "En revisión", Icono: Clock, hecho: estado !== "pendiente", actual: estado === "pendiente" },
    estado === "rechazado"
      ? { texto: "No verificada", Icono: XCircle, hecho: false, actual: true, error: true }
      : { texto: "Verificada", Icono: BadgeCheck, hecho: estado === "verificado", actual: false },
  ];

  return (
    <section aria-labelledby="titulo-verificacion" className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-primary/[0.03] sm:p-6">
      <h2 id="titulo-verificacion" className="font-heading text-xl font-semibold">
        Verificación
      </h2>
      <ol className="flex items-start" aria-label="Estado de la verificación">
        {pasos.map(({ texto, Icono, hecho, actual, error }, i) => (
          <li key={texto} className="relative flex flex-1 flex-col items-center gap-2 text-center">
            {i < pasos.length - 1 && (
              <span aria-hidden className="absolute top-4 right-[calc(-50%+1.25rem)] left-[calc(50%+1.25rem)] h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border">
                {hecho && <span className="block size-full origin-left rounded-full bg-primary motion-safe:animate-llenar-x" />}
                {actual && <span className="block size-full tramo-en-curso" />}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full",
                error ? "bg-destructive text-primary-foreground" : hecho || actual ? "bg-primary text-primary-foreground" : "border-2 border-border bg-card text-muted-foreground/70",
              )}
            >
              {actual && !error && <span className="absolute -inset-1.5 rounded-full bg-primary/20 motion-safe:animate-resplandor" />}
              {hecho ? <Check className="relative size-4" /> : <Icono className="relative size-4" />}
            </span>
            <span className={cn("text-sm", error ? "font-semibold text-destructive" : actual ? "font-semibold text-primary" : hecho ? "text-foreground" : "text-muted-foreground")}>
              {texto}
              {actual && <span className="sr-only"> (estado actual)</span>}
            </span>
          </li>
        ))}
      </ol>
      <p className={cn("rounded-xl px-4 py-3 text-sm", estado === "rechazado" ? "bg-destructive/5 text-destructive" : "bg-secondary/60 text-foreground/85")}>
        {estado === "rechazado" && motivo && (
          <span className="mb-1 block">
            <span className="font-semibold">Motivo:</span> <span className="whitespace-pre-line">{motivo}</span>
          </span>
        )}
        {estado === "pendiente" && motivo ? "Recibimos tus correcciones: la Oficina de Empleo vuelve a revisar tu empresa." : TEXTO[estado]}
      </p>
    </section>
  );
}
