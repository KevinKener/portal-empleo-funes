import { LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Save / Cancel row shared by the CV item forms. */
export function BotonesFormulario({ guardando, onCancelar }: { guardando: boolean; onCancelar: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancelar} className={buttonVariants({ variant: "ghost", className: "h-11 px-5 text-base" })}>
        Cancelar
      </button>
      <button
        type="submit"
        disabled={guardando}
        className={buttonVariants({ className: "h-11 px-6 text-base hover:bg-primary-hover" })}
      >
        {guardando && <LoaderCircle aria-hidden className="animate-spin" />}
        {guardando ? "Guardando…" : "Guardar"}
      </button>
    </div>
  );
}
