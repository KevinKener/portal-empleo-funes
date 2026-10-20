"use client";

import { Building2, FileText, Globe, House } from "lucide-react";
import { NavegacionArea, type EnlaceArea } from "@/components/layout/NavegacionArea";

const ENLACES: readonly EnlaceArea[] = [
  { href: "/empresa", texto: "Inicio", Icono: House, activo: (ruta) => ruta === "/empresa" },
  { href: "/empresa/ofertas", texto: "Mis ofertas", Icono: FileText, activo: (ruta) => ruta.startsWith("/empresa/ofertas") },
  { href: "/empresa/datos", texto: "Mi empresa", Icono: Building2, activo: (ruta) => ruta.startsWith("/empresa/datos") },
  // The public portal, to see published offers the way job seekers do.
  { href: "/ofertas", texto: "Portal", Icono: Globe, activo: () => false },
];

/** Company area navigation: Inicio · Mis ofertas · Mi empresa · Portal. */
export function NavegacionEmpresa() {
  return <NavegacionArea enlaces={ENLACES} />;
}
