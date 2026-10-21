import { Clock, LifeBuoy, Mail, MapPin, Phone } from "lucide-react";
import { ContactoEmail } from "@/components/layout/ContactoEmail";
import { CopiarEmail } from "@/components/layout/CopiarEmail";
import { OFICINA } from "@/lib/oficina";
import { cn } from "@/lib/utils";

const ENLACE = "flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * "¿Necesitás ayuda?": a person at the Office one tap away (call, email or
 * go in person), for whoever gets stuck. The Office has no WhatsApp line.
 */
export function AyudaOficina({ className }: { className?: string }) {
  return (
    <section aria-labelledby="titulo-ayuda" className={cn("space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <LifeBuoy aria-hidden className="size-5" />
        </span>
        <div>
          <h2 id="titulo-ayuda" className="font-heading font-semibold">
            ¿Necesitás ayuda?
          </h2>
          <p className="text-sm text-muted-foreground">La Oficina de Empleo te atiende.</p>
        </div>
      </div>
      <ul className="space-y-0.5 text-sm">
        <li>
          <a href={OFICINA.telefonoEnlace} className={ENLACE}>
            <Phone aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="font-semibold">{OFICINA.telefono}</span>
          </a>
        </li>
        <li className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ContactoEmail conCopiar={false} className={cn(ENLACE, "w-full")}>
              <Mail aria-hidden className="size-4 shrink-0 text-primary" />
              {/* If it has to wrap, it wraps after the @, never in the middle of a word */}
              <span className="min-w-0 break-words">
                {OFICINA.email.split("@")[0]}@<wbr />
                {OFICINA.email.split("@")[1]}
              </span>
            </ContactoEmail>
          </div>
          <CopiarEmail email={OFICINA.email} />
        </li>
        <li>
          <a href={OFICINA.mapa} target="_blank" rel="noopener noreferrer" className={ENLACE}>
            <MapPin aria-hidden className="size-4 shrink-0 text-primary" />
            <span>
              {OFICINA.direccion}
              <span className="sr-only"> (abre el mapa en otra pestaña)</span>
            </span>
          </a>
        </li>
        <li className="flex items-center gap-3 px-0 py-2 text-muted-foreground">
          <Clock aria-hidden className="size-4 shrink-0 text-primary" />
          {OFICINA.horario}
        </li>
      </ul>
    </section>
  );
}
