import Image from "next/image";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { ArrowRight, Building2, ClipboardCheck, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TarjetaOferta } from "@/components/ofertas/TarjetaOferta";
import { listarOfertasPublicas, type OfertaPublica } from "@/lib/ofertas";

const PASOS = [
  {
    icono: UserRound,
    titulo: "Te registrás y armás tu perfil",
    texto: "Cargá tus datos y tu CV, o subilo en PDF. Elegí los rubros en los que te gustaría trabajar.",
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

// The landing must render even if the database is down; the offers block just hides.
async function ultimasOfertas(): Promise<OfertaPublica[] | null> {
  try {
    const { ofertas } = await listarOfertasPublicas({ categoria: null, pagina: 1 });
    return ofertas.slice(0, 3);
  } catch (error) {
    // Next's own control-flow errors (e.g. dynamic rendering bailout) must keep propagating.
    unstable_rethrow(error);
    console.error(error);
    return null;
  }
}

export default async function HomePage() {
  const ofertas = await ultimasOfertas();

  return (
    <>
      <section className="bg-primary-deep text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 md:grid-cols-[1fr_auto]">
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
              Oficina de Empleo · Municipalidad de Funes
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-5xl">
              Encontrá trabajo cerca de casa
            </h1>
            <p className="max-w-xl text-lg text-primary-foreground/85">
              Ofertas laborales de empresas de Funes, revisadas por la Municipalidad. Postulate y la Oficina de
              Empleo te acompaña en todo el proceso.
            </p>
            <Link
              href="/ofertas"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "h-11 px-5 text-base",
              })}
            >
              Ver ofertas <ArrowRight aria-hidden />
            </Link>
          </div>
          <div className="hidden rounded-full bg-primary-foreground p-8 md:block">
            <Image src="/marca/escudo.png" alt="Escudo de la Ciudad de Funes" width={160} height={167} priority />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Últimas ofertas</h2>
          <Link href="/ofertas" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        {ofertas === null ? (
          <p className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
            No pudimos cargar las ofertas en este momento. Probá de nuevo en unos minutos.
          </p>
        ) : ofertas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-6 text-muted-foreground">
            Todavía no hay ofertas publicadas. ¡Volvé pronto!
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ofertas.map((oferta) => (
              <li key={oferta.id}>
                <TarjetaOferta oferta={oferta} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:py-16">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">¿Cómo funciona?</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icono aria-hidden className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">Paso {i + 1}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold">{titulo}</h3>
                <p className="text-muted-foreground">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
