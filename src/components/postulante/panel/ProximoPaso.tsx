"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, Handshake, PartyPopper, Send, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { ProximoPaso as Paso } from "@/lib/panel-postulante";
import { cn } from "@/lib/utils";
import { useVistoAnterior, type Visto } from "./VistosPanel";

type PostulacionResumida = { id: string; estado: string; titulo: string };

type Festejo = { titulo: string; texto: string; accion: string; href: string; Icono: LucideIcon; grande?: boolean };

// Good news only, most important first; rejections never celebrate.
const AVANCES: Record<string, (titulo: string) => Omit<Festejo, "href">> = {
  contratado: (t) => ({ titulo: "¡Felicitaciones!", texto: `Te contrataron para «${t}».`, accion: "Ver postulación", Icono: PartyPopper, grande: true }),
  entrevista: (t) => ({ titulo: "¡La empresa quiere conocerte!", texto: `Te van a contactar para «${t}».`, accion: "Ver postulación", Icono: Handshake }),
  preseleccionado: (t) => ({ titulo: "¡Buenas noticias!", texto: `La Oficina recomendó tu perfil para «${t}».`, accion: "Ver postulación", Icono: Sparkles }),
};

/** The one celebration for this visit, comparing it with the previous one (docs/research/panel-postulante.md §3.5). */
function elegirFestejo(anterior: Visto, perfilListo: boolean, postulaciones: PostulacionResumida[]): Festejo | null {
  for (const estado of Object.keys(AVANCES)) {
    const avanzo = postulaciones.find((p) => p.estado === estado && anterior.estados[p.id] !== estado);
    if (avanzo) return { ...AVANCES[estado](avanzo.titulo), href: `/postulante/postulaciones#postulacion-${avanzo.id}` };
  }
  if (Object.keys(anterior.estados).length === 0 && postulaciones.length > 0) {
    return {
      titulo: "¡Te postulaste por primera vez!",
      texto: "La Oficina de Empleo va a revisar tu perfil y te avisamos acá cómo sigue.",
      accion: "Ver mi postulación",
      href: "/postulante/postulaciones",
      Icono: Send,
    };
  }
  if (!anterior.perfilListo && perfilListo) {
    return {
      titulo: "¡Tu perfil está listo!",
      texto: "Ya podés postularte a las ofertas.",
      accion: "Ver ofertas para vos",
      href: "#ofertas-para-vos",
      Icono: CircleCheck,
    }
  }
  return null;
}

// Fixed spots for the "contratado" burst; CSS variables drive the keyframes in globals.css.
const CHISPAS = [
  ["-3.5rem", "-2.5rem"], ["3.5rem", "-2.5rem"], ["-4rem", "0.5rem"], ["4rem", "0.5rem"],
  ["-2rem", "-3.5rem"], ["2rem", "-3.5rem"], ["-2.5rem", "2.5rem"], ["2.5rem", "2.5rem"],
];

/**
 * "Próximo paso": the single action the panel suggests, replaced once by a
 * short celebration when something good happened since the last visit.
 * Not a modal: it never blocks the page, has no sound, and motion is skipped
 * with reduced motion.
 */
export function ProximoPaso({ paso, perfilListo, postulaciones }: { paso: Paso; perfilListo: boolean; postulaciones: PostulacionResumida[] }) {
  const anterior = useVistoAnterior();
  const [cerrado, setCerrado] = useState(false);
  const festejo = anterior && !cerrado ? elegirFestejo(anterior, perfilListo, postulaciones) : null;

  if (festejo) {
    const { Icono } = festejo;
    return (
      <section role="status" className="relative overflow-hidden rounded-2xl border border-primary/20 bg-secondary p-5 text-secondary-foreground sm:p-6 motion-safe:animate-in motion-safe:fade-in">
        <div className="flex items-start gap-4">
          <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground motion-safe:animate-festejo-pop">
            <Icono aria-hidden className="size-6" />
            {festejo.grande &&
              CHISPAS.map(([x, y], i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{ "--x": x, "--y": y } as React.CSSProperties}
                  className={cn("absolute size-2 rounded-full opacity-0 motion-safe:animate-festejo-chispa motion-reduce:hidden", i % 2 ? "bg-primary" : "bg-primary/50")}
                />
              ))}
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="font-heading text-xl font-semibold">{festejo.titulo}</h2>
            <p>{festejo.texto}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:pl-16">
          <Link href={festejo.href} className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}>
            {festejo.accion}
          </Link>
          <button type="button" onClick={() => setCerrado(true)} className="rounded-md px-3 py-2 text-sm font-medium underline-offset-4 hover:underline">
            Listo
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="titulo-proximo-paso" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">Próximo paso</p>
      <h2 id="titulo-proximo-paso" className="mt-1 font-heading text-xl font-semibold">{paso.titulo}</h2>
      <p className="mt-1 text-muted-foreground">{paso.texto}</p>
      <Link href={paso.href} className={buttonVariants({ className: "mt-4 h-11 px-6 text-base hover:bg-primary-hover" })}>
        {paso.accion}
        <ArrowRight aria-hidden />
      </Link>
    </section>
  );
}
