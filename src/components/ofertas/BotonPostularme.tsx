"use client";

import { startTransition, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { postularme } from "@/app/postulante/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";

const BOTON = "h-11 w-full px-6 text-base sm:w-auto";

/**
 * One tap: what the Office will do with the profile is said next to the
 * button beforehand (tutor review 2026-10-20: no second confirmation).
 * Success shows right away (optimistic) and rolls back if the server refuses.
 */
export function BotonPostularme({ ofertaId }: { ofertaId: string }) {
  const [postulado, setPostulado] = useState(false);
  const [postuladoOptimista, marcarPostulado] = useOptimistic(postulado, (_actual, valor: boolean) => valor);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function confirmar() {
    setError(null);
    iniciar(async () => {
      marcarPostulado(true);
      const resultado = await postularme(ofertaId);
      // Updates after an await need their own transition to land with the action
      startTransition(() => {
        if (resultado.ok) setPostulado(true);
        else setError(resultado.error);
      });
    });
  }

  if (postuladoOptimista) {
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-secondary p-4 text-secondary-foreground sm:flex-row sm:items-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
        <CircleCheck aria-hidden className="size-8 shrink-0 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-500" />
        <div className="flex-1" role="status">
          <p className="font-medium">¡Te postulaste!</p>
          <p className="text-sm">La Oficina de Empleo va a revisar tu perfil. Seguí el estado en Mis postulaciones.</p>
        </div>
        <Link href="/postulante/postulaciones" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Mis postulaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AvisoFormulario error={error} />
      <p id="aviso-postulacion" className="text-sm text-muted-foreground">
        La Oficina de Empleo va a ver tu perfil y tu CV, y si encaja con la oferta se lo envía a la empresa.
      </p>
      <button
        type="button"
        onClick={confirmar}
        disabled={enviando}
        aria-describedby="aviso-postulacion"
        className={buttonVariants({ className: `${BOTON} hover:bg-primary-hover` })}
      >
        {enviando ? <LoaderCircle aria-hidden className="animate-spin" /> : <Send aria-hidden />}
        Postularme
      </button>
    </div>
  );
}
