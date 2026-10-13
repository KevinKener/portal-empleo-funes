import type { Metadata } from "next";
import Link from "next/link";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi panel" };

/** Job seeker home. Profile, CV and applications arrive in Phase 4. */
export default async function PostulantePage() {
  const supabase = await createClient();
  // RLS returns only the signed-in job seeker's own row
  const { data: postulante } = await supabase.from("postulantes").select("nombre").maybeSingle();

  return (
    <PanelBienvenida
      saludo={postulante ? `¡Hola, ${postulante.nombre}!` : "¡Hola!"}
      descripcion="Desde acá vas a poder completar tu perfil, subir tu CV y seguir tus postulaciones."
    >
      <div className="rounded-xl border border-border bg-secondary p-5 text-secondary-foreground">
        <p className="font-medium">Muy pronto vas a poder completar tu perfil y postularte.</p>
        <p className="mt-1 text-sm">Mientras tanto, mirá las ofertas publicadas.</p>
      </div>
      <Link href="/ofertas" className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}>
        Ver ofertas
      </Link>
    </PanelBienvenida>
  );
}
