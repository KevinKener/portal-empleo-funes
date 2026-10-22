"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, Target } from "lucide-react";
import { AccionesPreseleccion } from "@/components/admin/AccionesPreseleccion";
import { EtiquetaPostulacionAdmin } from "@/components/admin/EtiquetaPostulacionAdmin";
import { InsigniaDomicilio } from "@/components/admin/InsigniaDomicilio";
import { TablaAdmin, type ColumnaAdmin } from "@/components/admin/TablaAdmin";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { Avatar } from "@/components/postulante/Avatar";
import { usePreseleccion } from "@/hooks/usePreseleccion";
import type { FilaPostulacion } from "@/lib/admin/postulaciones";
import { datosClave } from "@/lib/datos-candidato";
import { haceCuanto } from "@/lib/formato";
import { cn } from "@/lib/utils";

type PropsListaPostulantes = {
  ofertaId: string;
  /** Already in the Funes-first order (Rule 4). */
  filas: FilaPostulacion[];
  rubroOferta: string | null;
  momento: number;
};

const CASILLA = "relative z-20 size-5 cursor-pointer accent-primary";

/**
 * Applications of an offer in two groups, Funes residents first and then
 * other towns (Rule 4), each a table from lg and cards below. Pending rows can
 * be chosen and acted on together from the sticky bar; the name opens the
 * candidate's page.
 */
export function ListaPostulantes({ ofertaId, filas, rubroOferta, momento }: PropsListaPostulantes) {
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());
  const acciones = usePreseleccion(ofertaId, () => setElegidos(new Set()));
  // Rows that left the pending status (another Admin, a refresh) cannot stay chosen
  const ids = filas.filter((f) => f.estado === "pendiente" && elegidos.has(f.id)).map((f) => f.id);

  function alternar(lista: string[], elegir: boolean) {
    setElegidos((actuales) => {
      const nuevos = new Set(actuales);
      for (const id of lista) {
        if (elegir) nuevos.add(id);
        else nuevos.delete(id);
      }
      return nuevos;
    });
  }

  const grupos = [
    { clave: "funes", titulo: "Vecinos de Funes", filas: filas.filter((f) => f.postulante.localidad === "funes") },
    { clave: "otras", titulo: "Otras localidades", filas: filas.filter((f) => f.postulante.localidad !== "funes") },
  ].filter((g) => g.filas.length > 0);

  return (
    <div className="space-y-8">
      <AvisoFormulario error={acciones.error} aviso={acciones.aviso} />

      {grupos.map((grupo) => {
        const pendientes = grupo.filas.filter((f) => f.estado === "pendiente").map((f) => f.id);
        const todos = pendientes.length > 0 && pendientes.every((id) => elegidos.has(id));
        return (
          <section key={grupo.clave} aria-labelledby={`grupo-${grupo.clave}`} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id={`grupo-${grupo.clave}`} className="flex items-center gap-2 font-heading text-lg font-semibold">
                {grupo.titulo}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{grupo.filas.length}</span>
              </h2>
              {pendientes.length > 1 && (
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={todos} onChange={(evento) => alternar(pendientes, evento.target.checked)} className={CASILLA} />
                  Elegir los {pendientes.length} por revisar
                </label>
              )}
            </div>
            <TablaAdmin
              titulo={`Postulantes: ${grupo.titulo}`}
              filas={grupo.filas}
              clave={(fila) => fila.id}
              columnas={columnas(ofertaId, rubroOferta, momento, elegidos, alternar)}
              tarjeta={(fila) => (
                <article
                  className={cn(
                    "group relative space-y-3 rounded-2xl border bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:shadow-md has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                    elegidos.has(fila.id) && fila.estado === "pendiente" ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Casilla fila={fila} elegidos={elegidos} alternar={alternar} />
                    <Persona fila={fila} ofertaId={ofertaId} />
                    <EtiquetaPostulacionAdmin estado={fila.estado} motivo={fila.motivoRechazo} />
                  </div>
                  <Perfil fila={fila} rubroOferta={rubroOferta} momento={momento} />
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Se postuló {haceCuanto(fila.creada, momento)}</span>
                    <Ver />
                  </div>
                </article>
              )}
            />
          </section>
        );
      })}

      {ids.length > 0 && (
        <div
          role="region"
          aria-label="Acciones sobre las personas elegidas"
          className="sticky bottom-20 z-30 space-y-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-xl shadow-primary/10 motion-safe:animate-entrada sm:p-5 md:bottom-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-heading font-semibold">{ids.length === 1 ? "1 persona elegida" : `${ids.length} personas elegidas`}</p>
            <button type="button" onClick={() => setElegidos(new Set())} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Quitar selección
            </button>
          </div>
          <AccionesPreseleccion ids={ids} acciones={acciones} enFila />
        </div>
      )}
    </div>
  );
}

type Alternar = (lista: string[], elegir: boolean) => void;

function columnas(ofertaId: string, rubroOferta: string | null, momento: number, elegidos: Set<string>, alternar: Alternar): ColumnaAdmin<FilaPostulacion>[] {
  return [
    { titulo: "Elegir", celda: (fila) => <Casilla fila={fila} elegidos={elegidos} alternar={alternar} />, className: "w-12" },
    { titulo: "Postulante", celda: (fila) => <Persona fila={fila} ofertaId={ofertaId} />, className: "w-[28%]" },
    { titulo: "Perfil", celda: (fila) => <Perfil fila={fila} rubroOferta={rubroOferta} momento={momento} /> },
    { titulo: "Se postuló", celda: (fila) => <span className="whitespace-nowrap text-muted-foreground">{haceCuanto(fila.creada, momento)}</span>, secundaria: true },
    { titulo: "Estado", celda: (fila) => <EtiquetaPostulacionAdmin estado={fila.estado} motivo={fila.motivoRechazo} /> },
    { titulo: "Acción", celda: () => <Ver />, className: "text-right" },
  ];
}

function Casilla({ fila, elegidos, alternar }: { fila: FilaPostulacion; elegidos: Set<string>; alternar: Alternar }) {
  // Only pending applications are the Office's to move (AGENTS.md §2)
  if (fila.estado !== "pendiente") return <span aria-hidden className="block size-5" />;
  const nombre = `${fila.postulante.nombre} ${fila.postulante.apellido}`;
  return (
    <input
      type="checkbox"
      checked={elegidos.has(fila.id)}
      onChange={(evento) => alternar([fila.id], evento.target.checked)}
      aria-label={`Elegir a ${nombre}`}
      className={cn(CASILLA, "mt-0.5 shrink-0")}
    />
  );
}

function Persona({ fila, ofertaId }: { fila: FilaPostulacion; ofertaId: string }) {
  const { postulante } = fila;
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      {/* Initials only in the list: signing every photo would slow it down */}
      <Avatar nombre={postulante.nombre} apellido={postulante.apellido} />
      <span className="min-w-0 space-y-0.5">
        {/* The name link covers the whole row or card */}
        <Link
          href={`/admin/ofertas/${ofertaId}/postulantes/${fila.id}`}
          className="block truncate font-semibold text-foreground group-hover:text-primary after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
        >
          {postulante.nombre} {postulante.apellido}
        </Link>
        <InsigniaDomicilio localidad={postulante.localidad} estado={postulante.estadoDomicilio} tieneComprobante={postulante.tieneComprobante} />
      </span>
    </span>
  );
}

function Perfil({ fila, rubroOferta, momento }: { fila: FilaPostulacion; rubroOferta: string | null; momento: number }) {
  const datos = datosClave(fila.postulante, rubroOferta, momento);
  const pdf = fila.postulante.tieneCvPdf ? "En su CV adjunto" : "Sin datos";
  return (
    <span className="flex flex-col gap-1 text-sm">
      <span className="inline-flex items-center gap-1.5">
        <Briefcase aria-hidden className="size-3.5 shrink-0 text-primary" />
        <span className={cn(!datos.experiencia && "text-muted-foreground")}>
          {datos.ultimoPuesto ? `${datos.experiencia} · ${datos.ultimoPuesto}` : (datos.experiencia ?? pdf)}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <GraduationCap aria-hidden className="size-3.5 shrink-0 text-primary" />
        <span className={cn(!datos.formacion && "text-muted-foreground")}>{datos.formacion ?? pdf}</span>
      </span>
      {datos.coincideRubro && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          <Target aria-hidden className="size-3" /> Eligió el rubro de la oferta
        </span>
      )}
    </span>
  );
}

const Ver = () => (
  <span className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-primary">
    Ver
    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
  </span>
);
