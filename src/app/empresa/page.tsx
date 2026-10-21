import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck, Compass, FilePlus2, FileText } from "lucide-react";
import { AvisoEmpresaSinVerificar } from "@/components/empresa/AvisoEmpresaSinVerificar";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { ResumenEmpresa } from "@/components/empresa/ResumenEmpresa";
import { PanelBienvenida } from "@/components/layout/PanelBienvenida";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { resumirCandidatosPorOferta } from "@/lib/candidatos-empresa";
import { urlLogo } from "@/lib/logo-empresa";
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
      extra={<AccesosEmpresa verificada={verificada} />}
      inicio={<LogoEmpresa nombre={empresa.nombre_comercial} logo={urlLogo(empresa.logo_url)} tamanio="lg" redondo />}
    >
      <AvisoEmpresaSinVerificar estado={empresa.estado} />

      {paso ? (
        // Same card as the job seeker's "Tu próximo paso"
        <section
          aria-labelledby="titulo-proximo-paso"
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary via-card to-card p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Compass aria-hidden className="size-6" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-primary">Tu próximo paso</p>
              <h2 id="titulo-proximo-paso" className="font-heading text-xl font-semibold sm:text-2xl">
                {paso.titulo}
              </h2>
              <p className="max-w-2xl text-muted-foreground">{paso.texto}</p>
              <Link
                href={paso.href}
                className={buttonVariants({ className: "group/accion mt-3 h-11 px-6 text-base shadow-md shadow-primary/20 hover:bg-primary-hover" })}
              >
                {paso.accion}
                <ArrowRight aria-hidden className="transition-transform group-hover/accion:translate-x-1" />
              </Link>
            </div>
          </div>
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

/** Quick actions inside the greeting band, on the green like the job seeker's. */
function AccesosEmpresa({ verificada }: { verificada: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {verificada && (
        <Link
          href="/empresa/ofertas/nueva"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-foreground px-4 text-sm font-semibold text-primary-deep shadow-lg shadow-black/20 transition-[background-color,transform] hover:bg-secondary active:scale-[0.98]"
        >
          <FilePlus2 aria-hidden className="size-4" />
          Nueva oferta
        </Link>
      )}
      <Link
        href="/empresa/ofertas"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary-foreground/30 px-4 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
      >
        <FileText aria-hidden className="size-4" />
        Mis ofertas
      </Link>
    </div>
  );
}
