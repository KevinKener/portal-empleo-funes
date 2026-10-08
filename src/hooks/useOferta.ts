"use client";

import { useEffect, useState } from "react";
import type { OfertaPublica } from "@/lib/ofertas";

interface UseOfertaResult {
  data: OfertaPublica | null;
  loading: boolean;
  error: string | null;
}

type Resultado = {
  id: string;
  data: OfertaPublica | null;
  error: string | null;
};

/** Loads one published offer from /api/ofertas/[id] in a Client Component. */
export function useOferta(id: string): UseOfertaResult {
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch(`/api/ofertas/${id}`)
      .then(async (r) => {
        const cuerpo: unknown = await r.json();
        if (!r.ok) throw new Error(mensajeDeError(cuerpo, r.status));
        return cuerpo as OfertaPublica;
      })
      .then((data) => {
        if (!cancelado) setResultado({ id, data, error: null });
      })
      .catch((e: Error) => {
        if (!cancelado) setResultado({ id, data: null, error: e.message });
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Loading is derived instead of stored, so the effect never sets state synchronously.
  const actual = resultado?.id === id ? resultado : null;
  return { data: actual?.data ?? null, loading: actual === null, error: actual?.error ?? null };
}

function mensajeDeError(cuerpo: unknown, status: number): string {
  if (typeof cuerpo === "object" && cuerpo !== null && "error" in cuerpo && typeof cuerpo.error === "string") {
    return cuerpo.error;
  }
  return `Error ${status}`;
}
