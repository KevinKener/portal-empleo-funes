import { Encabezado } from "@/components/layout/Encabezado";
import { PiePagina } from "@/components/layout/PiePagina";
import { NavegacionEmpresa } from "@/components/empresa/NavegacionEmpresa";
import { NavegacionPostulante } from "@/components/postulante/NavegacionPostulante";
import { obtenerSesion } from "@/lib/auth";

/**
 * Shared shell for the public portal; private areas get their own layouts.
 * Signed in on a phone, the person keeps their area's bottom bar here too
 * ("Buscar" / "Ver portal" lit), so the way back to their panel is always in
 * sight instead of a small "Mi panel" link.
 */
export default async function PublicoLayout({ children }: LayoutProps<"/">) {
  const sesion = await obtenerSesion();
  const barra =
    sesion?.rol === "postulante" ? (
      <NavegacionPostulante variante="barra" />
    ) : sesion?.rol === "empresa" ? (
      <NavegacionEmpresa variante="barra" />
    ) : null;

  return (
    <div className={barra ? "flex min-h-svh flex-col pb-[4.5rem] md:pb-0" : "flex min-h-svh flex-col"}>
      <Encabezado conBarra={Boolean(barra)} />
      <main className="flex-1">{children}</main>
      {barra}
      <PiePagina />
    </div>
  );
}
