import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { salir } from "@/app/(publico)/ingresar/actions";
import { buttonVariants } from "@/components/ui/button";
import { AREA_POR_ROL, obtenerSesion } from "@/lib/auth";
import { cn } from "@/lib/utils";

// On phones the shield already links home, and signed-in people reach the
// offers from their area, so those links only show from sm to keep the bar on one line.
const ENLACES = [
  { href: "/", texto: "Inicio", enCelular: false },
  { href: "/ofertas", texto: "Ofertas", enCelular: "sin-sesion" },
] as const;

/**
 * Site header: municipal brand, main navigation and the account entry
 * point (sign in / create account, or my area / sign out with a session).
 */
export async function Encabezado() {
  const sesion = await obtenerSesion();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <Image src="/marca/escudo.png" alt="" width={32} height={33} priority />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-heading text-[13px] font-semibold text-primary sm:text-base">
              Portal de Empleo
            </span>
            <span className="truncate text-[11px] text-muted-foreground sm:text-xs">Municipalidad de Funes</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={cn(
                "rounded-md px-1.5 py-1.5 text-sm font-medium whitespace-nowrap text-foreground hover:bg-accent hover:text-accent-foreground sm:inline-flex sm:px-3",
                (enlace.enCelular === false || (enlace.enCelular === "sin-sesion" && sesion)) && "hidden",
              )}
            >
              {enlace.texto}
            </Link>
          ))}
          {sesion ? (
            <>
              <Link
                href={AREA_POR_ROL[sesion.rol]}
                className="rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap text-foreground hover:bg-accent hover:text-accent-foreground sm:px-3"
              >
                Mi panel
              </Link>
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
              <Link
                href="/registro"
                className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground sm:inline-flex"
              >
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
