"use client";

import { useEffect, useState } from "react";

/**
 * Seconds left before a code can be requested again (Supabase allows one
 * email every 60 s). `reiniciar` starts the wait over after a new request.
 */
export function useCuentaRegresiva(segundos: number) {
  const [restantes, setRestantes] = useState(segundos);

  useEffect(() => {
    if (restantes <= 0) return;
    const temporizador = setTimeout(() => setRestantes((actual) => actual - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [restantes]);

  return {
    restantes,
    /** "0:45" while waiting. */
    texto: `0:${String(restantes).padStart(2, "0")}`,
    reiniciar: () => setRestantes(segundos),
  };
}
