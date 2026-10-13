"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import {
  validarCampo,
  validarCampos,
  type CampoRegistro,
  type Errores,
  type EstadoFormulario,
} from "@/lib/validaciones/auth";

export type Paso<K extends CampoRegistro> = { titulo: string; campos: readonly K[] };

type Accion<K extends CampoRegistro> = (
  previo: EstadoFormulario<K>,
  formData: FormData,
) => Promise<EstadoFormulario<K>>;

/**
 * State for a form split into steps (or a single one) that submits once at
 * the end. `iniciales` pre-fills it when editing existing data.
 * Inputs are controlled so steps can unmount (and animate) without losing
 * values, and the action is called manually: React would otherwise reset the
 * form after the action and wipe what the person typed.
 * Validation timing follows Baymard: on blur, re-checked on every keystroke
 * once a field shows an error, and per step before moving forward.
 */
export function useFormularioPorPasos<K extends CampoRegistro>(
  pasos: readonly Paso<K>[],
  accion: Accion<K>,
  iniciales: Partial<Record<K, string>> = {},
) {
  const [estado, ejecutar, enviando] = useActionState<EstadoFormulario<K>, FormData>(accion, {
    errores: {},
    mensaje: null,
  });
  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState<"adelante" | "atras">("adelante");
  const [valores, setValores] = useState<Partial<Record<K, string>>>(iniciales);
  const [errores, setErrores] = useState<Errores<K>>({});
  const [validos, setValidos] = useState<Partial<Record<K, boolean>>>({});
  const [estadoVisto, setEstadoVisto] = useState(estado);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  // Server errors (e.g. "DNI already registered") take the person to the
  // step that holds the first failing field. Adjusted during render, as React
  // recommends for state that follows a new value, instead of in an effect.
  if (estado !== estadoVisto) {
    setEstadoVisto(estado);
    const campos = Object.keys(estado.errores) as K[];
    if (campos.length > 0) {
      setErrores((actuales) => ({ ...actuales, ...estado.errores }));
      setValidos((actuales) => ({ ...actuales, ...Object.fromEntries(campos.map((c) => [c, false])) }));
      const destino = pasos.findIndex((p) => p.campos.some((c) => campos.includes(c)));
      if (destino >= 0 && destino !== paso) {
        setDireccion("atras");
        setPaso(destino);
      }
    }
  }

  // Move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    tituloRef.current?.focus();
  }, [paso]);

  function revisar(campo: K, valor: string) {
    const error = validarCampo(campo, valor);
    setErrores((actuales) => ({ ...actuales, [campo]: error ?? undefined }));
    setValidos((actuales) => ({ ...actuales, [campo]: !error }));
  }

  function cambiar(campo: K, valor: string) {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    if (errores[campo]) revisar(campo, valor);
  }

  function salir(campo: K) {
    const valor = valores[campo] ?? "";
    // Don't flag a field just because focus passed through it empty.
    if (valor === "" && !errores[campo]) return;
    revisar(campo, valor);
  }

  function pasoValido(): boolean {
    const encontrados = validarCampos(pasos[paso].campos, valores);
    setErrores((actuales) => ({ ...actuales, ...encontrados }));
    const primero = pasos[paso].campos.find((c) => encontrados[c]);
    if (primero) document.getElementById(primero)?.focus();
    return !primero;
  }

  function siguiente() {
    if (!pasoValido()) return;
    setDireccion("adelante");
    setPaso((actual) => Math.min(actual + 1, pasos.length - 1));
  }

  function anterior() {
    setDireccion("atras");
    setPaso((actual) => Math.max(actual - 1, 0));
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (paso < pasos.length - 1) return siguiente();
    if (!pasoValido()) return;
    const formData = new FormData();
    for (const { campos } of pasos) {
      for (const campo of campos) formData.set(campo, valores[campo] ?? "");
    }
    startTransition(() => ejecutar(formData));
  }

  /** Props for a field: value, handlers and validation state. */
  function campo(nombre: K) {
    return {
      nombre,
      valor: valores[nombre] ?? "",
      error: errores[nombre],
      valido: validos[nombre] === true && !errores[nombre],
      onCambiar: (valor: string) => cambiar(nombre, valor),
      onSalir: () => salir(nombre),
    };
  }

  return {
    paso,
    total: pasos.length,
    titulo: pasos[paso].titulo,
    direccion,
    esUltimo: paso === pasos.length - 1,
    mensaje: estado.mensaje,
    aviso: estado.aviso ?? null,
    enviando,
    tituloRef,
    campo,
    anterior,
    enviar,
  };
}
