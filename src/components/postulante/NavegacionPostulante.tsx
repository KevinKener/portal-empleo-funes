"use client";

import { LayoutDashboard, Search, Send, UserRound } from "lucide-react";
import { NavegacionArea, type EnlaceArea, type VarianteNavegacion } from "@/components/layout/NavegacionArea";

// Profile sub-pages light up "Mi perfil".
const SECCIONES_PERFIL = ["/postulante/perfil", "/postulante/datos", "/postulante/rubros", "/postulante/cv", "/postulante/domicilio"];

// Names say what the person does there ("Mi panel" is not the portal's home,
// "Buscar" is finding a job), most used first (decision 2026-10-21).
const ENLACES: readonly EnlaceArea[] = [
  { href: "/postulante", texto: "Mi panel", Icono: LayoutDashboard, activo: (ruta) => ruta === "/postulante" },
  { href: "/ofertas", texto: "Buscar", Icono: Search, activo: (ruta) => ruta.startsWith("/ofertas") },
  { href: "/postulante/postulaciones", texto: "Postulaciones", Icono: Send, activo: (ruta) => ruta.startsWith("/postulante/postulaciones") },
  { href: "/postulante/perfil", texto: "Mi perfil", Icono: UserRound, activo: (ruta) => SECCIONES_PERFIL.some((s) => ruta.startsWith(s)) },
];

/** Job seeker area navigation: Mi panel · Buscar · Postulaciones · Mi perfil. */
export function NavegacionPostulante({ variante }: { variante: VarianteNavegacion }) {
  return <NavegacionArea enlaces={ENLACES} variante={variante} />;
}
