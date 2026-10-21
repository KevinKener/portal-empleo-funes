"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Info, LoaderCircle, XCircle, Zap, ZapOff } from "lucide-react";
import { cambiarPrioridad, cerrarOferta, publicarOferta, rechazarOferta, type ResultadoRevision } from "@/app/admin/ofertas/actions";
import { FormularioRechazo, type SugerenciaRechazo } from "@/components/admin/FormularioRechazo";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import type { EstadoOferta } from "@/lib/estados";
import { cn } from "@/lib/utils";

// Frequent reasons, written for the company: what is wrong and how to fix it
const SUGERENCIAS: SugerenciaRechazo[] = [
  { corto: "Falta información", texto: "Falta información sobre el puesto: contá qué tareas hace la persona, el horario y dónde se trabaja." },
  { corto: "Requisitos que no se pueden pedir", texto: "Pide requisitos que no se pueden exigir (edad, género, apariencia física o estado civil). Sacalos y volvé a enviarla." },
  { corto: "Repetida", texto: "Es igual a otra oferta tuya que ya está publicada en el portal." },
  { corto: "No es un empleo", texto: "No es una oferta de empleo (por ejemplo, reventa de productos o pedidos de inversión)." },
];

const BOTON = "h-11 px-5 text-base";

type PropsAccionesRevision = {
  id: string;
  estado: EstadoOferta;
  urgente: boolean;
};

/**
 * What the Office does with an offer: publish or reject (with a reason the
 * company reads) a pending one, close a published one, and take the urgency
 * off when a company marks everything as urgent. Each action runs on the
 * first tap, with what it means said beforehand (one notice, tutor review
 * 2026-10-20); rejecting asks for the reason first, which is its own step.
 */
export function AccionesRevision({ id, estado, urgente }: PropsAccionesRevision) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState(false);
  const [, iniciar] = useTransition();

  function correr(clave: string, accion: () => Promise<ResultadoRevision>, exito: string) {
    setError(null);
    setAviso(null);
    setEnCurso(clave);
    iniciar(async () => {
      const resultado = await accion();
      setEnCurso(null);
      if (resultado.error) return setError(resultado.error);
      setRechazando(false);
      setAviso(exito);
      router.refresh();
    });
  }

  const ocupado = enCurso !== null;

  return (
    <div className="space-y-4">
      <AvisoFormulario error={error} aviso={aviso} />

      {estado === "pendiente" && !rechazando && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={ocupado}
              aria-describedby="aviso-publicar"
              onClick={() => correr("publicar", () => publicarOferta(id), "Oferta publicada. Ya se ve en el portal.")}
              className={buttonVariants({ className: cn(BOTON, "shadow-md shadow-primary/20 hover:bg-primary-hover") })}
            >
              {enCurso === "publicar" ? <LoaderCircle aria-hidden className="animate-spin" /> : <CircleCheck aria-hidden />}
              Publicar oferta
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => setRechazando(true)}
              className={buttonVariants({ variant: "outline", className: cn(BOTON, "text-destructive hover:text-destructive") })}
            >
              <XCircle aria-hidden /> Rechazar
            </button>
          </div>
          <p id="aviso-publicar" className="flex gap-2 text-sm text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            Al publicarla se ve en el portal al instante y empieza a recibir postulaciones.
          </p>
        </div>
      )}

      {estado === "pendiente" && rechazando && (
        <FormularioRechazo
          ayuda="La empresa lee este motivo y puede usar la oferta como base para una nueva."
          sugerencias={SUGERENCIAS}
          confirmar="Rechazar oferta"
          enCurso={enCurso === "rechazar"}
          onEnviar={(motivo) => correr("rechazar", () => rechazarOferta(id, motivo), "Oferta rechazada. La empresa ya puede ver el motivo.")}
          onCancelar={() => setRechazando(false)}
        />
      )}

      {estado === "publicada" && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={ocupado}
            aria-describedby="aviso-cerrar"
            onClick={() => correr("cerrar", () => cerrarOferta(id), "Oferta cerrada. Ya no se ve en el portal.")}
            className={buttonVariants({ variant: "destructive", className: cn(BOTON, "w-full") })}
          >
            {enCurso === "cerrar" ? <LoaderCircle aria-hidden className="animate-spin" /> : <XCircle aria-hidden />}
            Cerrar oferta
          </button>
          <p id="aviso-cerrar" className="flex gap-2 text-sm text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            Deja de verse en el portal y no recibe más postulaciones. No se puede volver a abrir.
          </p>
        </div>
      )}

      {(estado === "pendiente" || estado === "publicada") && !rechazando && (
        <button
          type="button"
          disabled={ocupado}
          onClick={() =>
            correr(
              "prioridad",
              () => cambiarPrioridad(id, !urgente),
              urgente ? "Le sacaste la urgencia a la oferta." : "La oferta quedó marcada como urgente.",
            )
          }
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50"
        >
          {enCurso === "prioridad" ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : urgente ? (
            <ZapOff aria-hidden className="size-4" />
          ) : (
            <Zap aria-hidden className="size-4" />
          )}
          {urgente ? "Quitar urgencia" : "Marcar como urgente"}
        </button>
      )}
    </div>
  );
}
