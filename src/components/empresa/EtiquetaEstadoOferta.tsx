import { ESTADO_OFERTA_PARA_EMPRESA } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { EstadoOferta } from "@/lib/estados";

const ESTILOS: Record<EstadoOferta, string> = {
  borrador: "border-border bg-muted text-muted-foreground",
  pendiente: "border-transparent bg-secondary text-secondary-foreground",
  publicada: "border-transparent bg-primary text-primary-foreground",
  rechazada: "border-destructive/30 bg-destructive/5 text-destructive",
  cerrada: "border-border bg-card text-muted-foreground",
};

/** Status badge of an offer, in the company's words. */
export function EtiquetaEstadoOferta({ estado }: { estado: EstadoOferta }) {
  return (
    <span className={cn("w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium", ESTILOS[estado])}>
      {ESTADO_OFERTA_PARA_EMPRESA[estado].titulo}
    </span>
  );
}
