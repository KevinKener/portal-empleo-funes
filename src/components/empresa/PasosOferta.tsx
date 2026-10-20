import { NotaLateral } from "@/components/layout/PaginaArea";

/** How an offer moves (Rules 2 and 9), next to the offer form. A real sequence, so it is numbered. */
export function PasosOferta() {
  return (
    <NotaLateral titulo="Cómo sigue tu oferta">
      <ol className="list-decimal space-y-2 pl-5">
        <li>Se guarda como borrador. Podés cambiarla todas las veces que quieras.</li>
        <li>Cuando esté lista, la enviás a revisión desde la página de la oferta.</li>
        <li>La Oficina de Empleo la revisa y la publica en el portal, o te dice qué corregir.</li>
        <li>Con la oferta publicada, la Oficina te preselecciona candidatos.</li>
      </ol>
    </NotaLateral>
  );
}
