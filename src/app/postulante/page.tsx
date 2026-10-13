import type { Metadata } from "next";
import Link from "next/link";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { obtenerResumenPerfil, puedePostularse, tareasDelPerfil } from "@/lib/perfil-postulante";

export const metadata: Metadata = { title: "Mi panel" };

/** Job seeker home: profile checklist and, once ready, the way to the offers. */
export default async function PostulantePage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);

  return (
    <PanelBienvenida
      saludo={resumen ? `¡Hola, ${resumen.postulante.nombre}!` : "¡Hola!"}
      descripcion="Completá tu perfil y postulate a las ofertas. La Oficina de Empleo revisa cada postulación antes de enviarla a la empresa."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        {resumen && <ListaTareas tareas={tareasDelPerfil(resumen)} />}
        <aside className="space-y-3 rounded-2xl border border-border bg-secondary p-5 text-secondary-foreground sm:p-6">
          <h2 className="font-heading text-lg font-semibold">Ofertas de trabajo</h2>
          <p className="text-sm">
            {resumen && puedePostularse(resumen)
              ? "Tu perfil está listo. Buscá una oferta que te interese y postulate."
              : "Podés mirar las ofertas ahora y postularte cuando completes tu perfil."}
          </p>
          <Link href="/ofertas" className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover" })}>
            Ver ofertas
          </Link>
        </aside>
      </div>
    </PanelBienvenida>
  );
}
