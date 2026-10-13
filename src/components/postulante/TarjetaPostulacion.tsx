import Link from "next/link";
import { Check } from "lucide-react";
import { ESTADO_POSTULACION_PARA_POSTULANTE, formatearFecha, textoEstadoPostulacion } from "@/lib/formato";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";

const PASOS = ["pendiente", "preseleccionado", "entrevista", "contratado"] as const;

/**
 * One application with its status in plain words. Active ones show a
 * timeline (vertical on phones, horizontal from sm); rejected ones a
 * message instead, softer when the quota was filled (Rule 10).
 */
export function TarjetaPostulacion({ postulacion }: { postulacion: MiPostulacion }) {
  const { estado, motivo_rechazo, oferta } = postulacion;
  const rechazada = estado === "rechazado";
  const texto = textoEstadoPostulacion(estado, motivo_rechazo);
  const actual = PASOS.indexOf(estado as (typeof PASOS)[number]);

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-card p-5 motion-safe:animate-in motion-safe:fade-in">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <h3 className="font-heading text-lg font-semibold">
            {oferta?.estado === "publicada" ? (
              <Link href={`/ofertas/${oferta.id}`} className="hover:text-primary hover:underline">
                {oferta.titulo}
              </Link>
            ) : (
              (oferta?.titulo ?? "Oferta")
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {oferta?.categoria && `${oferta.categoria} · `}Te postulaste el {formatearFecha(postulacion.created_at)}
          </p>
        </div>
        {oferta?.estado === "cerrada" && !rechazada && estado !== "contratado" && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Oferta cerrada
          </span>
        )}
      </header>

      {rechazada ? (
        <div className="rounded-xl bg-muted p-4">
          <p className="font-medium">{texto.titulo}</p>
          <p className="text-sm text-muted-foreground">{texto.detalle}</p>
        </div>
      ) : (
        <>
          <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0" aria-label="Estado de la postulación">
            {PASOS.map((paso, i) => {
              const hecho = i < actual;
              const enCurso = i === actual;
              return (
                <li key={paso} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                      hecho && "border-primary bg-primary text-primary-foreground",
                      enCurso && "border-primary bg-card text-primary motion-safe:animate-pulse",
                      !hecho && !enCurso && "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {hecho ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={cn("text-sm", enCurso ? "font-semibold" : hecho ? "" : "text-muted-foreground")}>
                    {ESTADO_POSTULACION_PARA_POSTULANTE[paso].titulo}
                    {enCurso && <span className="sr-only"> (estado actual)</span>}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="text-sm text-muted-foreground">{texto.detalle}</p>
        </>
      )}
    </article>
  );
}
