import { Encabezado } from "@/components/layout/Encabezado";
import { PiePagina } from "@/components/layout/PiePagina";

// Shared shell for the public portal; private areas get their own layouts.
export default function PublicoLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col">
      <Encabezado />
      <main className="flex-1">{children}</main>
      <PiePagina />
    </div>
  );
}
