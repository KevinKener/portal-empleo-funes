import Link from "next/link";
import { formatearFecha, textoEstadoPostulacion } from "@/lib/formato";
import type { MiPostulacion } from "@/lib/postulaciones";
import { cn } from "@/lib/utils";
import { SeguimientoPostulacion } from "./SeguimientoPostulacion";

// Left stripe by stage: in review is soft, with the company or hired is the brand green
const FRANJA: Record<MiPostulacion["estado"], string> = {
  pendiente: "border-l-primary/40",
  preseleccionado: "border-l-primary",
  entrevista: "border-l-primary",
  contratado: "border-l-primary",
  rechazado: "border-l-border",
};

/**
 * One application with its status in plain words. Active ones show a
 * timeline (vertical on phones, horizontal from sm); rejected ones a
 * message instead, softer when the quota was filled (Rule 10).
 */
export function TarjetaPostulacion({ postulacion }: { postulacion: MiPostulacion }) {
  const { estado, motivo_rechazo, oferta } = postulacion;
  const rechazada = estado === "rechazado";
  const texto = textoEstadoPostulacion(estado, motivo_rechazo);

  return (
    // The panel links here with #postulacion-<id>
    <article id={`postulacion-${postulacion.id}`} className={cn("scroll-mt-24 space-y-4 rounded-2xl border border-l-4 border-border bg-card p-5", FRANJA[estado])}>
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
          <SeguimientoPostulacion estado={estado} />
          <p className="text-sm text-muted-foreground">{texto.detalle}</p>
        </>
      )}
    </article>
  );
}
