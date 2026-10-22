import { BadgeCheck, FileClock, FileX, MapPin } from "lucide-react";
import type { EstadoVerificacion } from "@/lib/estados";
import { ETIQUETAS_LOCALIDAD } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

type PropsInsigniaDomicilio = {
  localidad: Enums<"localidad">;
  estado: EstadoVerificacion;
  tieneComprobante: boolean;
};

/**
 * The town and, for Funes residents, how their proof of address stands
 * (Rule 4): a badge, never a filter that hides anyone. Other towns are not
 * asked for a proof, so they only show the town.
 */
export function InsigniaDomicilio({ localidad, estado, tieneComprobante }: PropsInsigniaDomicilio) {
  const funes = localidad === "funes";
  const domicilio = !funes
    ? null
    : estado === "verificado"
      ? { Icono: BadgeCheck, texto: "Domicilio verificado", clase: "bg-secondary text-primary" }
      : estado === "rechazado"
        ? { Icono: FileX, texto: "Comprobante rechazado", clase: "bg-muted text-muted-foreground" }
        : tieneComprobante
          ? { Icono: FileClock, texto: "Comprobante por revisar", clase: "bg-muted text-muted-foreground" }
          : { Icono: FileClock, texto: "Sin comprobante", clase: "bg-muted text-muted-foreground" };

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
      <span className={cn("inline-flex items-center gap-1 whitespace-nowrap", funes && "font-medium")}>
        <MapPin aria-hidden className="size-3.5 text-muted-foreground" />
        {ETIQUETAS_LOCALIDAD[localidad]}
      </span>
      {domicilio && (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", domicilio.clase)}>
          <domicilio.Icono aria-hidden className="size-3.5" />
          {domicilio.texto}
        </span>
      )}
    </span>
  );
}
