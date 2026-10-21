import type { EstadoOferta } from "@/lib/estados";
import { cn } from "@/lib/utils";

// In the Office's words: a pending offer is waiting for *them*
const ESTADOS: Record<Exclude<EstadoOferta, "borrador">, { texto: string; clase: string }> = {
  pendiente: { texto: "Por revisar", clase: "border-transparent bg-aviso-suave text-aviso" },
  publicada: { texto: "Publicada", clase: "border-transparent bg-primary text-primary-foreground" },
  rechazada: { texto: "Rechazada", clase: "border-destructive/30 bg-destructive/5 text-destructive" },
  cerrada: { texto: "Cerrada", clase: "border-border bg-muted text-muted-foreground" },
};

// Derived from fecha_cierre, not a status of its own (20261021150000_fecha_cierre_ofertas.sql)
const VENCIDA = { texto: "Vencida", clase: "border-border bg-muted text-foreground/80" };

/** Status badge of an offer for the Employment Office (drafts never reach it). */
export function EtiquetaOfertaAdmin({ estado, vencida = false }: { estado: EstadoOferta; vencida?: boolean }) {
  if (estado === "borrador") return null;
  const { texto, clase } = vencida ? VENCIDA : ESTADOS[estado];
  return <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", clase)}>{texto}</span>;
}
