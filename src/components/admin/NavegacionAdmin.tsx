"use client";

import { BarChart3, Building2, FileText, Inbox, Users } from "lucide-react";
import { NavegacionArea, type EnlaceArea, type VarianteNavegacion } from "@/components/layout/NavegacionArea";
import type { PendientesAdmin } from "@/lib/admin/bandeja";

/**
 * Admin area navigation: Bandeja · Empresas · Ofertas · Postulantes ·
 * Indicadores, each section with its pending count (MoJ notification badge,
 * docs/research/admin.md §4.1). Counts come from the layout (server).
 */
export function NavegacionAdmin({ variante, pendientes }: { variante: VarianteNavegacion; pendientes: PendientesAdmin }) {
  const enlaces: readonly EnlaceArea[] = [
    { href: "/admin", texto: "Bandeja", Icono: Inbox, activo: (ruta) => ruta === "/admin" },
    { href: "/admin/empresas", texto: "Empresas", Icono: Building2, activo: (ruta) => ruta.startsWith("/admin/empresas"), insignia: pendientes.empresas },
    { href: "/admin/ofertas", texto: "Ofertas", Icono: FileText, activo: (ruta) => ruta.startsWith("/admin/ofertas"), insignia: pendientes.ofertas },
    { href: "/admin/postulantes", texto: "Postulantes", Icono: Users, activo: (ruta) => ruta.startsWith("/admin/postulantes"), insignia: pendientes.postulantes },
    { href: "/admin/indicadores", texto: "Indicadores", Icono: BarChart3, activo: (ruta) => ruta.startsWith("/admin/indicadores") },
  ];
  return <NavegacionArea enlaces={enlaces} variante={variante} />;
}
