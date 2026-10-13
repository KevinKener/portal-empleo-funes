import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Link back to the account type choice. */
export function VolverAOpciones() {
  return (
    <Link
      href="/registro"
      className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <ArrowLeft aria-hidden className="size-4" />
      Tipo de cuenta
    </Link>
  );
}
