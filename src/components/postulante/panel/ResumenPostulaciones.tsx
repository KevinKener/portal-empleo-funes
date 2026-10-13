import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { textoEstadoPostulacion } from "@/lib/formato";
import { contarPorGrupo, destacarActivas, type GrupoEstado } from "@/lib/panel-postulante";
import type { MiPostulacion } from "@/lib/postulaciones";
import { SeguimientoPostulacion } from "../SeguimientoPostulacion";
import { MarcaNovedad } from "./VistosPanel";

const EN_PANEL = 3;

const GRUPOS: Record<GrupoEstado, (n: number) => string> = {
  en_revision: (n) => `${n} en revisión`,
  con_la_empresa: (n) => `${n} con la empresa`,
  contratado: (n) => (n === 1 ? "1 contratación" : `${n} contrataciones`),
  finalizada: (n) => (n === 1 ? "1 finalizada" : `${n} finalizadas`),
};

/**
 * "Mis postulaciones" on the panel: a count per status, the most relevant
 * applications with a compact tracker, and a clear way to the full list.
 */
export function ResumenPostulaciones({ postulaciones, empresas }: { postulaciones: MiPostulacion[]; empresas: Map<string, string> }) {
  const total = postulaciones.length;

  return (
    <section aria-labelledby="titulo-mis-postulaciones" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-3">
        <h2 id="titulo-mis-postulaciones" className="font-heading text-xl font-semibold">
          Mis postulaciones
        </h2>
        {total > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Postulaciones por estado">
            {contarPorGrupo(postulaciones).map(({ grupo, cantidad }) => (
              <li key={grupo} className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {GRUPOS[grupo](cantidad)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <Inbox aria-hidden className="size-9 text-muted-foreground" />
          <p className="font-medium">Todavía no te postulaste a ninguna oferta.</p>
          <p className="text-sm text-muted-foreground">Cuando lo hagas, acá vas a ver en qué etapa está cada una.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {destacarActivas(postulaciones, EN_PANEL).map((postulacion) => (
              <li key={postulacion.id}>
                <TarjetaCompacta postulacion={postulacion} empresa={postulacion.oferta ? empresas.get(postulacion.oferta.id) : undefined} />
              </li>
            ))}
          </ul>
          <Link
            href="/postulante/postulaciones"
            className={buttonVariants({ variant: "outline", className: "h-11 w-full text-base" })}
          >
            {total === 1 ? "Ver mi postulación" : `Ver mis ${total} postulaciones`}
            <ArrowRight aria-hidden />
          </Link>
        </>
      )}
    </section>
  );
}

function TarjetaCompacta({ postulacion, empresa }: { postulacion: MiPostulacion; empresa?: string }) {
  const { id, estado, motivo_rechazo, oferta } = postulacion;
  const texto = textoEstadoPostulacion(estado, motivo_rechazo);

  return (
    <Link
      href={`/postulante/postulaciones#postulacion-${id}`}
      className="block space-y-2 rounded-xl border border-border p-4 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{oferta?.titulo ?? "Oferta"}</p>
          {empresa && <p className="truncate text-sm text-muted-foreground">{empresa}</p>}
        </div>
        <MarcaNovedad id={id} estado={estado} />
      </div>
      {estado === "rechazado" ? (
        <p className="text-sm font-semibold">{texto.titulo}</p>
      ) : (
        <SeguimientoPostulacion estado={estado} compacto />
      )}
      <p className="text-sm text-muted-foreground">{texto.detalle}</p>
    </Link>
  );
}
