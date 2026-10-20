import Link from "next/link";
import type { ResumenEmpresa as Resumen } from "@/lib/panel-empresa";
import { cn } from "@/lib/utils";

type Dato = { valor: number; texto: string; destacado?: boolean };

/**
 * At-a-glance numbers of the company: offers by stage and candidates. Only
 * what needs attention is highlighted; zeros stay quiet.
 */
export function ResumenEmpresa({ resumen }: { resumen: Resumen }) {
  const ofertas: Dato[] = [
    { valor: resumen.borrador, texto: resumen.borrador === 1 ? "Borrador" : "Borradores" },
    { valor: resumen.pendiente, texto: "En revisión" },
    { valor: resumen.publicada, texto: resumen.publicada === 1 ? "Publicada" : "Publicadas" },
    { valor: resumen.rechazada, texto: resumen.rechazada === 1 ? "Rechazada" : "Rechazadas", destacado: resumen.rechazada > 0 },
  ];
  const candidatos: Dato[] = [
    { valor: resumen.candidatos, texto: resumen.candidatos === 1 ? "Candidato" : "Candidatos" },
    { valor: resumen.porRevisar, texto: "Por revisar", destacado: resumen.porRevisar > 0 },
    { valor: resumen.contratados, texto: resumen.contratados === 1 ? "Contratado" : "Contratados" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[4fr_3fr]">
      <Grupo titulo="Tus ofertas" datos={ofertas} />
      <Grupo titulo="Candidatos" datos={candidatos} />
    </div>
  );
}

function Grupo({ titulo, datos }: { titulo: string; datos: Dato[] }) {
  return (
    <section aria-label={titulo} className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
        <Link href="/empresa/ofertas" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Ver todas
        </Link>
      </div>
      <dl className={cn("mt-3 grid gap-2", datos.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        {datos.map(({ valor, texto, destacado }) => (
          <div key={texto} className={cn("rounded-xl p-3", destacado ? "bg-secondary text-secondary-foreground" : "bg-muted")}>
            <dt className="text-xs text-muted-foreground">{texto}</dt>
            <dd className={cn("font-heading text-2xl font-bold", valor === 0 && "text-muted-foreground")}>{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
