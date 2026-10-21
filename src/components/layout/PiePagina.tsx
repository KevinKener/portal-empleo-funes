import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Escudo } from "@/components/layout/Escudo";
import { AREA_POR_ROL, obtenerSesion } from "@/lib/auth";
import { OFICINA } from "@/lib/oficina";
import { cn } from "@/lib/utils";

type Enlace = { href: string; texto: string };

const LEGALES: Enlace[] = [
  { href: "/terminos", texto: "Términos y condiciones" },
  { href: "/privacidad", texto: "Política de privacidad" },
];

/** "Portal" column: sign-up and sign-in for visitors, the way back to their area for signed-in people. */
function enlacesPortal(area: string | null): Enlace[] {
  const cuenta = area
    ? [{ href: area, texto: "Mi panel" }]
    : [
        { href: "/registro", texto: "Crear cuenta" },
        { href: "/ingresar", texto: "Ingresar" },
      ];
  return [{ href: "/ofertas", texto: "Ofertas de trabajo" }, ...cuenta];
}

const ENLACE = "text-primary-foreground/75 transition-colors hover:text-primary-foreground focus-visible:underline focus-visible:outline-none";

/** Copyright year; a plain function so the footer stays a pure component. */
function anioActual() {
  return new Date().getFullYear();
}

/** Site footer on the brand's dark green: who runs the portal, its sections and the legal pages. */
export async function PiePagina() {
  // Cached per request: the header already looked the session up
  const sesion = await obtenerSesion();
  const columnas = [
    { titulo: "Portal", enlaces: enlacesPortal(sesion ? AREA_POR_ROL[sesion.rol] : null) },
    { titulo: "Legal", enlaces: LEGALES },
  ];

  return (
    <footer className="relative isolate mt-auto overflow-hidden bg-primary-deep text-primary-foreground">
      <Escudo className="absolute -right-24 -bottom-32 -z-10 size-96 text-primary-foreground/[0.04]" />
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
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

          {columnas.map(({ titulo, enlaces }) => (
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

          {/* Real contact channels of the Office (no WhatsApp line), from src/lib/oficina.ts */}
          <section aria-labelledby="pie-oficina" className="space-y-3">
            <h2 id="pie-oficina" className="font-heading text-sm font-semibold">
              Oficina de Empleo
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={OFICINA.telefonoEnlace} className={cn(ENLACE, "inline-flex items-center gap-2")}>
                  <Phone aria-hidden className="size-4 shrink-0" /> {OFICINA.telefono}
                </a>
              </li>
              <li>
                <a href={OFICINA.emailEnlace} className={cn(ENLACE, "inline-flex items-center gap-2")}>
                  <Mail aria-hidden className="size-4 shrink-0" />
                  {/* If it has to wrap, it wraps after the @, never in the middle of a word */}
                  <span>
                    {OFICINA.email.split("@")[0]}@<wbr />
                    {OFICINA.email.split("@")[1]}
                  </span>
                </a>
              </li>
              <li>
                <a href={OFICINA.mapa} target="_blank" rel="noopener noreferrer" className={cn(ENLACE, "inline-flex items-center gap-2")}>
                  <MapPin aria-hidden className="size-4 shrink-0" /> {OFICINA.direccion}
                  <span className="sr-only"> (abre el mapa en otra pestaña)</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-primary-foreground/75">
                <Clock aria-hidden className="size-4 shrink-0" /> {OFICINA.horario}
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between">
          <p>© {anioActual()} Municipalidad de Funes, Santa Fe.</p>
          <p>Desarrollado en el programa Funes Tech Lab.</p>
        </div>
      </div>
    </footer>
  );
}
