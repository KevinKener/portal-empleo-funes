import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Building2, ChevronRight, UserRound } from "lucide-react";
import { Escudo } from "@/components/layout/Escudo";

export const metadata: Metadata = { title: "Crear cuenta" };

const OPCIONES = [
  {
    href: "/registro/postulante",
    icono: UserRound,
    titulo: "Busco trabajo",
    descripcion: "Armá tu perfil y postulate a las ofertas de Funes.",
  },
  {
    href: "/registro/empresa",
    icono: Building2,
    titulo: "Soy una empresa",
    descripcion: "Publicá ofertas y recibí candidatos preseleccionados por la Oficina de Empleo.",
  },
] as const;

/** Sign-up entry point: the person picks the kind of account first. */
export default function RegistroPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary shadow-inner motion-safe:animate-festejo-pop">
          <Escudo className="size-9 text-primary" />
        </span>
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold">Crear cuenta</h1>
          <p className="text-muted-foreground">¿Qué tipo de cuenta necesitás?</p>
        </div>
      </div>

      <ul className="space-y-3">
        {OPCIONES.map(({ href, icono: Icono, titulo, descripcion }, i) => (
          <li key={href} className="motion-safe:animate-entrada" style={{ "--retraso": `${290 + i * 90}ms` } as CSSProperties}>
            <Link
              href={href}
              className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-[border-color,background-color,box-shadow,translate] duration-200 hover:border-primary hover:bg-accent hover:shadow-lg hover:shadow-primary/[0.08] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-[background-color,color,scale] duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:scale-110">
                <Icono aria-hidden className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading font-semibold">{titulo}</span>
                <span className="block text-sm text-muted-foreground">{descripcion}</span>
              </span>
              <ChevronRight
                aria-hidden
                className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:text-primary motion-safe:group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Al crear tu cuenta aceptás los{" "}
        <Link href="/terminos" className="font-medium text-primary underline-offset-4 hover:underline">
          términos y condiciones
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="font-medium text-primary underline-offset-4 hover:underline">
          política de privacidad
        </Link>
        .
      </p>
    </div>
  );
}
