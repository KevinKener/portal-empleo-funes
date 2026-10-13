import type { ReactNode } from "react";

type PropsPanelBienvenida = {
  saludo: string;
  descripcion: string;
  children?: ReactNode;
};

/** Heading of a private area's home, with optional notices or next steps below. */
export function PanelBienvenida({ saludo, descripcion, children }: PropsPanelBienvenida) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">{saludo}</h1>
        <p className="max-w-2xl text-muted-foreground">{descripcion}</p>
      </div>
      {children}
    </div>
  );
}
