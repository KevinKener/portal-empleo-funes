"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Info, LoaderCircle, XCircle } from "lucide-react";
import { rechazarEmpresa, verificarEmpresa, type ResultadoVerificacion } from "@/app/admin/empresas/actions";
import { FormularioRechazo, type SugerenciaRechazo } from "@/components/admin/FormularioRechazo";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Frequent reasons, written for the company: what is wrong and how to fix it
const SUGERENCIAS: SugerenciaRechazo[] = [
  { corto: "Falta la constancia", texto: "Necesitamos la constancia de inscripción en ARCA para verificar la empresa. Subila desde \"Mi empresa\"." },
  { corto: "El CUIT no coincide", texto: "El CUIT no coincide con la razón social que cargaste. Revisá los datos o subí la constancia de ARCA." },
  { corto: "No pudimos contactarte", texto: "No pudimos comunicarnos al teléfono que cargaste. Actualizalo en \"Mi empresa\" así la Oficina puede llamarte." },
  { corto: "No contrata personal", texto: "La cuenta no corresponde a una empresa o comercio que contrate personal." },
];

const BOTON = "h-11 px-5 text-base";

/**
 * Verify or reject a pending company (Rule 3). Rejecting asks for the reason
 * the company reads in its area; if it fixes its data it comes back to the
 * queue by itself (D1). Verified and rejected companies have no actions.
 */
export function AccionesEmpresa({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState(false);
  const [, iniciar] = useTransition();

  function correr(clave: string, accion: () => Promise<ResultadoVerificacion>, exito: string) {
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

  return (
    <div className="space-y-4">
      <AvisoFormulario error={error} aviso={aviso} />

      {rechazando ? (
        <FormularioRechazo
          ayuda="La empresa lee este motivo en su panel. Si corrige sus datos, vuelve sola a esta lista para que la revises de nuevo."
          sugerencias={SUGERENCIAS}
          confirmar="Rechazar empresa"
          enCurso={enCurso === "rechazar"}
          onEnviar={(motivo) => correr("rechazar", () => rechazarEmpresa(id, motivo), "Empresa rechazada. Ya puede ver el motivo.")}
          onCancelar={() => setRechazando(false)}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={enCurso !== null}
              aria-describedby="aviso-verificar"
              onClick={() => correr("verificar", () => verificarEmpresa(id), "Empresa verificada. Ya puede publicar ofertas.")}
              className={buttonVariants({ className: cn(BOTON, "shadow-md shadow-primary/20 hover:bg-primary-hover") })}
            >
              {enCurso === "verificar" ? <LoaderCircle aria-hidden className="animate-spin" /> : <BadgeCheck aria-hidden />}
              Verificar empresa
            </button>
            <button
              type="button"
              disabled={enCurso !== null}
              onClick={() => setRechazando(true)}
              className={buttonVariants({ variant: "outline", className: cn(BOTON, "text-destructive hover:text-destructive") })}
            >
              <XCircle aria-hidden /> Rechazar
            </button>
          </div>
          <p id="aviso-verificar" className="flex gap-2 text-sm text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            Al verificarla ya puede cargar ofertas y enviarlas a revisión.
          </p>
        </div>
      )}
    </div>
  );
}
