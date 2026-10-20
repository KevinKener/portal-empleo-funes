import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { abrirArchivo, eliminarArchivo, registrarArchivo } from "@/app/postulante/archivos";
import { SubidaArchivo } from "@/components/formularios/SubidaArchivo";
import { BotonPostularme } from "@/components/ofertas/BotonPostularme";
import { buttonVariants } from "@/components/ui/button";
import { obtenerSesion } from "@/lib/auth";
import { obtenerResumenPerfil, puedePostularse } from "@/lib/perfil-postulante";
import { yaSePostulo } from "@/lib/postulaciones";

const ENLACE = "font-medium text-primary underline-offset-4 hover:underline";

/**
 * "Postularme" area of an offer, by session: visitors are sent to sign in
 * and come back here; job seekers apply, see that they already did (Rule
 * 8) or upload the CV they are missing; companies and the Admin cannot apply.
 */
export async function AccionPostular({ ofertaId }: { ofertaId: string }) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    const ingresar = `/ingresar?siguiente=${encodeURIComponent(`/ofertas/${ofertaId}`)}`;
    return (
      <div className="space-y-2 border-t border-border pt-6">
        <Link href={ingresar} className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover sm:w-auto" })}>
          Ingresá para postularte
        </Link>
        <p className="text-sm text-muted-foreground">
          ¿Todavía no tenés cuenta?{" "}
          <Link href="/registro/postulante" className={ENLACE}>
            Creala en 3 minutos
          </Link>
          . La Oficina de Empleo revisa cada postulación antes de enviarla a la empresa.
        </p>
      </div>
    );
  }

  if (sesion.rol !== "postulante") {
    return (
      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        Solo las cuentas de postulantes pueden postularse a las ofertas.
      </p>
    );
  }

  const resumen = await obtenerResumenPerfil(sesion.userId);
  if (!resumen) return null;

  if (await yaSePostulo(resumen.postulante.id, ofertaId)) {
    return (
      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <p className="flex flex-1 items-center gap-2 font-medium text-primary">
          <CircleCheck aria-hidden className="size-5" />
          Ya te postulaste a esta oferta.
        </p>
        <Link href="/postulante/postulaciones" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Ver el estado
        </Link>
      </div>
    );
  }

  if (!puedePostularse(resumen)) {
    // The CV is the only thing missing: upload it right here, or build it and
    // come back (?volver) instead of losing the offer (tutor review 2026-10-20).
    // Once uploaded, SubidaArchivo refreshes the page and the button shows up.
    return (
      <div className="space-y-4 border-t border-border pt-6">
        <div className="space-y-1">
          <p className="font-medium">Para postularte, cargá tu CV</p>
          <p className="text-sm text-muted-foreground">Lo cargás una vez y te sirve para todas las ofertas.</p>
        </div>
        <SubidaArchivo
          tipo="cv"
          userId={sesion.userId}
          etiqueta="CV en PDF"
          cargado={false}
          acciones={{ registrar: registrarArchivo, abrir: abrirArchivo, eliminar: eliminarArchivo }}
        />
        <p className="text-sm text-muted-foreground">
          ¿No tenés CV en PDF?{" "}
          <Link href={`/postulante/cv?volver=${ofertaId}`} className={ENLACE}>
            Armalo acá en pocos pasos
          </Link>{" "}
          y te traemos de vuelta a esta oferta.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-6">
      <BotonPostularme ofertaId={ofertaId} />
    </div>
  );
}
