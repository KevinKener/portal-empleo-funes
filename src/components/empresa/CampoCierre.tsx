"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { CIERRE, formatearDia, sumarDias } from "@/lib/cierre-oferta";
import { cn } from "@/lib/utils";

/**
 * Optional closing date of a draft offer: quick choices plus a date picker
 * limited to tomorrow … CIERRE.maximo days ahead (the database checks the
 * same window). Empty means CIERRE.porDefecto days from publication.
 * `hoy` ("YYYY-MM-DD", Funes time) comes from the server.
 */
export function CampoCierre({ hoy, inicial, error }: { hoy: string; inicial?: string | null; error?: string }) {
  const [valor, setValor] = useState(inicial ?? "");
  const atajos = [
    { texto: `Sin fecha (${CIERRE.porDefecto} días)`, valor: "" },
    { texto: "2 semanas", valor: sumarDias(hoy, 14) },
    { texto: "1 mes", valor: sumarDias(hoy, 30) },
    { texto: `${CIERRE.maximo} días`, valor: sumarDias(hoy, CIERRE.maximo) },
  ];

  return (
    <fieldset className="space-y-2" aria-describedby={error ? "cierre-error" : "cierre-ayuda"}>
      <legend className="text-sm font-medium text-foreground">¿Hasta cuándo recibís postulaciones?</legend>
      <div className="flex flex-wrap gap-2">
        {atajos.map((atajo) => (
          <button
            key={atajo.texto}
            type="button"
            onClick={() => setValor(atajo.valor)}
            aria-pressed={valor === atajo.valor}
            className={cn(
              "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
              valor === atajo.valor ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary hover:text-primary",
            )}
          >
            {atajo.texto}
          </button>
        ))}
      </div>
      <label className="flex w-fit items-center gap-2 rounded-xl border border-input bg-card px-3 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
        <CalendarClock aria-hidden className="size-4 shrink-0 text-primary" />
        <span className="sr-only">Fecha de cierre</span>
        <input
          type="date"
          name="fecha_cierre"
          value={valor}
          min={sumarDias(hoy, 1)}
          max={sumarDias(hoy, CIERRE.maximo)}
          onChange={(evento) => setValor(evento.target.value)}
          aria-invalid={error ? true : undefined}
          className="h-10 bg-transparent text-base outline-none sm:text-sm"
        />
      </label>
      {error ? (
        <p id="cierre-error" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p id="cierre-ayuda" className="text-sm text-muted-foreground">
          {valor
            ? `Recibe postulaciones hasta el ${formatearDia(valor)} inclusive. Después deja de verse en el portal.`
            : `Opcional. Si no elegís una fecha, recibe postulaciones durante ${CIERRE.porDefecto} días desde que se publica.`}
        </p>
      )}
    </fieldset>
  );
}
