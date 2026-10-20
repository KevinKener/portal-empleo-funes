"use client";

import { useRef, useState, useTransition, type KeyboardEvent, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Minus, Move, Plus } from "lucide-react";
import { guardarEncuadre } from "@/app/postulante/archivos";
import { AvisoFormulario } from "@/components/formularios/AvisoFormulario";
import { buttonVariants } from "@/components/ui/button";
import { ajustarEncuadre, ENCUADRE_INICIAL, estiloEncuadre, ZOOM_MAXIMO, type Encuadre } from "@/lib/encuadre";
import { cn } from "@/lib/utils";

const PASO_TECLADO = 3; // % per arrow press
const PASO_ZOOM = 0.1;

/**
 * Frames the profile photo inside the round frame (tutor review 2026-10-20):
 * drag it (finger or mouse) or use the arrow keys to move it, the slider or
 * the +/- buttons to zoom. Saving stores the framing in the database, so the
 * avatar looks the same everywhere.
 */
export function EncuadreFoto({ foto, inicial, onListo }: { foto: string; inicial: Encuadre; onListo: () => void }) {
  const router = useRouter();
  const [encuadre, setEncuadre] = useState(inicial);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();
  const inicio = useRef<{ px: number; py: number; desde: Encuadre } | null>(null);

  const cambiar = (parcial: Partial<Encuadre>) => setEncuadre((actual) => ajustarEncuadre({ ...actual, ...parcial }));

  function empezar(evento: PointerEvent<HTMLDivElement>) {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    inicio.current = { px: evento.clientX, py: evento.clientY, desde: encuadre };
    setArrastrando(true);
  }

  function mover(evento: PointerEvent<HTMLDivElement>) {
    const punto = inicio.current;
    if (!punto) return;
    const lado = evento.currentTarget.getBoundingClientRect().width;
    // Dragging right shows more of the left side, so the framing point moves the other way
    const factor = 100 / lado / punto.desde.zoom;
    cambiar({
      x: punto.desde.x - (evento.clientX - punto.px) * factor,
      y: punto.desde.y - (evento.clientY - punto.py) * factor,
    });
  }

  function soltar() {
    inicio.current = null;
    setArrastrando(false);
  }

  function teclas(evento: KeyboardEvent<HTMLDivElement>) {
    const movimientos: Record<string, Partial<Encuadre>> = {
      ArrowLeft: { x: encuadre.x + PASO_TECLADO },
      ArrowRight: { x: encuadre.x - PASO_TECLADO },
      ArrowUp: { y: encuadre.y + PASO_TECLADO },
      ArrowDown: { y: encuadre.y - PASO_TECLADO },
      "+": { zoom: encuadre.zoom + PASO_ZOOM },
      "-": { zoom: encuadre.zoom - PASO_ZOOM },
    };
    const cambio = movimientos[evento.key];
    if (!cambio) return;
    evento.preventDefault();
    cambiar(cambio);
  }

  function guardar() {
    setError(null);
    iniciar(async () => {
      const resultado = await guardarEncuadre(encuadre);
      if (resultado.error) return setError(resultado.error);
      router.refresh();
      onListo();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
      <AvisoFormulario error={error} />
      {/* Always stacked: it lives in the narrow profile column */}
      <div className="flex flex-col items-center gap-4">
        <div
          role="group"
          tabIndex={0}
          aria-label="Foto de perfil: arrastrala o usá las flechas para moverla, y + o - para el zoom"
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerCancel={soltar}
          onKeyDown={teclas}
          className={cn(
            "relative aspect-square w-full max-w-56 shrink-0 touch-none overflow-hidden rounded-full bg-muted shadow-lg ring-4 ring-card select-none focus-visible:ring-ring/60 focus-visible:outline-none",
            arrastrando ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- private signed URL, never through the image optimizer */}
          <img src={foto} alt="" draggable={false} className="pointer-events-none size-full" style={estiloEncuadre(encuadre)} />
          {/* Thirds grid while dragging, to help centre the face */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full transition-opacity duration-200",
              "bg-[linear-gradient(to_right,transparent_33%,rgb(255_255_255/0.5)_33%,rgb(255_255_255/0.5)_calc(33%+1px),transparent_calc(33%+1px),transparent_66%,rgb(255_255_255/0.5)_66%,rgb(255_255_255/0.5)_calc(66%+1px),transparent_calc(66%+1px)),linear-gradient(to_bottom,transparent_33%,rgb(255_255_255/0.5)_33%,rgb(255_255_255/0.5)_calc(33%+1px),transparent_calc(33%+1px),transparent_66%,rgb(255_255_255/0.5)_66%,rgb(255_255_255/0.5)_calc(66%+1px),transparent_calc(66%+1px))]",
              arrastrando ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="w-full space-y-4">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Move aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            Arrastrá la foto para centrar tu cara. Así se va a ver en todo el portal.
          </p>
          <div className="space-y-2">
            <label htmlFor="zoom-foto" className="block text-sm font-medium">
              Zoom
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => cambiar({ zoom: encuadre.zoom - PASO_ZOOM })}
                className={buttonVariants({ variant: "outline", size: "icon-lg", className: "size-11" })}
              >
                <Minus aria-hidden />
                <span className="sr-only">Alejar</span>
              </button>
              <input
                id="zoom-foto"
                type="range"
                min={1}
                max={ZOOM_MAXIMO}
                step={0.05}
                value={encuadre.zoom}
                onChange={(evento) => cambiar({ zoom: Number(evento.target.value) })}
                className="h-2 w-full cursor-pointer accent-primary"
              />
              <button
                type="button"
                onClick={() => cambiar({ zoom: encuadre.zoom + PASO_ZOOM })}
                className={buttonVariants({ variant: "outline", size: "icon-lg", className: "size-11" })}
              >
                <Plus aria-hidden />
                <span className="sr-only">Acercar</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className={buttonVariants({ className: "h-11 w-full px-6 text-base hover:bg-primary-hover" })}
            >
              {guardando && <LoaderCircle aria-hidden className="animate-spin" />}
              {guardando ? "Guardando…" : "Guardar posición"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onListo} className={buttonVariants({ variant: "outline", className: "h-11 text-base" })}>
                Cancelar
              </button>
              <button type="button" onClick={() => setEncuadre(ENCUADRE_INICIAL)} className={buttonVariants({ variant: "ghost", className: "h-11 text-base" })}>
                Centrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
