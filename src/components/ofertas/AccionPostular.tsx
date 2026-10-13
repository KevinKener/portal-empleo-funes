import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { BotonPostularme } from "@/components/ofertas/BotonPostularme";
import { buttonVariants } from "@/components/ui/button";
import { obtenerSesion } from "@/lib/auth";
import { obtenerResumenPerfil, puedePostularse, tieneCv } from "@/lib/perfil-postulante";
import { yaSePostulo } from "@/lib/postulaciones";

const ENLACE = "font-medium text-primary underline-offset-4 hover:underline";

/**
 * "Postularme" area of an offer, by session: visitors are sent to sign in
 * and come back here; job seekers apply, see that they already did (Rule
 * 8) or what their profile is missing; companies and the Admin cannot apply.
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
    // Inline checklist instead of a dead end: what is missing and where to do it
    const faltan = [
      resumen.rubros === 0 && { href: "/postulante/rubros", texto: "Elegir al menos un rubro" },
      !tieneCv(resumen) && { href: "/postulante/cv", texto: "Armar tu CV o subirlo en PDF" },
    ].filter((item): item is { href: string; texto: string } => Boolean(item));

    return (
      <div className="space-y-3 border-t border-border pt-6">
        <p className="font-medium">Para postularte, completá tu perfil:</p>
        <ul className="space-y-2">
          {faltan.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={ENLACE}>
                {item.texto}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">Te lleva unos minutos y te sirve para todas las ofertas.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-6">
      <BotonPostularme ofertaId={ofertaId} />
    </div>
  );
}
