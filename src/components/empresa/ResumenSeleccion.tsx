"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { confirmarSeleccion } from "@/app/empresa/ofertas/[id]/candidatos/actions";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";

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
 * Pending selection draft and the button that applies it all at once with
 * confirmar_seleccion() (Rule 11). Until then the job seekers see nothing.
 */
export function ResumenSeleccion({ ofertaId, entrevistas, contrataciones, descartes }: PropsResumenSeleccion) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const partes = [
    entrevistas > 0 && `${entrevistas} a entrevista`,
    contrataciones > 0 && plural(contrataciones, "contratación", "contrataciones"),
    descartes > 0 && plural(descartes, "descartado", "descartados"),
  ].filter(Boolean);
  const total = entrevistas + contrataciones + descartes;

  function confirmar() {
    setError(null);
    iniciar(async () => {
      const resultado = await confirmarSeleccion(ofertaId);
      setConfirmando(false);
      if (resultado.error) return setError(resultado.error);
      setAviso(`Listo: actualizamos ${plural(resultado.cambiados, "candidato", "candidatos")}. Los postulantes ya ven el cambio.`);
      router.refresh();
    });
  }

  if (total === 0) return <AvisoFormulario error={error} aviso={aviso} />;

  return (
    <section
      aria-label="Selección sin confirmar"
      className="sticky bottom-20 z-10 space-y-3 rounded-xl border border-primary/30 bg-card p-4 shadow-md sm:static sm:bottom-auto sm:shadow-none"
    >
      <AvisoFormulario error={error} />
      <p className="text-sm">
        <span className="font-medium">
          Tenés {plural(total, "decisión", "decisiones")} sin confirmar:
        </span>{" "}
        {partes.join(", ")}. Los postulantes no ven nada hasta que confirmes.
      </p>
      {confirmando ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={() => setConfirmando(false)} className={buttonVariants({ variant: "ghost", className: "h-11 px-5 text-base" })}>
            Revisar de nuevo
          </button>
          <button
            type="button"
            autoFocus
            disabled={enviando}
            onClick={confirmar}
            className={buttonVariants({ className: "h-11 px-5 text-base hover:bg-primary-hover" })}
          >
            {enviando && <LoaderCircle aria-hidden className="animate-spin" />}
            Sí, confirmar. No se puede deshacer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className={buttonVariants({ className: "h-11 w-full px-5 text-base hover:bg-primary-hover sm:w-auto" })}
        >
          Confirmar selección
        </button>
      )}
    </section>
  );
}
