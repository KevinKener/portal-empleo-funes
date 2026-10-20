import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Escudo } from "@/components/layout/Escudo";

const COLUMNAS = [
  {
    titulo: "Portal",
    enlaces: [
      { href: "/ofertas", texto: "Ofertas de trabajo" },
      { href: "/registro", texto: "Crear cuenta" },
      { href: "/ingresar", texto: "Ingresar" },
    ],
  },
  {
    titulo: "Legal",
    enlaces: [
      { href: "/terminos", texto: "Términos y condiciones" },
      { href: "/privacidad", texto: "Política de privacidad" },
    ],
  },
] as const;

const ENLACE = "text-primary-foreground/75 transition-colors hover:text-primary-foreground focus-visible:underline focus-visible:outline-none";

/** Copyright year; a plain function so the footer stays a pure component. */
function anioActual() {
  return new Date().getFullYear();
}

/** Site footer on the brand's dark green: who runs the portal, its sections and the legal pages. */
export function PiePagina() {
  return (
    <footer className="relative isolate mt-auto overflow-hidden bg-primary-deep text-primary-foreground">
      <Escudo className="absolute -right-24 -bottom-32 -z-10 size-96 text-primary-foreground/[0.04]" />
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Image src="/marca/logo-blanco.png" alt="Gobierno de la Ciudad de Funes" width={185} height={52} className="h-11 w-auto" />
            <p className="max-w-sm text-sm text-primary-foreground/75">
              El portal de la Oficina de Empleo de la Municipalidad de Funes. Conecta a vecinos que buscan trabajo con
              empresas de la ciudad, con la Oficina acompañando cada paso.
            </p>
            <a
              href="https://funes.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground underline-offset-4 hover:underline"
            >
              funes.gob.ar
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          </div>

          {COLUMNAS.map(({ titulo, enlaces }) => (
            <nav key={titulo} aria-label={titulo} className="space-y-3">
              <h2 className="font-heading text-sm font-semibold">{titulo}</h2>
              <ul className="space-y-2 text-sm">
                {enlaces.map(({ href, texto }) => (
                  <li key={href}>
                    <Link href={href} className={ENLACE}>
                      {texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between">
          <p>© {anioActual()} Municipalidad de Funes, Santa Fe.</p>
          <p>Desarrollado en el programa Funes Tech Lab.</p>
        </div>
      </div>
    </footer>
  );
}
