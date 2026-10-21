import { NavegacionAdmin } from "@/components/admin/NavegacionAdmin";
import { MarcoArea } from "@/components/layout/MarcoArea";
import { obtenerColas, pendientesPorSeccion } from "@/lib/admin/bandeja";
import { requerirRol } from "@/lib/auth";

// Only the admin role gets in; RLS still guards every query.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requerirRol("admin");
  // The badges must not take the whole area down: without counts the tabs still work
  const pendientes = await obtenerColas()
    .then(pendientesPorSeccion)
    .catch(() => ({ empresas: 0, ofertas: 0, postulantes: 0 }));
  return <MarcoArea navegacion={(variante) => <NavegacionAdmin variante={variante} pendientes={pendientes} />}>{children}</MarcoArea>;
}
