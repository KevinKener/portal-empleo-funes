import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Rol = "postulante" | "empresa" | null;

/**
 * Success state after confirming the email. Rendered by the code form and
 * also by the page itself: confirming changes cookies, so Next re-renders
 * the route right after the Server Action.
 */
export function CuentaConfirmada({ rol }: { rol: Rol }) {
  // TODO(phase-3): send job seekers to /postulante once that area exists (PR B).
  const destino =
    rol === "empresa" ? { href: "/empresa", texto: "Ir a mi empresa" } : { href: "/ofertas", texto: "Ver ofertas" };

  return (
    <div className="space-y-4 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500">
      <CircleCheck
        aria-hidden
        className="mx-auto size-16 text-primary motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-700"
      />
      <h1 className="font-heading text-2xl font-bold">¡Cuenta confirmada!</h1>
      <p className="text-muted-foreground">
        {rol === "empresa"
          ? "La Oficina de Empleo va a revisar los datos de tu empresa. Mientras tanto podés ingresar, pero todavía no publicar ofertas."
          : "Ya podés ingresar con tu DNI y tu contraseña."}
      </p>
      <Link href={destino.href} className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}>
        {destino.texto}
      </Link>
    </div>
  );
}
