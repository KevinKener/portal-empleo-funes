import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { obtenerSesion } from "@/lib/auth";

const ENLACE = "font-medium text-primary underline-offset-4 hover:underline";

/**
 * "Postularme" area of an offer, by session: visitors are sent to sign in
 * and come back here; job seekers see the button (applying arrives in
 * Phase 4); companies and the Admin cannot apply.
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

  return (
    <div className="space-y-2 border-t border-border pt-6">
      {/* TODO(phase-4): apply to the offer (Rule 8: no double application). */}
      <button
        type="button"
        disabled
        className={buttonVariants({ className: "h-11 w-full px-6 text-base disabled:opacity-60 sm:w-auto" })}
      >
        Postularme
      </button>
      <p className="text-sm text-muted-foreground">
        Muy pronto vas a poder postularte desde acá. La Oficina de Empleo revisa cada postulación antes de enviarla a la
        empresa.
      </p>
    </div>
  );
}
