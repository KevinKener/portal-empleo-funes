"use client";

import { useState, useTransition } from "react";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { abrirConstancia } from "@/app/admin/empresas/actions";
import { buttonVariants } from "@/components/ui/button";

/** Opens the company's ARCA certificate through a 60-second signed link (private bucket). */
export function BotonConstancia({ empresaId }: { empresaId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [abriendo, iniciar] = useTransition();

  function abrir() {
    setError(null);
    iniciar(async () => {
      const { url, error: fallo } = await abrirConstancia(empresaId);
      if (url) window.open(url, "_blank", "noopener");
      else setError(fallo);
    });
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={abrir} disabled={abriendo} className={buttonVariants({ variant: "outline", className: "h-10" })}>
        {abriendo ? <LoaderCircle aria-hidden className="animate-spin" /> : <ExternalLink aria-hidden />}
        Ver constancia
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
