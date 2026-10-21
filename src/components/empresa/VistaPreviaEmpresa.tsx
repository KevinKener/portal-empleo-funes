import { ArrowRight, Clock, Eye } from "lucide-react";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";

/**
 * "Así te ven los postulantes": a small offer card with the company's real
 * name and logo, as it shows on the portal. Only the trade name and logo are
 * public; CUIT, legal name, phone and address never are (AGENTS.md §3).
 */
export function VistaPreviaEmpresa({ nombre, logo }: { nombre: string; logo: string | null }) {
  return (
    <section aria-labelledby="titulo-vista-previa" className="space-y-3 rounded-2xl border border-border bg-muted/50 p-5">
      <h2 id="titulo-vista-previa" className="flex items-center gap-2 font-heading font-semibold">
        <Eye aria-hidden className="size-4 text-primary" /> Así te ven los postulantes
      </h2>
      {/* A still copy of TarjetaOferta's look: not a link, just a preview */}
      <div aria-hidden className="relative space-y-3 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
        <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-[0.35] bg-gradient-to-r from-primary to-primary/60" />
        <div className="flex items-center gap-3">
          <LogoEmpresa nombre={nombre} logo={logo} tamanio="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{nombre}</p>
            <p className="text-xs font-medium text-primary">Tu rubro</p>
          </div>
        </div>
        <p className="font-heading font-semibold">El puesto que buscás</p>
        <div className="space-y-1.5">
          <span className="block h-2 w-full rounded-full bg-muted" />
          <span className="block h-2 w-2/3 rounded-full bg-muted" />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-primary">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-foreground/80">
            <Clock className="size-3 text-primary" /> Jornada
          </span>
          <span className="inline-flex items-center gap-1">
            Ver oferta <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        En tus ofertas solo se ven tu nombre comercial y tu logo. El resto de tus datos y la constancia solo los ve la Oficina de
        Empleo.
      </p>
    </section>
  );
}
