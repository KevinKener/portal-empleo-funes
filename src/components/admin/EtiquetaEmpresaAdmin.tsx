import type { EstadoVerificacion } from "@/lib/estados";
import { cn } from "@/lib/utils";

const ESTADOS: Record<EstadoVerificacion, { texto: string; clase: string }> = {
  pendiente: { texto: "Por verificar", clase: "border-transparent bg-aviso-suave text-aviso" },
  verificado: { texto: "Verificada", clase: "border-transparent bg-primary text-primary-foreground" },
  rechazado: { texto: "Rechazada", clase: "border-destructive/30 bg-destructive/5 text-destructive" },
};

/** Verification badge of a company, in the Office's words. */
export function EtiquetaEmpresaAdmin({ estado }: { estado: EstadoVerificacion }) {
  const { texto, clase } = ESTADOS[estado];
  return <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", clase)}>{texto}</span>;
}
