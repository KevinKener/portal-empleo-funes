import { MarcoArea } from "@/components/layout/MarcoArea";
import { NavegacionPostulante } from "@/components/postulante/NavegacionPostulante";
import { requerirRol } from "@/lib/auth";

// Only the postulante role gets in; RLS still guards every query.
export default async function PostulanteLayout({ children }: LayoutProps<"/postulante">) {
  await requerirRol("postulante");
  return <MarcoArea navegacion={<NavegacionPostulante />}>{children}</MarcoArea>;
}
