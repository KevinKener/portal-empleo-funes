import { MarcoArea } from "@/components/layout/MarcoArea";
import { requerirRol } from "@/lib/auth";

// Only the postulante role gets in; RLS still guards every query.
export default async function PostulanteLayout({ children }: LayoutProps<"/postulante">) {
  await requerirRol("postulante");
  return <MarcoArea>{children}</MarcoArea>;
}
