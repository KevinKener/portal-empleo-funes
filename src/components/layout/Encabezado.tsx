import type { ReactNode } from "react";
import Link from "next/link";
import { Eye, LogOut } from "lucide-react";
import { salir } from "@/app/(publico)/ingresar/actions";
import { Escudo } from "@/components/layout/Escudo";
import { buttonVariants } from "@/components/ui/button";
import { AREA_POR_ROL, inicioDe, obtenerSesion } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { HREF_VER_PORTAL } from "@/lib/ver-portal";

// On phones the shield already links home, and signed-in people reach the
// offers from their area, so those links only show from sm to keep the bar on one line.
const ENLACES = [
  { href: "/", texto: "Inicio", enCelular: false },
  { href: "/ofertas", texto: "Ofertas", enCelular: "sin-sesion" },
] as const;

const ENLACE = "rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap text-foreground hover:bg-accent hover:text-accent-foreground sm:px-3";

/**
 * Site header: municipal brand, navigation and the account entry point.
 * Inside a private area it carries the area's tabs (`navegacion`) instead of
 * the site links, so the page has a single bar (tutor review 2026-10-20).
 * `conBarra`: on public pages the signed-in person has their area's bottom
 * bar on phones, so "Mi panel" only shows from md.
 */
export async function Encabezado({ navegacion, conBarra = false }: { navegacion?: ReactNode; conBarra?: boolean }) {
  const sesion = await obtenerSesion();
  const enArea = Boolean(navegacion);
  // For companies and the Office the landing redirects to their panel: link there directly
  const inicio = inicioDe(sesion);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href={inicio} className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Escudo className="size-8 text-primary" />
          {/* With tabs, md has no room for the name: the shield alone links home until lg.
              Below 400px only "Portal de Empleo" shows, so it is never cut. */}
          <span className={cn("flex min-w-0 flex-col leading-tight", enArea && "md:hidden lg:flex")}>
            <span className="font-heading text-[13px] font-semibold whitespace-nowrap text-primary sm:text-base">
              Portal de Empleo
            </span>
            <span className="hidden text-[11px] whitespace-nowrap text-muted-foreground min-[400px]:block sm:text-xs">Municipalidad de Funes</span>
          </span>
        </Link>

        {enArea ? (
          <div className="flex flex-1 justify-center self-stretch">{navegacion}</div>
        ) : (
          <div className="flex-1" />
        )}

        <nav aria-label="Principal" className="flex min-w-0 items-center gap-0.5 sm:gap-2">
          {/* Companies and the Office browse the portal already and go back with "Mi panel":
              "Inicio" would repeat it and "Ofertas" is the page they are on (or their own tab) */}
          {!enArea &&
            inicio === "/" &&
            ENLACES.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={cn(
                  ENLACE,
                  "sm:inline-flex",
                  (enlace.enCelular === false || (enlace.enCelular === "sin-sesion" && sesion)) && "hidden",
                )}
              >
                {enlace.texto}
              </Link>
            ))}
          {sesion ? (
            <>
              {/* The Office's tabs have no room for it (five sections): the portal sits by "Salir" from md */}
              {enArea && sesion.rol === "admin" && (
                <Link href={HREF_VER_PORTAL} title="Ver portal" className={cn(ENLACE, "hidden items-center gap-1.5 text-muted-foreground md:inline-flex")}>
                  <Eye aria-hidden className="size-4" />
                  <span className="sr-only xl:not-sr-only">Ver portal</span>
                </Link>
              )}
              {!enArea && (
                <Link href={AREA_POR_ROL[sesion.rol]} className={cn(ENLACE, conBarra && "hidden md:inline-flex")}>
                  Mi panel
                </Link>
              )}
              <form action={salir}>
                <button
                  type="submit"
                  className={buttonVariants({ variant: "outline", size: "lg", className: "px-2 sm:px-3" })}
                >
                  <LogOut aria-hidden />
                  <span className="sr-only sm:not-sr-only">Salir</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/registro" className={cn(ENLACE, "hidden sm:inline-flex")}>
                Crear cuenta
              </Link>
              <Link href="/ingresar" className={buttonVariants({ size: "lg", className: "px-2.5 hover:bg-primary-hover sm:px-3" })}>
                Ingresar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
