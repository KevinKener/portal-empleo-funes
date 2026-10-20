import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck } from "lucide-react";
import { AvisoEmpresaSinVerificar } from "@/components/empresa/AvisoEmpresaSinVerificar";
import { ResumenEmpresa } from "@/components/empresa/ResumenEmpresa";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { resumirCandidatosPorOferta } from "@/lib/candidatos-empresa";
import { listarOfertasEmpresa, obtenerEmpresaActual } from "@/lib/ofertas-empresa";
import { proximoPasoEmpresa, resumirEmpresa } from "@/lib/panel-empresa";

export const metadata: Metadata = { title: "Inicio" };

/** Company home: the next step, then offers and candidates at a glance. */
export default async function EmpresaPage() {
  const { userId } = await requerirRol("empresa");
  const empresa = await obtenerEmpresaActual(userId);
  if (!empresa) notFound();

  const [ofertas, candidatos] = await Promise.all([listarOfertasEmpresa(empresa.id), resumirCandidatosPorOferta()]);
  const paso = proximoPasoEmpresa(empresa, ofertas, candidatos);
  const verificada = empresa.estado === "verificado";

  return (
    <PanelBienvenida
      saludo={`¡Hola, ${empresa.nombre_comercial}!`}
      descripcion="Publicá tus búsquedas y recibí los candidatos que te preselecciona la Oficina de Empleo."
    >
      <AvisoEmpresaSinVerificar estado={empresa.estado} />

      {paso ? (
        <section aria-labelledby="titulo-proximo-paso" className="rounded-2xl border border-primary/20 bg-card p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Próximo paso</p>
          <h2 id="titulo-proximo-paso" className="mt-1 font-heading text-xl font-semibold">
            {paso.titulo}
          </h2>
          <p className="mt-1 max-w-2xl text-muted-foreground">{paso.texto}</p>
          <Link href={paso.href} className={buttonVariants({ className: "mt-4 h-11 px-6 text-base hover:bg-primary-hover" })}>
            {paso.accion}
            <ArrowRight aria-hidden />
          </Link>
        </section>
      ) : (
        verificada && (
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex gap-3">
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Estás al día.</p>
                <p className="text-sm text-muted-foreground">
                  Te avisamos acá cuando la Oficina de Empleo te preseleccione candidatos.
                </p>
              </div>
            </div>
            <Link href="/empresa/ofertas/nueva" className={buttonVariants({ variant: "outline", className: "h-11 shrink-0 px-5 text-base" })}>
              Cargar otra oferta
            </Link>
          </section>
        )
      )}

      {ofertas.length > 0 && <ResumenEmpresa resumen={resumirEmpresa(ofertas, candidatos)} />}
    </PanelBienvenida>
  );
}
