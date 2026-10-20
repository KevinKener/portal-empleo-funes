"use client";

import { useState, useTransition } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { abrirCvCandidato } from "@/app/empresa/ofertas/[id]/candidatos/actions";
import { buttonVariants } from "@/components/ui/button";

/** Opens (or downloads, for Word files) a candidate's uploaded CV through a short-lived signed link. */
export function BotonCvCandidato({ postulacionId }: { postulacionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [abriendo, iniciar] = useTransition();

  function abrir() {
    setError(null);
    iniciar(async () => {
      const { url, error: errorUrl } = await abrirCvCandidato(postulacionId);
      if (url) window.open(url, "_blank", "noopener");
      else setError(errorUrl);
    });
  }

  return (
    <div className="space-y-1">
      <button type="button" onClick={abrir} disabled={abriendo} className={buttonVariants({ variant: "outline", className: "h-11 px-4 text-base" })}>
        {abriendo ? <LoaderCircle aria-hidden className="animate-spin" /> : <FileText aria-hidden />}
        Ver CV adjunto
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
