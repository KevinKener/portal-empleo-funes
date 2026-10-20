"use client";

import { Building2, FileText, House } from "lucide-react";
import { NavegacionArea, type EnlaceArea } from "@/components/layout/NavegacionArea";

// TODO(phase-5): add "Mi empresa" (company data + ARCA certificate) when that page exists.
const ENLACES: readonly EnlaceArea[] = [
  { href: "/empresa", texto: "Inicio", Icono: House, activo: (ruta) => ruta === "/empresa" },
  { href: "/empresa/ofertas", texto: "Mis ofertas", Icono: FileText, activo: (ruta) => ruta.startsWith("/empresa/ofertas") },
  // The public portal, to see published offers the way job seekers do.
  { href: "/ofertas", texto: "Portal", Icono: Building2, activo: () => false },
];

/** Company area navigation: Inicio · Mis ofertas · Portal. */
export function NavegacionEmpresa() {
  return <NavegacionArea enlaces={ENLACES} />;
}
