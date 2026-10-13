import { MarcoArea } from "@/components/layout/MarcoArea";
import { requerirRol } from "@/lib/auth";

// Only the admin role gets in; RLS still guards every query.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requerirRol("admin");
  return <MarcoArea>{children}</MarcoArea>;
}
