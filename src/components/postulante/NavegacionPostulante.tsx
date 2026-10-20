"use client";

import { BriefcaseBusiness, House, Send, UserRound } from "lucide-react";
import { NavegacionArea, type EnlaceArea, type VarianteNavegacion } from "@/components/layout/NavegacionArea";

// Profile sub-pages light up "Mi perfil".
const SECCIONES_PERFIL = ["/postulante/perfil", "/postulante/datos", "/postulante/rubros", "/postulante/cv", "/postulante/domicilio"];

const ENLACES: readonly EnlaceArea[] = [
  { href: "/postulante", texto: "Inicio", Icono: House, activo: (ruta) => ruta === "/postulante" },
  { href: "/postulante/perfil", texto: "Mi perfil", Icono: UserRound, activo: (ruta) => SECCIONES_PERFIL.some((s) => ruta.startsWith(s)) },
  { href: "/postulante/postulaciones", texto: "Postulaciones", Icono: Send, activo: (ruta) => ruta.startsWith("/postulante/postulaciones") },
  { href: "/ofertas", texto: "Ofertas", Icono: BriefcaseBusiness, activo: () => false },
];

/** Job seeker area navigation: Inicio · Mi perfil · Postulaciones · Ofertas. */
export function NavegacionPostulante({ variante }: { variante: VarianteNavegacion }) {
  return <NavegacionArea enlaces={ENLACES} variante={variante} />;
}
