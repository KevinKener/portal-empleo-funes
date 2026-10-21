"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copies an email address, for computers with no mail app set up (where a
 * mailto: link does nothing): the person pastes it into Gmail or similar.
 */
export function CopiarEmail({ email }: { email: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(email);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Clipboard blocked (old browser or no permission): the address is still on screen to copy by hand
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      // Fixed width: "Copiado" is longer than "Copiar", and a growing button would push the email into a new line
      className="inline-flex h-8 w-[5.5rem] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {copiado ? <Check aria-hidden className="size-3.5 text-primary" /> : <Copy aria-hidden className="size-3.5" />}
      {copiado ? "Copiado" : "Copiar"}
      <span className="sr-only"> el email de la Oficina</span>
      <span aria-live="polite" className="sr-only">
        {copiado ? "Email copiado" : ""}
      </span>
    </button>
  );
}
