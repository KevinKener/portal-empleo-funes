"use client";

import { Building2, Eye, FileText, LayoutDashboard } from "lucide-react";
import { NavegacionArea, type EnlaceArea, type VarianteNavegacion } from "@/components/layout/NavegacionArea";

const ENLACES: readonly EnlaceArea[] = [
  { href: "/empresa", texto: "Mi panel", Icono: LayoutDashboard, activo: (ruta) => ruta === "/empresa" },
  { href: "/empresa/ofertas", texto: "Mis ofertas", Icono: FileText, activo: (ruta) => ruta.startsWith("/empresa/ofertas") },
  { href: "/empresa/datos", texto: "Mi empresa", Icono: Building2, activo: (ruta) => ruta.startsWith("/empresa/datos") },
  // The public portal, to see published offers the way job seekers do.
  { href: "/ofertas", texto: "Ver portal", Icono: Eye, activo: (ruta) => ruta === "/" || ruta.startsWith("/ofertas") },
];

/** Company area navigation: Mi panel · Mis ofertas · Mi empresa · Ver portal (names: decision 2026-10-21). */
export function NavegacionEmpresa({ variante }: { variante: VarianteNavegacion }) {
  return <NavegacionArea enlaces={ENLACES} variante={variante} />;
}
