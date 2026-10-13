import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { MarcoAuth } from "@/components/auth/MarcoAuth";
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
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold">Ingresar</h1>
          <p className="text-muted-foreground">Entrá a tu cuenta del Portal de Empleo.</p>
        </div>
        <FormularioIngreso siguiente={destino} />
      </div>
    </MarcoAuth>
  );
}
