"use client";

import { FileUser, House, Search, Send } from "lucide-react";
import { NavegacionArea, type EnlaceArea, type VarianteNavegacion } from "@/components/layout/NavegacionArea";

// Profile sub-pages light up "Mi CV".
const SECCIONES_PERFIL = ["/postulante/perfil", "/postulante/datos", "/postulante/rubros", "/postulante/cv", "/postulante/domicilio"];

// Same shape as the company's: what is yours first, the way out to the portal last.
// "Mi CV" as in Bumeran and Computrabajo, the portals people already know, and it no
// longer reads like "Mi panel" (decision 2026-10-22).
const ENLACES: readonly EnlaceArea[] = [
  { href: "/postulante", texto: "Mi panel", Icono: House, activo: (ruta) => ruta === "/postulante" },
  { href: "/postulante/postulaciones", texto: "Postulaciones", Icono: Send, activo: (ruta) => ruta.startsWith("/postulante/postulaciones") },
  { href: "/postulante/perfil", texto: "Mi CV", Icono: FileUser, activo: (ruta) => SECCIONES_PERFIL.some((s) => ruta.startsWith(s)) },
  { href: "/ofertas", texto: "Ver ofertas", Icono: Search, activo: (ruta) => ruta.startsWith("/ofertas") },
];

/** Job seeker area navigation: Mi panel · Postulaciones · Mi CV · Ver ofertas. */
export function NavegacionPostulante({ variante }: { variante: VarianteNavegacion }) {
  return <NavegacionArea enlaces={ENLACES} variante={variante} />;
}
