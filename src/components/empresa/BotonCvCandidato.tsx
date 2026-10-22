"use client";

import { useState, useTransition } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type PropsBotonCv = {
  postulacionId: string;
  /** Server Action that signs the link: the company's or the Office's, each checking its own role. */
  abrir: (postulacionId: string) => Promise<{ url: string | null; error: string | null }>;
};

/** Opens (or downloads, for Word files) a candidate's uploaded CV through a short-lived signed link. */
export function BotonCvCandidato({ postulacionId, abrir: abrirCv }: PropsBotonCv) {
  const [error, setError] = useState<string | null>(null);
  const [abriendo, iniciar] = useTransition();

  function abrir() {
    setError(null);
    iniciar(async () => {
      const { url, error: errorUrl } = await abrirCv(postulacionId);
      if (url) window.open(url, "_blank", "noopener");
      else setError(errorUrl);
    });
  }

  return (
    <div className="space-y-1">
      <button type="button" onClick={abrir} disabled={abriendo} className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl px-4 text-sm font-semibold" })}>
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
