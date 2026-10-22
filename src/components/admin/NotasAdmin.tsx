"use client";

import { useState, useTransition } from "react";
import { Check, LoaderCircle, Lock } from "lucide-react";
import { guardarNotas } from "@/app/admin/ofertas/[id]/postulantes/actions";
import { buttonVariants } from "@/components/ui/button";
import { NOTAS_ADMIN_MAXIMO } from "@/lib/validaciones/ofertas";

/**
 * The Office's private notes on an application (postulaciones.notas_admin):
 * only Admins read them, through the postulaciones_admin view. Saved on
 * demand; the button says when there is something unsaved.
 */
export function NotasAdmin({ ofertaId, postulacionId, notas }: { ofertaId: string; postulacionId: string; notas: string }) {
  const [texto, setTexto] = useState(notas);
  const [guardado, setGuardado] = useState(notas);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();
  const cambios = texto.trim() !== guardado.trim();

  function guardar() {
    setError(null);
    iniciar(async () => {
      const resultado = await guardarNotas(ofertaId, postulacionId, texto);
      if (resultado.error) return setError(resultado.error);
      setGuardado(texto);
    });
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(evento) => {
        evento.preventDefault();
        guardar();
      }}
    >
      <label htmlFor="notas-admin" className="flex items-center gap-2 font-heading font-semibold">
        <Lock aria-hidden className="size-4 text-primary" />
        Notas de la Oficina
      </label>
      <p id="notas-ayuda" className="text-sm text-muted-foreground">
        Solo las ve la Oficina. Ni la empresa ni la persona pueden leerlas.
      </p>
      <textarea
        id="notas-admin"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        rows={4}
        maxLength={NOTAS_ADMIN_MAXIMO}
        aria-describedby="notas-ayuda"
        placeholder="Por ejemplo: la llamé el martes, puede empezar en noviembre."
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button type="submit" disabled={guardando || !cambios} className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}>
        {guardando ? <LoaderCircle aria-hidden className="animate-spin" /> : !cambios && guardado ? <Check aria-hidden /> : null}
        {guardando ? "Guardando…" : cambios ? "Guardar notas" : guardado ? "Notas guardadas" : "Guardar notas"}
      </button>
    </form>
  );
}
