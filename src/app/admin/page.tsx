import type { Metadata } from "next";
import { CircleCheck, PartyPopper } from "lucide-react";
import { COLAS, ColaBandeja } from "@/components/admin/ColaBandeja";
import { BandaBienvenida } from "@/components/layout/PanelBienvenida";
import { diasEsperando, obtenerColas, type Cola } from "@/lib/admin/bandeja";
import { ahora } from "@/lib/formato";

export const metadata: Metadata = { title: "Bandeja" };

const HORA = new Intl.DateTimeFormat("es-AR", { hour: "numeric", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" });

/** "Buen día" until noon, "Buenas tardes" until 8 pm, Funes time. */
function saludo(momento: number): string {
  const hora = Number(HORA.format(momento));
  if (hora >= 5 && hora < 12) return "¡Buen día!";
  if (hora >= 12 && hora < 20) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}

/**
 * Bandeja: the Office's operational home (docs/research/admin.md §4.2–4.3).
 * Queues with work first, the one waiting longest on top; offers without
 * applicants are a nudge, so they go last. Empty queues fold into one line.
 */
export default async function AdminPage() {
  const colas = await obtenerColas();
  const momento = ahora();

  const espera = (cola: Cola) => (cola.desde ? diasEsperando(cola.desde, momento) : 0);
  const conTrabajo = colas
    .filter((c) => c.cantidad > 0)
    .sort((a, b) => Number(a.tipo === "sin-postulantes") - Number(b.tipo === "sin-postulantes") || espera(b) - espera(a));
  const alDia = colas.filter((c) => c.cantidad === 0);
  const total = conTrabajo.filter((c) => c.tipo !== "sin-postulantes").reduce((suma, c) => suma + c.cantidad, 0);

  return (
    <div className="space-y-8">
      <BandaBienvenida
        saludo={saludo(momento)}
        descripcion={
          <p>
            {total === 0
              ? "No hay nada esperando revisión. La Oficina de Empleo está al día."
              : total === 1
                ? "Hay 1 cosa esperando tu revisión."
                : `Hay ${total} cosas esperando tu revisión. Arriba, la que más espera.`}
          </p>
        }
      />

      {conTrabajo.length > 0 ? (
        <section aria-labelledby="titulo-para-revisar" className="space-y-4">
          <h2 id="titulo-para-revisar" className="font-heading text-xl font-semibold">
            Para revisar
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {conTrabajo.map((cola, i) => (
              <ColaBandeja key={cola.tipo} cola={cola} momento={momento} indice={i} />
            ))}
          </ul>
        </section>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-secondary/40 px-6 py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 motion-safe:animate-festejo-pop">
            <PartyPopper aria-hidden className="size-8" />
          </span>
          <p className="font-heading text-xl font-semibold">¡Todo al día!</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cuando una empresa se registre, llegue una oferta o alguien se postule, lo vas a ver acá.
          </p>
        </div>
      )}

      {conTrabajo.length > 0 && alDia.length > 0 && (
        <section aria-labelledby="titulo-al-dia" className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <h2 id="titulo-al-dia" className="mr-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CircleCheck aria-hidden className="size-4" /> Al día
          </h2>
          <ul className="flex flex-wrap gap-2">
            {alDia.map((cola) => (
              <li key={cola.tipo} className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                {COLAS[cola.tipo].titulo}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
