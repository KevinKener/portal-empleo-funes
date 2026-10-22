import { Briefcase, FileText, GraduationCap, Target } from "lucide-react";
import type { PostulanteResumen } from "@/lib/admin/postulantes";
import { datosClave } from "@/lib/datos-candidato";
import { cn } from "@/lib/utils";

type PropsPerfilBreve = {
  postulante: PostulanteResumen;
  /** The offer's category, to say when the person chose it too; null outside an offer. */
  rubroOferta?: string | null;
  momento: number;
};

/** Experience and education in two lines, for the Office's lists (never a score). */
export function PerfilBreve({ postulante, rubroOferta = null, momento }: PropsPerfilBreve) {
  const datos = datosClave(postulante, rubroOferta, momento);
  const sinCvArmado = !datos.experiencia && !datos.formacion;

  return (
    <span className="flex min-w-0 flex-col gap-1 text-sm">
      {sinCvArmado ? (
        // One line instead of repeating "in the attached CV" for each fact
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <FileText aria-hidden className="size-3.5 shrink-0 text-primary" />
          {postulante.tieneCvPdf ? "CV en archivo adjunto" : "Todavía no cargó su CV"}
        </span>
      ) : (
        <>
          <span className="flex min-w-0 items-center gap-1.5">
            <Briefcase aria-hidden className="size-3.5 shrink-0 text-primary" />
            <span className={cn("truncate", !datos.experiencia && "text-muted-foreground")}>
              {datos.experiencia ? `${datos.experiencia}${datos.ultimoPuesto ? ` · ${datos.ultimoPuesto}` : ""}` : "Sin experiencia cargada"}
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <GraduationCap aria-hidden className="size-3.5 shrink-0 text-primary" />
            <span className={cn("truncate", !datos.formacion && "text-muted-foreground")}>{datos.formacion ?? "Sin formación cargada"}</span>
          </span>
        </>
      )}
      {datos.coincideRubro && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          <Target aria-hidden className="size-3" /> Eligió el rubro de la oferta
        </span>
      )}
    </span>
  );
}
