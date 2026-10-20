import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { MarcoAuth } from "@/components/auth/MarcoAuth";
import { Escudo } from "@/components/layout/Escudo";
import { destinoTrasIngresar, obtenerSesion } from "@/lib/auth";

export const metadata: Metadata = { title: "Ingresar" };

/** Sign-in page. `?siguiente=` is the page to return to (set by the proxy). */
export default async function IngresarPage({ searchParams }: PageProps<"/ingresar">) {
  const { siguiente } = await searchParams;
  const destino = typeof siguiente === "string" ? siguiente : null;

  const sesion = await obtenerSesion();
  if (sesion) redirect(destinoTrasIngresar(destino, sesion.rol));

  return (
    <MarcoAuth>
      <div className="space-y-6">
        <div className="space-y-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary shadow-inner motion-safe:animate-festejo-pop">
            <Escudo className="size-9 text-primary" />
          </span>
          <div className="space-y-1">
            <h1 className="font-heading text-3xl font-bold">Ingresá a tu cuenta</h1>
            <p className="text-muted-foreground">Con tu DNI, tu CUIT o tu email.</p>
          </div>
        </div>
        <FormularioIngreso siguiente={destino} />
      </div>
    </MarcoAuth>
  );
}
