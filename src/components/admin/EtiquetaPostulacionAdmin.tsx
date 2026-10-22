import type { EstadoPostulacion, MotivoRechazoPostulacion } from "@/lib/estados";
import { cn } from "@/lib/utils";

const ESTADOS: Record<EstadoPostulacion | MotivoRechazoPostulacion, { texto: string; clase: string }> = {
  pendiente: { texto: "Por revisar", clase: "border-transparent bg-secondary text-secondary-foreground" },
  preseleccionado: { texto: "Preseleccionado", clase: "border-primary/30 bg-card text-primary" },
  entrevista: { texto: "En entrevista", clase: "border-primary/30 bg-card text-primary" },
  contratado: { texto: "Contratado", clase: "border-transparent bg-primary text-primary-foreground" },
  rechazado: { texto: "No seleccionado", clase: "border-border bg-muted text-muted-foreground" },
  cupo_completo: { texto: "Cupo completo", clase: "border-border bg-muted text-muted-foreground" },
  no_seleccionado: { texto: "No seleccionado", clase: "border-border bg-muted text-muted-foreground" },
};

/** Status badge of an application in the Office's words; rejections show their reason (Rule 10). */
export function EtiquetaPostulacionAdmin({ estado, motivo }: { estado: EstadoPostulacion; motivo: MotivoRechazoPostulacion | null }) {
  const { texto, clase } = ESTADOS[estado === "rechazado" && motivo ? motivo : estado];
  return <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", clase)}>{texto}</span>;
}
