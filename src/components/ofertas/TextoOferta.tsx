import { Check } from "lucide-react";

type Bloque =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "lista"; items: string[] };

const VINETA = /^\s*[-•*·–]\s+/;

/**
 * Splits an offer's free text into blocks, the way companies usually write
 * it: a line ending in ":" ("Vas a encargarte de:") is a small heading and the
 * lines under it a list, until a blank line; lines starting with "-", "•" or
 * "*" are list items anywhere. With `todoLista` (requirements) every line is
 * an item. Plain text only, never HTML.
 */
function bloques(texto: string, todoLista: boolean): Bloque[] {
  const resultado: Bloque[] = [];
  let enLista = false;
  const agregarItem = (item: string) => {
    const ultimo = resultado.at(-1);
    if (ultimo?.tipo === "lista") ultimo.items.push(item);
    else resultado.push({ tipo: "lista", items: [item] });
  };

  for (const linea of texto.split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia) {
      enLista = false;
      continue;
    }
    if (VINETA.test(limpia)) agregarItem(limpia.replace(VINETA, ""));
    else if (limpia.endsWith(":")) {
      resultado.push({ tipo: "subtitulo", texto: limpia.slice(0, -1) });
      enLista = true;
    } else if (enLista || todoLista) agregarItem(limpia);
    else resultado.push({ tipo: "parrafo", texto: limpia });
  }
  return resultado;
}

/** An offer's description or requirements (`tilde`: every line is a checked item), easier to scan than a block of text. */
export function TextoOferta({ texto, tilde = false }: { texto: string; tilde?: boolean }) {
  return (
    <div className="space-y-3 leading-relaxed text-foreground/90">
      {bloques(texto, tilde).map((bloque, i) =>
        bloque.tipo === "parrafo" ? (
          <p key={i}>{bloque.texto}</p>
        ) : bloque.tipo === "subtitulo" ? (
          <h3 key={i} className="pt-2 font-heading font-semibold text-foreground">
            {bloque.texto}
          </h3>
        ) : (
          <ul key={i} className="space-y-2">
            {bloque.items.map((item, j) => (
              <li key={j} className="flex gap-3">
                {tilde ? (
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Check className="size-3.5" />
                  </span>
                ) : (
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
