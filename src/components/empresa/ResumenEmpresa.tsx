import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Clock, FilePen, Globe, MessagesSquare, Users, XCircle, type LucideIcon } from "lucide-react";
import type { EstadoOferta } from "@/lib/estados";
import type { ResumenEmpresa as Resumen } from "@/lib/panel-empresa";
import { cn } from "@/lib/utils";

type Estado = Exclude<EstadoOferta, "cerrada">;

// Offer stages in the order they happen; the bar uses the same colors
const ESTADOS: { estado: Estado; texto: (n: number) => string; Icono: LucideIcon; barra: string }[] = [
  { estado: "borrador", texto: (n) => (n === 1 ? "Borrador" : "Borradores"), Icono: FilePen, barra: "bg-muted-foreground/30" },
  { estado: "pendiente", texto: () => "En revisión", Icono: Clock, barra: "bg-primary/40" },
  { estado: "publicada", texto: (n) => (n === 1 ? "Publicada" : "Publicadas"), Icono: Globe, barra: "bg-primary" },
  { estado: "rechazada", texto: (n) => (n === 1 ? "Rechazada" : "Rechazadas"), Icono: XCircle, barra: "bg-destructive/70" },
];

/**
 * At-a-glance numbers of the company: offers by stage (each opens "Mis
 * ofertas" filtered) and the candidates funnel, from pre-selected to hired.
 * Numbers count up; zeros stay quiet.
 */
export function ResumenEmpresa({ resumen }: { resumen: Resumen }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Ofertas resumen={resumen} />
      <Candidatos resumen={resumen} />
    </div>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
        <Link href="/empresa/ofertas" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Ver todas
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Ofertas({ resumen }: { resumen: Resumen }) {
  const total = ESTADOS.reduce((suma, { estado }) => suma + resumen[estado], 0);

  return (
    <Tarjeta titulo="Tus ofertas">
      {/* How the offers split by stage, filling from the left */}
      {total > 0 && (
        <div aria-hidden className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          {ESTADOS.filter(({ estado }) => resumen[estado] > 0).map(({ estado, barra }, i) => (
            <span
              key={estado}
              className={cn("h-full origin-left first:rounded-l-full last:rounded-r-full motion-safe:animate-llenar-x", barra)}
              style={{ width: `${(resumen[estado] / total) * 100}%`, "--retraso": `${150 + i * 120}ms` } as CSSProperties}
            />
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-2.5">
        {ESTADOS.map(({ estado, texto, Icono, barra }, i) => {
          const valor = resumen[estado];
          const atencion = estado === "rechazada" && valor > 0;
          return (
            <li key={estado}>
              <Link
                href={`/empresa/ofertas?estado=${estado}`}
                className={cn(
                  "group flex h-full items-center gap-3 rounded-xl border p-3 transition-[border-color,box-shadow,translate] duration-200 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5",
                  atencion ? "border-destructive/30 bg-destructive/5" : "border-transparent bg-muted hover:border-primary/30",
                  valor === 0 && "opacity-70",
                )}
              >
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
                  <Icono aria-hidden className={cn("size-4", atencion && "text-destructive")} />
                  {/* Color key of the bar above */}
                  <span aria-hidden className={cn("absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card", barra)} />
                </span>
                <span className="min-w-0">
                  <span
                    aria-hidden
                    className="contador block font-heading text-2xl leading-none font-bold"
                    style={{ "--hasta": valor, "--retraso": `${i * 90}ms` } as CSSProperties}
                  />
                  <span className="mt-0.5 block text-xs leading-tight font-medium">
                    <span className="sr-only">{valor} </span>
                    {texto(valor)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Tarjeta>
  );
}

function Candidatos({ resumen }: { resumen: Resumen }) {
  // Rule 1: the company only ever sees candidates the Office pre-selected
  // `corto` fits three boxes on a 360 px phone
  const etapas: { valor: number; texto: string; corto: string; Icono: LucideIcon }[] = [
    { valor: resumen.candidatos, texto: "Preseleccionados", corto: "Recibidos", Icono: Users },
    { valor: resumen.enEntrevista, texto: "En entrevista", corto: "Entrevista", Icono: MessagesSquare },
    { valor: resumen.contratados, texto: resumen.contratados === 1 ? "Contratado" : "Contratados", corto: "Contratados", Icono: BadgeCheck },
  ];

  return (
    <Tarjeta titulo="Candidatos">
      <ol className="flex items-stretch gap-1.5" aria-label="Del candidato a la contratación">
        {etapas.map(({ valor, texto, corto, Icono }, i) => (
          <li key={texto} className="flex min-w-0 flex-1 items-center gap-1.5">
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-1.5 py-3 text-center motion-safe:animate-entrada",
                // The further the stage, the stronger the green
                valor === 0 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-primary text-primary-foreground" : i === 1 ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground",
              )}
              style={{ "--retraso": `${i * 120}ms` } as CSSProperties}
            >
              <Icono aria-hidden className="size-5" />
              <span aria-hidden className="contador font-heading text-2xl leading-none font-bold" style={{ "--hasta": valor, "--retraso": `${150 + i * 120}ms` } as CSSProperties} />
              <span className="text-xs leading-tight font-medium">
                <span className="sr-only">{valor} </span>
                <span className="sm:hidden">{corto}</span>
                <span className="hidden sm:inline">{texto}</span>
              </span>
            </div>
            {i < etapas.length - 1 && <ChevronRight aria-hidden className="hidden size-4 shrink-0 text-muted-foreground sm:block" />}
          </li>
        ))}
      </ol>
      {resumen.paraDecidir > 0 ? (
        <p className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium text-secondary-foreground">
          <span aria-hidden className="relative flex size-2.5">
            <span className="absolute inset-0 rounded-full bg-primary/60 motion-safe:animate-ping" />
            <span className="relative size-2.5 rounded-full bg-primary" />
          </span>
          {resumen.paraDecidir === 1 ? "1 candidato espera tu decisión." : `${resumen.paraDecidir} candidatos esperan tu decisión.`}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {resumen.candidatos === 0
            ? "Cuando la Oficina de Empleo te preseleccione candidatos, los vas a ver acá."
            : "Estás al día: no hay candidatos esperando tu decisión."}
        </p>
      )}
    </Tarjeta>
  );
}
