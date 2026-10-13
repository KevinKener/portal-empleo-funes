import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Title of a page inside the job seeker area, with a way back to the panel. */
export function EncabezadoSeccion({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="space-y-2">
      <Link
        href="/postulante"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Mi panel
      </Link>
      <h1 className="font-heading text-3xl font-bold">{titulo}</h1>
      <p className="max-w-2xl text-muted-foreground">{descripcion}</p>
    </div>
  );
}
