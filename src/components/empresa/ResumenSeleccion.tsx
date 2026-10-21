"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, LoaderCircle, MessagesSquare, BadgeCheck, X, type LucideIcon } from "lucide-react";
import { confirmarSeleccion } from "@/app/empresa/ofertas/[id]/candidatos/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PropsResumenSeleccion = {
  ofertaId: string;
  entrevistas: number;
  contrataciones: number;
  descartes: number;
};

function plural(cantidad: number, singular: string, varios: string) {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

/**
 * "Tu selección": the pending draft and the button that applies it all at
 * once with confirmar_seleccion() (Rule 11). Until then the job seekers see
 * nothing. One tap: that it cannot be undone is said before, next to the
 * button (tutor review 2026-10-20). Side column from lg; on phones it sticks
 * above the area bar only while there is something to confirm.
 */
export function ResumenSeleccion({ ofertaId, entrevistas, contrataciones, descartes }: PropsResumenSeleccion) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const total = entrevistas + contrataciones + descartes;

  function confirmar() {
    setError(null);
    iniciar(async () => {
      const resultado = await confirmarSeleccion(ofertaId);
      if (resultado.error) return setError(resultado.error);
      setAviso(`Listo: actualizamos ${plural(resultado.cambiados, "candidato", "candidatos")}. Los postulantes ya ven el cambio.`);
      router.refresh();
    });
  }

  if (total === 0) {
    return (
      <section aria-label="Tu selección" className="hidden space-y-2 rounded-2xl border border-border bg-card p-5 lg:block">
        <AvisoFormulario error={error} aviso={aviso} />
        <h2 className="flex items-center gap-2 font-heading font-semibold">
          <ListChecks aria-hidden className="size-5 text-primary" /> Tu selección
        </h2>
        <p className="text-sm text-muted-foreground">
          Marcá a cada candidato y después confirmá todo junto. Hasta entonces, nadie se entera.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Tu selección"
      className="sticky bottom-20 z-10 space-y-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-xl shadow-primary/10 motion-safe:animate-entrada sm:p-5 lg:static lg:shadow-md"
    >
      <AvisoFormulario error={error} />
      <h2 className="flex items-center gap-2 font-heading font-semibold">
        <ListChecks aria-hidden className="size-5 text-primary" />
        Tu selección
        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {plural(total, "sin confirmar", "sin confirmar")}
        </span>
      </h2>
      <ul className="flex flex-wrap gap-2 text-sm">
        {entrevistas > 0 && <Parte Icono={MessagesSquare} texto={`${entrevistas} a entrevista`} />}
        {contrataciones > 0 && <Parte Icono={BadgeCheck} texto={plural(contrataciones, "contratación", "contrataciones")} destacada />}
        {descartes > 0 && <Parte Icono={X} texto={plural(descartes, "descartado", "descartados")} apagada />}
      </ul>
      <p className="hidden text-sm text-muted-foreground sm:block">
        Los postulantes no ven nada hasta que confirmes, y una vez confirmada no se puede deshacer.
      </p>
      <button
        type="button"
        disabled={enviando}
        onClick={confirmar}
        className={buttonVariants({ className: "h-11 w-full px-5 text-base shadow-md shadow-primary/20 hover:bg-primary-hover" })}
      >
        {enviando && <LoaderCircle aria-hidden className="animate-spin" />}
        {enviando ? "Confirmando…" : "Confirmar selección"}
      </button>
    </section>
  );
}

function Parte({ Icono, texto, destacada = false, apagada = false }: { Icono: LucideIcon; texto: string; destacada?: boolean; apagada?: boolean }) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium",
        destacada ? "bg-primary text-primary-foreground" : apagada ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground",
      )}
    >
      <Icono aria-hidden className="size-4" />
      {texto}
    </li>
  );
}
