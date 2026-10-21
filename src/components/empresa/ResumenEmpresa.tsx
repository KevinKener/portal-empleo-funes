import Link from "next/link";
import { BadgeCheck, Clock, FilePen, Globe, UserSearch, Users, XCircle, type LucideIcon } from "lucide-react";
import type { ResumenEmpresa as Resumen } from "@/lib/panel-empresa";
import { cn } from "@/lib/utils";

type Dato = { valor: number; texto: string; Icono: LucideIcon; destacado?: boolean };

/**
 * At-a-glance numbers of the company: offers by stage and candidates. Only
 * what needs attention is highlighted; zeros stay quiet.
 */
export function ResumenEmpresa({ resumen }: { resumen: Resumen }) {
  const ofertas: Dato[] = [
    { valor: resumen.borrador, texto: resumen.borrador === 1 ? "Borrador" : "Borradores", Icono: FilePen },
    { valor: resumen.pendiente, texto: "En revisión", Icono: Clock },
    { valor: resumen.publicada, texto: resumen.publicada === 1 ? "Publicada" : "Publicadas", Icono: Globe },
    { valor: resumen.rechazada, texto: resumen.rechazada === 1 ? "Rechazada" : "Rechazadas", Icono: XCircle, destacado: resumen.rechazada > 0 },
  ];
  const candidatos: Dato[] = [
    { valor: resumen.candidatos, texto: resumen.candidatos === 1 ? "Candidato" : "Candidatos", Icono: Users },
    { valor: resumen.porRevisar, texto: "Por revisar", Icono: UserSearch, destacado: resumen.porRevisar > 0 },
    { valor: resumen.contratados, texto: resumen.contratados === 1 ? "Contratado" : "Contratados", Icono: BadgeCheck },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Grupo titulo="Tus ofertas" datos={ofertas} />
      <Grupo titulo="Candidatos" datos={candidatos} />
    </div>
  );
}

function Grupo({ titulo, datos }: { titulo: string; datos: Dato[] }) {
  return (
    <section aria-label={titulo} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
        <Link href="/empresa/ofertas" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Ver todas
        </Link>
      </div>
      {/* Same tiles as the job seeker's summary: icon, big number, label */}
      <dl className={cn("mt-4 grid grid-cols-2 gap-2.5", datos.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
        {datos.map(({ valor, texto, Icono, destacado }) => (
          <div key={texto} className={cn("flex items-center gap-3 rounded-xl p-3 sm:flex-col sm:items-start sm:gap-2", destacado ? "bg-secondary text-secondary-foreground" : "bg-muted")}>
            <span
              aria-hidden
              className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", destacado ? "bg-primary text-primary-foreground" : "bg-card text-primary")}
            >
              <Icono className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col-reverse">
              <dt className="text-xs font-medium">{texto}</dt>
              <dd className={cn("font-heading text-xl leading-none font-bold", valor === 0 && "text-muted-foreground")}>{valor}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
