import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import { AlarmClock, ArrowRight, Building2, CalendarDays, CircleAlert, CircleCheck, FileCheck2, FileText, Hash, MapPin, Phone, RotateCcw } from "lucide-react";
import { AccionesEmpresa } from "@/components/admin/AccionesEmpresa";
import { BotonConstancia } from "@/components/admin/BotonConstancia";
import { EtiquetaEmpresaAdmin } from "@/components/admin/EtiquetaEmpresaAdmin";
import { EtiquetaOfertaAdmin } from "@/components/admin/EtiquetaOfertaAdmin";
import { LogoEmpresa } from "@/components/empresa/LogoEmpresa";
import { EnlaceVolver } from "@/components/layout/EnlaceVolver";
import { DIAS_DEMORA, diasEsperando } from "@/lib/admin/bandeja";
import { obtenerEmpresaAdmin, siguienteEmpresaPendiente } from "@/lib/admin/empresas";
import { requerirRol } from "@/lib/auth";
import { ahora, formatearCuit, formatearFecha, haceCuanto } from "@/lib/formato";
import { urlLogo } from "@/lib/logo-empresa";
import { esUuid } from "@/lib/validaciones/ofertas";
import { cuitValido } from "@/lib/validaciones/auth";

// Deduplicated per request: generateMetadata and the page read the same company.
const cargar = cache(async (id: string) => {
  await requerirRol("admin");
  return esUuid(id) ? obtenerEmpresaAdmin(id) : null;
});

export async function generateMetadata({ params }: PageProps<"/admin/empresas/[id]">): Promise<Metadata> {
  const empresa = await cargar((await params).id);
  return { title: empresa?.nombre_comercial ?? "Empresa no encontrada" };
}

const TEXTO_ESTADO = {
  pendiente: "Espera tu verificación. Mientras tanto puede entrar y completar su perfil, pero no cargar ofertas.",
  verificado: "Puede cargar ofertas y enviarlas a revisión.",
  rechazado: "Ve el motivo en su panel. Si corrige sus datos, vuelve sola a “Por verificar”.",
} as const;

const TARJETA = "space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6";

/**
 * A company for the Office (branch C): its data with the CUIT checked, the
 * ARCA certificate, its offers, and verifying or rejecting it (Rule 3, D1).
 */
export default async function EmpresaAdminPage({ params }: PageProps<"/admin/empresas/[id]">) {
  const { id } = await params;
  const empresa = await cargar(id);
  if (!empresa) notFound();

  const momento = ahora();
  const pendiente = empresa.estado === "pendiente";
  const siguiente = pendiente ? null : await siguienteEmpresaPendiente(empresa.id);
  const espera = pendiente ? diasEsperando(empresa.updated_at, momento) : 0;
  // A pending company with a reason already went through one rejection (D1)
  const segundaRevision = pendiente && Boolean(empresa.motivo_rechazo);
  const cuitOk = cuitValido(empresa.cuit);

  return (
    <div className="space-y-6">
      <EnlaceVolver href={`/admin/empresas?estado=${empresa.estado}`} texto="Empresas" />

      <header className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-secondary via-card to-card p-5 shadow-sm motion-safe:animate-entrada sm:p-6">
        <LogoEmpresa nombre={empresa.nombre_comercial} logo={urlLogo(empresa.logo_url)} tamanio="md" className="sm:size-16 sm:text-2xl" />
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-2xl leading-tight font-bold text-balance sm:text-3xl">{empresa.nombre_comercial}</h1>
          <p className="text-muted-foreground">{empresa.razon_social}</p>
          <EtiquetaEmpresaAdmin estado={empresa.estado} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="titulo-datos" className={TARJETA}>
            <h2 id="titulo-datos" className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Building2 aria-hidden className="size-5 text-primary" /> Datos de la empresa
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Dato Icono={Hash} etiqueta="CUIT">
                <span className="tabular-nums">{formatearCuit(empresa.cuit)}</span>
                {cuitOk ? (
                  <span className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                    <CircleCheck aria-hidden className="size-3.5" /> El número es válido
                  </span>
                ) : (
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-destructive">
                    <CircleAlert aria-hidden className="size-3.5" /> El dígito verificador no coincide
                  </span>
                )}
              </Dato>
              <Dato Icono={FileText} etiqueta="Razón social">
                {empresa.razon_social}
              </Dato>
              <Dato Icono={Phone} etiqueta="Teléfono">
                <a href={`tel:${empresa.telefono.replace(/[^\d+]/g, "")}`} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {empresa.telefono}
                </a>
              </Dato>
              <Dato Icono={MapPin} etiqueta="Dirección">
                {empresa.direccion}
              </Dato>
              <Dato Icono={CalendarDays} etiqueta="Registro">
                {formatearFecha(empresa.created_at)}
              </Dato>
            </dl>
            <p className="text-xs text-muted-foreground">
              Para comprobar la razón social con el CUIT podés usar la constancia de ARCA o consultar el padrón en la web de ARCA.
            </p>
          </section>

          <section aria-labelledby="titulo-arca" className={TARJETA}>
            <h2 id="titulo-arca" className="flex items-center gap-2 font-heading text-lg font-semibold">
              <FileCheck2 aria-hidden className="size-5 text-primary" /> Constancia de ARCA
            </h2>
            {empresa.constancia_arca_url ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">La empresa subió su constancia de inscripción. Solo la ve la Oficina.</p>
                <BotonConstancia empresaId={empresa.id} />
              </div>
            ) : (
              <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                No la subió. Es opcional (regla 12), pero ayuda a verificar más rápido: si la necesitás, pedísela en el motivo del rechazo.
              </p>
            )}
          </section>

          <section aria-labelledby="titulo-ofertas" className={TARJETA}>
            <h2 id="titulo-ofertas" className="flex items-center gap-2 font-heading text-lg font-semibold">
              <FileText aria-hidden className="size-5 text-primary" /> Ofertas
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{empresa.ofertas.length}</span>
            </h2>
            {empresa.ofertas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {empresa.estado === "verificado" ? "Todavía no envió ninguna oferta." : "Va a poder cargar ofertas cuando la verifiques."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {empresa.ofertas.map((oferta) => (
                  <li key={oferta.id}>
                    <Link
                      href={`/admin/ofertas/${oferta.id}`}
                      className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium group-hover:text-primary">{oferta.titulo}</span>
                        <span className="block text-xs text-muted-foreground">Último cambio {haceCuanto(oferta.updated_at, momento)}</span>
                      </span>
                      <EtiquetaOfertaAdmin estado={oferta.estado} />
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-labelledby="titulo-verificacion" className={`${TARJETA} shadow-sm motion-safe:animate-entrada`}>
            <div className="space-y-2">
              <h2 id="titulo-verificacion" className="font-heading text-lg font-semibold">
                Verificación
              </h2>
              <p className="text-sm text-muted-foreground">{TEXTO_ESTADO[empresa.estado]}</p>
              {espera > DIAS_DEMORA && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-aviso-suave px-2.5 py-1 text-sm font-semibold text-aviso">
                  <AlarmClock aria-hidden className="size-4" /> Espera hace {espera} días
                </p>
              )}
              {segundaRevision && (
                <div className="space-y-1 rounded-lg border border-border bg-muted/50 p-3 text-sm">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <RotateCcw aria-hidden className="size-4 text-primary" /> Corrigió sus datos {haceCuanto(empresa.updated_at, momento)}
                  </p>
                  <p className="text-muted-foreground">La habías rechazado por:</p>
                  <p className="whitespace-pre-line text-foreground/85">{empresa.motivo_rechazo}</p>
                </div>
              )}
              {empresa.estado === "rechazado" && empresa.motivo_rechazo && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-semibold text-destructive">Motivo que lee la empresa</p>
                  <p className="mt-1 whitespace-pre-line text-foreground/85">{empresa.motivo_rechazo}</p>
                </div>
              )}
            </div>

            {pendiente && <AccionesEmpresa id={empresa.id} />}

            {siguiente && (
              <Link
                href={`/admin/empresas/${siguiente.id}`}
                className="group flex items-center justify-between gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
              >
                Verificar la siguiente ({siguiente.restantes} por verificar)
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Dato({ Icono, etiqueta, children }: { Icono: typeof Hash; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icono aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
        <dd className="break-words">{children}</dd>
      </div>
    </div>
  );
}
