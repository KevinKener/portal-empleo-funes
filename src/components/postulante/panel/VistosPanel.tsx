"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

/**
 * What the job seeker saw on their previous visit to the panel, kept in
 * localStorage (decision in docs/research/panel-postulante.md §6): powers the
 * celebrations and the "Novedad" badges without a database column. Per
 * device; one key per job seeker so a shared phone keeps people apart.
 */

export type Visto = { perfilListo: boolean; estados: Record<string, string> };

/** undefined while hydrating; null on the first visit from this device (or without storage). */
const ContextoVistos = createContext<Visto | null | undefined>(undefined);

const clave = (postulanteId: string) => `portal-empleo:panel:${postulanteId}`;
// Nothing else writes the key while the page is open, so there is nothing to listen to.
const sinSuscripcion = () => () => {};

function leer(postulanteId: string): string | null {
  try {
    return window.localStorage.getItem(clave(postulanteId));
  } catch {
    return null;
  }
}

function parsear(valor: string | null): Visto | null {
  if (!valor) return null;
  try {
    const dato: unknown = JSON.parse(valor);
    if (
      typeof dato === "object" && dato !== null &&
      "perfilListo" in dato && typeof dato.perfilListo === "boolean" &&
      "estados" in dato && typeof dato.estados === "object" && dato.estados !== null
    ) {
      return { perfilListo: dato.perfilListo, estados: dato.estados as Record<string, string> };
    }
  } catch {
    // A corrupt value counts as a first visit.
  }
  return null;
}

export function VistosPanel({ postulanteId, actual, children }: { postulanteId: string; actual: Visto; children: ReactNode }) {
  // The server snapshot (undefined) keeps the first client render equal to the HTML.
  const guardado = useSyncExternalStore(sinSuscripcion, () => leer(postulanteId), () => undefined);
  const [anterior, setAnterior] = useState<Visto | null | undefined>(undefined);
  // Freeze the previous visit once, so saving this visit below does not hide what is on screen.
  if (anterior === undefined && guardado !== undefined) setAnterior(parsear(guardado));

  const serializado = JSON.stringify(actual);
  useEffect(() => {
    if (anterior === undefined) return;
    try {
      window.localStorage.setItem(clave(postulanteId), serializado);
    } catch {
      // Private mode or full storage: the panel simply has no celebrations.
    }
  }, [anterior, postulanteId, serializado]);

  return <ContextoVistos.Provider value={anterior}>{children}</ContextoVistos.Provider>;
}

/** The previous visit; undefined until known, null on a first visit. */
export function useVistoAnterior() {
  return useContext(ContextoVistos);
}

/** "Novedad" badge for an application whose status changed since the previous visit. */
export function MarcaNovedad({ id, estado }: { id: string; estado: string }) {
  const anterior = useVistoAnterior();
  const previo = anterior?.estados[id];
  if (!previo || previo === estado) return null;
  return (
    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground motion-safe:animate-in motion-safe:zoom-in-90">
      Novedad
    </span>
  );
}
