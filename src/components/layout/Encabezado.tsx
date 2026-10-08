import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/ofertas", texto: "Ofertas" },
];

/** Public site header: municipal brand, main navigation and login entry point. */
export function Encabezado() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image src="/marca/escudo.png" alt="" width={32} height={33} priority />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-heading text-sm font-semibold text-primary sm:text-base">
              Portal de Empleo
            </span>
            <span className="truncate text-xs text-muted-foreground">Municipalidad de Funes</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground sm:px-3"
            >
              {enlace.texto}
            </Link>
          ))}
          {/* TODO(phase-3): link to the login page once authentication exists. */}
          <span
            aria-disabled="true"
            title="Disponible próximamente"
            className={buttonVariants({ size: "lg", className: "hidden cursor-not-allowed opacity-60 sm:inline-flex" })}
          >
            Ingresar
          </span>
        </nav>
      </div>
    </header>
  );
}
