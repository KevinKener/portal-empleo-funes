import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const VOLVER_AL_PANEL = { href: "/postulante", texto: "Mi panel" };

/** Title of a page inside the job seeker area, with a way back (the panel by default). */
export function EncabezadoSeccion({
  titulo,
  descripcion,
  volver = VOLVER_AL_PANEL,
}: {
  titulo: string;
  descripcion: string;
  volver?: { href: string; texto: string };
}) {
  return (
    <div className="space-y-2">
      <Link
        href={volver.href}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {volver.texto}
      </Link>
      <h1 className="font-heading text-3xl font-bold">{titulo}</h1>
      <p className="max-w-2xl text-muted-foreground">{descripcion}</p>
    </div>
  );
}

/** Back link for the pages grouped under "Mi perfil". */
export const VOLVER_A_MI_PERFIL = { href: "/postulante/perfil", texto: "Mi perfil" };
