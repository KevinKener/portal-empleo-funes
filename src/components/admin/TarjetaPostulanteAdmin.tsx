import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { InsigniaDomicilio } from "@/components/admin/InsigniaDomicilio";
import { PerfilBreve } from "@/components/admin/PerfilBreve";
import { Avatar } from "@/components/postulante/Avatar";
import type { FilaPostulanteAdmin } from "@/lib/admin/postulantes";
import { formatearDni, haceCuanto } from "@/lib/formato";
import { cn } from "@/lib/utils";

const RUBROS_VISIBLES = 3;

/**
 * A job seeker in the Office's directory (branch D2): photo, name, DNI, town
 * and address status, short profile, categories and applications. The whole
 * card opens the person's profile.
 */
export function TarjetaPostulanteAdmin({ fila, momento }: { fila: FilaPostulanteAdmin; momento: number }) {
  const { total, enCurso } = fila.postulaciones;
  const resto = fila.categorias.length - RUBROS_VISIBLES;

  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,translate] duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/[0.07] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 motion-safe:hover:-translate-y-0.5">
      <header className="flex items-center gap-3">
        <Avatar nombre={fila.nombre} apellido={fila.apellido} foto={fila.foto} encuadre={fila.encuadre} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-semibold">
            {/* The name link covers the whole card */}
            <Link
              href={`/admin/postulantes/${fila.id}`}
              className="text-foreground group-hover:text-primary after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
            >
              {fila.nombre} {fila.apellido}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">DNI {formatearDni(fila.dni)}</p>
        </div>
      </header>

      <InsigniaDomicilio localidad={fila.localidad} estado={fila.estadoDomicilio} tieneComprobante={fila.tieneComprobante} />

      <PerfilBreve postulante={fila} momento={momento} />

      {fila.categorias.length > 0 ? (
        <ul aria-label="Rubros que eligió" className="flex flex-wrap gap-1.5">
          {fila.categorias.slice(0, RUBROS_VISIBLES).map((categoria) => (
            <li key={categoria} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
              {categoria}
            </li>
          ))}
          {resto > 0 && <li className="px-1 py-0.5 text-xs font-medium text-muted-foreground">+{resto} más</li>}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Sin rubros elegidos</p>
      )}

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
        {total === 0 ? (
          <span className="text-muted-foreground">Se registró {haceCuanto(fila.creado, momento)}</span>
        ) : (
          <span className={cn("flex min-w-0 flex-wrap items-center gap-x-1.5 font-medium", enCurso > 0 ? "text-primary" : "text-muted-foreground")}>
            <Send aria-hidden className="size-3.5 shrink-0" />
            <span className="whitespace-nowrap">{total === 1 ? "1 postulación" : `${total} postulaciones`}</span>
            {enCurso > 0 && <span className="font-normal whitespace-nowrap text-muted-foreground">· {enCurso} en curso</span>}
          </span>
        )}
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary">
          Ver perfil
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </footer>
    </article>
  );
}
