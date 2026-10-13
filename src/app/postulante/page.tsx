import type { Metadata } from "next";
import Link from "next/link";
import { ListaTareas } from "@/components/postulante/ListaTareas";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { obtenerResumenPerfil, puedePostularse, tareasDelPerfil } from "@/lib/perfil-postulante";
import { listarMisPostulaciones } from "@/lib/postulaciones";
import { textoEstadoPostulacion } from "@/lib/formato";

export const metadata: Metadata = { title: "Mi panel" };

/** Job seeker home: profile checklist and, once ready, the way to the offers. */
export default async function PostulantePage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  const recientes = resumen ? await listarMisPostulaciones(resumen.postulante.id, 3) : [];

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
          {recientes.length > 0 && (
            <div className="space-y-2 border-t border-primary/20 pt-4">
              <h2 className="font-heading font-semibold">Tus últimas postulaciones</h2>
              <ul className="space-y-2 text-sm">
                {recientes.map((postulacion) => (
                  <li key={postulacion.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{postulacion.oferta?.titulo ?? "Oferta"}</span>
                    <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-xs font-medium">
                      {textoEstadoPostulacion(postulacion.estado, postulacion.motivo_rechazo).titulo}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/postulante/postulaciones" className="inline-block text-sm font-medium underline underline-offset-4">
                Ver todas
              </Link>
            </div>
          )}
        </aside>
      </div>
    </PanelBienvenida>
  );
}
