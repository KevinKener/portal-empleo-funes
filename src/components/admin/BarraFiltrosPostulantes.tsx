import Link from "next/link";
import { Check, MapPin, Tags } from "lucide-react";
import { BuscadorLista } from "@/components/admin/BuscadorLista";
import { FiltroSelect } from "@/components/admin/FiltroSelect";
import type { OpcionSelector } from "@/components/formularios/Selector";
import { cn } from "@/lib/utils";

type PropsBarraFiltrosPostulantes = {
  localidades: OpcionSelector[];
  localidad: string | null;
  rubros: OpcionSelector[];
  rubro: string | null;
  soloVerificados: boolean;
  /** Same list with the verified filter switched. */
  hrefVerificados: string;
};

/**
 * The job seekers' filters as one bar the width of the table: search,
 * town, category and verified address as segments split by hairlines
 * (stacked on phones). One frame instead of four boxes reads as a single
 * tool and leaves no empty space inside the controls.
 */
export function BarraFiltrosPostulantes({ localidades, localidad, rubros, rubro, soloVerificados, hrefVerificados }: PropsBarraFiltrosPostulantes) {
  return (
    <div
      role="group"
      aria-label="Filtros"
      className="grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:divide-x lg:divide-y-0"
    >
      <BuscadorLista buscarPor="Buscar por nombre o DNI" enBarra />
      <FiltroSelect parametro="localidad" etiqueta="Localidad" todos="Todas las localidades" opciones={localidades} actual={localidad} icono={<MapPin />} />
      <FiltroSelect parametro="rubro" etiqueta="Rubro" todos="Todos los rubros" opciones={rubros} actual={rubro} icono={<Tags />} />
      <Link
        href={hrefVerificados}
        aria-pressed={soloVerificados}
        scroll={false}
        className={cn(
          "inline-flex h-12 items-center gap-2.5 px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:bg-accent/60 focus-visible:outline-none",
          soloVerificados ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-accent/60",
        )}
      >
        {/* A checkbox look: it is an on/off filter */}
        <span
          aria-hidden
          className={cn(
            "flex size-4.5 items-center justify-center rounded-[5px] border transition-colors",
            soloVerificados ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
          )}
        >
          {soloVerificados && <Check className="size-3" strokeWidth={3} />}
        </span>
        Domicilio verificado
      </Link>
    </div>
  );
}
