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
 * One tap: that it cannot be undone is said before, next to the button
 * (tutor review 2026-10-20).
 */
export function ResumenSeleccion({ ofertaId, entrevistas, contrataciones, descartes }: PropsResumenSeleccion) {
  const router = useRouter();
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
        {partes.join(", ")}. Los postulantes no ven nada hasta que confirmes, y una vez confirmada no se puede deshacer.
      </p>
      <button
        type="button"
        disabled={enviando}
        onClick={confirmar}
        className={buttonVariants({ className: "h-11 w-full px-5 text-base hover:bg-primary-hover sm:w-auto" })}
      >
        {enviando && <LoaderCircle aria-hidden className="animate-spin" />}
        {enviando ? "Confirmando…" : "Confirmar selección"}
      </button>
    </section>
  );
}
