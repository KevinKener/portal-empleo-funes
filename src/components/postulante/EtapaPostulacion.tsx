import { CircleSlash, MessagesSquare, PartyPopper, Send, UserCheck, type LucideIcon } from "lucide-react";
import { textoEstadoPostulacion } from "@/lib/formato";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";

// Same icons as the tracker; hired is the only filled pill
const ETAPA: Record<MiPostulacion["estado"], { Icono: LucideIcon; clase: string }> = {
  pendiente: { Icono: Send, clase: "bg-muted text-foreground" },
  preseleccionado: { Icono: UserCheck, clase: "bg-secondary text-secondary-foreground" },
  entrevista: { Icono: MessagesSquare, clase: "bg-secondary text-secondary-foreground" },
  contratado: { Icono: PartyPopper, clase: "bg-primary text-primary-foreground" },
  rechazado: { Icono: CircleSlash, clase: "bg-muted text-muted-foreground" },
};

/** The stage of an application as a pill with its icon, in plain words. */
export function EtapaPostulacion({
  estado,
  motivo,
  className,
}: {
  estado: MiPostulacion["estado"];
  motivo: MiPostulacion["motivo_rechazo"];
  className?: string;
}) {
  const { Icono, clase } = ETAPA[estado];
  return (
    <span className={cn("inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", clase, className)}>
      <Icono aria-hidden className="size-3.5" />
      {textoEstadoPostulacion(estado, motivo).titulo}
    </span>
  );
}
