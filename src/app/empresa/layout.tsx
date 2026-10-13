import { MarcoArea } from "@/components/layout/MarcoArea";
import { requerirRol } from "@/lib/auth";

// Only the empresa role gets in; RLS still guards every query.
export default async function EmpresaLayout({ children }: LayoutProps<"/empresa">) {
  await requerirRol("empresa");
  return <MarcoArea>{children}</MarcoArea>;
}
