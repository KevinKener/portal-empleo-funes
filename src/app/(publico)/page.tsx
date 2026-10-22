import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { ArrowRight, Building2, ClipboardCheck, UserRound } from "lucide-react";
import { Escudo } from "@/components/layout/Escudo";
import { FondoMarca } from "@/components/layout/FondoMarca";
import { Revelar } from "@/components/layout/Revelar";
import { PasosAnimados } from "@/components/portada/PasosAnimados";
import { RubrosFlotantes } from "@/components/portada/RubrosFlotantes";
import { inicioDe, obtenerSesion } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { CarruselOfertas } from "@/components/ofertas/CarruselOfertas";
import { TarjetaOferta } from "@/components/ofertas/TarjetaOferta";
import { listarOfertasPublicas, type OfertaPublica } from "@/lib/ofertas";

const PASOS = [
  {
    icono: UserRound,
    titulo: "Te registrás y armás tu perfil",
    texto: "Cargá tus datos y tu CV, o subí el que ya tenés. Elegí los rubros en los que te gustaría trabajar.",
  },
  {
    icono: ClipboardCheck,
    titulo: "La Oficina de Empleo te acompaña",
    texto: "Revisamos cada postulación y presentamos a las personas preseleccionadas a la empresa.",
  },
  {
    icono: Building2,
    titulo: "La empresa te contacta",
    texto: "Las empresas de Funes publican sus búsquedas, siempre verificadas por la Municipalidad.",
  },
];

const TITULO_OFERTAS = <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Últimas ofertas</h2>;

const VER_TODAS = (
  <Link href="/ofertas" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
    Ver todas
  </Link>
);

// The landing must render even if the database is down; the offers block just hides.
async function ultimasOfertas(): Promise<OfertaPublica[] | null> {
  try {
    // Urgent offers first, then the newest: the carousel is where they get seen.
    // A first page is enough; "Ver todas" leads to the full list.
    const { ofertas } = await listarOfertasPublicas({ categoria: null, pagina: 1, orden: "urgentes" });
    return ofertas.slice(0, 9);
  } catch (error) {
    // Next's own control-flow errors (e.g. dynamic rendering bailout) must keep propagating.
    unstable_rethrow(error);
    console.error(error);
    return null;
  }
}

/** Category names for the hero's floating chips; decorative, so a failure just shows none. */
async function nombresDeRubros(): Promise<string[]> {
  try {
    return (await listarCategorias()).map((categoria) => categoria.nombre);
  } catch (error) {
    unstable_rethrow(error);
    return [];
  }
}

export default async function HomePage() {
  // Companies and the Office land on their panel (the session is already read for the header)
  const inicio = inicioDe(await obtenerSesion());
  if (inicio !== "/") redirect(inicio);

  const [ofertas, rubros] = await Promise.all([ultimasOfertas(), nombresDeRubros()]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary-deep text-primary-foreground">
        <FondoMarca />
        <RubrosFlotantes rubros={rubros} />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl space-y-6">
            {/* Speech bubble: the Municipality speaking to the neighbour */}
            <p className="relative inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md bg-primary-foreground py-2 pr-4 pl-2 text-sm font-semibold text-primary-deep shadow-xl shadow-black/25 motion-safe:animate-entrada">
              <span className="flex size-8 items-center justify-center rounded-xl bg-secondary">
                <Escudo className="size-6 text-primary" />
              </span>
              Oficina de Empleo de la Municipalidad de Funes
              <span aria-hidden className="absolute -bottom-1.5 left-3 size-3 rotate-45 rounded-[2px] bg-primary-foreground" />
            </p>
            <h1
              className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance motion-safe:animate-entrada sm:text-6xl"
              style={{ "--retraso": "80ms" } as CSSProperties}
            >
              Encontrá trabajo cerca de casa
            </h1>
            <p
              className="max-w-xl text-lg text-primary-foreground/85 motion-safe:animate-entrada sm:text-xl"
              style={{ "--retraso": "160ms" } as CSSProperties}
            >
              Ofertas de empresas de Funes, revisadas por la Municipalidad. Postulate y la Oficina de Empleo te acompaña
              en todo el proceso.
            </p>
            <div
              className="flex flex-col gap-3 pt-2 motion-safe:animate-entrada sm:flex-row"
              style={{ "--retraso": "240ms" } as CSSProperties}
            >
              {/* Explicit colors: on the dark green a generic variant's hover lost contrast */}
              <Link
                href="/ofertas"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary-deep shadow-lg shadow-black/20 transition-[background-color,transform] duration-150 hover:bg-secondary focus-visible:ring-4 focus-visible:ring-primary-foreground/40 focus-visible:outline-none active:scale-[0.98]"
              >
                Ver ofertas
                <ArrowRight aria-hidden className="size-5 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/registro"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-primary-foreground/30 px-6 text-base font-semibold text-primary-foreground transition-colors duration-150 hover:border-primary-foreground/60 hover:bg-primary-foreground/10 focus-visible:ring-4 focus-visible:ring-primary-foreground/40 focus-visible:outline-none active:scale-[0.98]"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {ofertas && ofertas.length > 0 ? (
          <Revelar>
            <CarruselOfertas titulo={TITULO_OFERTAS} extra={VER_TODAS}>
              {ofertas.map((oferta) => (
                <TarjetaOferta key={oferta.id} oferta={oferta} />
              ))}
            </CarruselOfertas>
          </Revelar>
        ) : (
          <div className="space-y-6">
            {TITULO_OFERTAS}
            <p className="rounded-xl border border-dashed border-border bg-card p-6 text-muted-foreground">
              {ofertas === null
                ? "No pudimos cargar las ofertas en este momento. Probá de nuevo en unos minutos."
                : "Todavía no hay ofertas publicadas. ¡Volvé pronto!"}
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="space-y-3 md:text-center">
            <h2 className="font-heading text-2xl font-semibold sm:text-4xl">¿Cómo funciona?</h2>
            <p className="text-muted-foreground md:mx-auto md:max-w-xl">
              Tres pasos, con la Oficina de Empleo acompañándote en el medio.
            </p>
          </div>
          <PasosAnimados pasos={PASOS.map(({ icono: Icono, ...paso }) => ({ ...paso, icono: <Icono aria-hidden className="size-7" /> }))} />
          {/* The step that comes after reading how it works */}
          <div className="flex md:justify-center">
            <Link
              href="/registro"
              className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-[background-color,transform] duration-150 hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none active:scale-[0.98]"
            >
              Crear mi cuenta
              <ArrowRight aria-hidden className="size-5 transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
