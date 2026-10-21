import type { CSSProperties } from "react";
import Link from "next/link";
import { AlarmClock, ArrowRight, Building2, FileSearch, Home, SearchX, UserSearch, type LucideIcon } from "lucide-react";
import { DIAS_DEMORA, diasEsperando, type Cola, type TipoCola } from "@/lib/admin/bandeja";
import { haceCuanto } from "@/lib/formato";
import { cn } from "@/lib/utils";

type DatosCola = {
  Icono: LucideIcon;
  titulo: string;
  href: string;
  accion: string;
  /** Line under the title built from `detalle`, or null. */
  detalle: (n: number) => string | null;
  /** What "waiting" means for this queue, before the age ("Se envió" hace 2 días). */
  espera: string;
  /** How the oldest item is named when there are several ("La más antigua: hace 3 días"). */
  antigua: string;
};

// Sections arrive branch by branch (admin.md §5); the links already point to them.
export const COLAS: Record<TipoCola, DatosCola> = {
  ofertas: {
    Icono: FileSearch,
    titulo: "Ofertas por revisar",
    href: "/admin/ofertas?estado=pendiente",
    accion: "Revisar ofertas",
    detalle: (n) => (n === 0 ? null : n === 1 ? "1 urgente" : `${n} urgentes`),
    espera: "Se envió",
    antigua: "La más antigua",
  },
  empresas: {
    Icono: Building2,
    titulo: "Empresas por verificar",
    href: "/admin/empresas?estado=pendiente",
    accion: "Verificar empresas",
    detalle: () => null,
    espera: "Se registró",
    antigua: "La primera",
  },
  postulaciones: {
    Icono: UserSearch,
    titulo: "Postulaciones por revisar",
    // Published offers with applications to review sort first there
    href: "/admin/ofertas?estado=publicada",
    accion: "Preseleccionar",
    detalle: (n) => (n === 1 ? "En 1 oferta" : `En ${n} ofertas`),
    espera: "Llegó",
    antigua: "La más antigua",
  },
  domicilios: {
    Icono: Home,
    titulo: "Domicilios por verificar",
    href: "/admin/postulantes",
    accion: "Ver comprobantes",
    detalle: () => "Vecinos de Funes",
    espera: "Se subió",
    antigua: "El más antiguo",
  },
  "sin-postulantes": {
    Icono: SearchX,
    titulo: "Ofertas sin postulantes",
    href: "/admin/ofertas?estado=sin-postulantes",
    accion: "Ver ofertas",
    detalle: () => "Publicadas hace más de una semana",
    espera: "Se publicó",
    antigua: "La más antigua",
  },
};

/**
 * One work queue of the Bandeja: how many items, how long the oldest has
 * been waiting and the way in. Past DIAS_DEMORA the age turns amber with an
 * icon and words, never colour alone (`aviso` token, decision D7).
 */
export function ColaBandeja({ cola, momento, indice }: { cola: Cola; momento: number; indice: number }) {
  const { Icono, titulo, href, accion, detalle, espera, antigua } = COLAS[cola.tipo];
  const dias = cola.desde ? diasEsperando(cola.desde, momento) : 0;
  // Offers with no applicants are a nudge, not overdue work
  const demorada = cola.tipo !== "sin-postulantes" && dias > DIAS_DEMORA;
  const linea = detalle(cola.detalle);

  return (
    <li
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-[border-color,box-shadow,translate] duration-200 hover:shadow-md motion-safe:animate-entrada motion-safe:hover:-translate-y-0.5",
        demorada ? "border-aviso/40 hover:border-aviso/60" : "border-border hover:border-primary/40",
      )}
      style={{ "--retraso": `${indice * 90}ms` } as CSSProperties}
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icono aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading leading-snug font-semibold">
            {/* The whole card is the link; after:z-10 keeps it above the animated pieces */}
            <Link href={href} className="after:absolute after:inset-0 after:z-10 after:rounded-2xl focus-visible:outline-none">
              {titulo}
            </Link>
          </h3>
          {linea && <p className="text-sm text-muted-foreground">{linea}</p>}
        </div>
        <span
          aria-hidden
          className="contador font-heading text-4xl leading-none font-bold text-primary"
          style={{ "--hasta": cola.cantidad, "--retraso": `${150 + indice * 90}ms` } as CSSProperties}
        />
        <span className="sr-only">{cola.cantidad} pendientes</span>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
        {cola.desde &&
          (demorada ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-aviso-suave px-2.5 py-1 font-semibold text-aviso">
              <AlarmClock aria-hidden className="size-4" />
              Espera hace {dias} días
            </span>
          ) : (
            <span className="text-muted-foreground">
              {cola.cantidad === 1 ? `${espera} ${haceCuanto(cola.desde, momento)}` : `${antigua}: ${haceCuanto(cola.desde, momento)}`}
            </span>
          ))}
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          {accion}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
      {/* Group-wide focus ring, since the link itself is the invisible overlay */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-ring/50 group-has-[:focus-visible]:ring-3" />
    </li>
  );
}
