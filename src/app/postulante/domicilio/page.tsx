import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import { EncabezadoSeccion } from "@/components/postulante/EncabezadoSeccion";
import { SubidaArchivo } from "@/components/postulante/SubidaArchivo";
import { TarjetaSeccion } from "@/components/postulante/TarjetaSeccion";
import { requerirRol } from "@/lib/auth";
import { obtenerResumenPerfil } from "@/lib/perfil-postulante";

export const metadata: Metadata = { title: "Comprobante de domicilio" };

const ESTADOS = {
  pendiente: {
    icono: Clock,
    texto: "La Oficina de Empleo está revisando tu comprobante.",
    clase: "border border-border bg-muted",
  },
  verificado: {
    icono: CircleCheck,
    texto: "Tu domicilio está verificado.",
    clase: "bg-secondary text-secondary-foreground",
  },
  rechazado: {
    icono: TriangleAlert,
    texto: "La Oficina no pudo validar tu comprobante. Subí otro que muestre bien tu nombre y tu dirección en Funes.",
    clase: "border border-destructive/30 bg-destructive/5 text-destructive",
  },
} as const;

/**
 * Proof of address, only for Funes residents (Rule 4). Optional and never
 * blocks applying; the Office takes it into account when reviewing.
 */
export default async function DomicilioPage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const { localidad, comprobante_url, estado_domicilio } = resumen.postulante;

  if (localidad !== "funes") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <EncabezadoSeccion titulo="Comprobante de domicilio" descripcion="Solo se pide a quienes viven en Funes." />
        <p className="rounded-xl border border-border bg-muted p-4 text-sm">
          Según tus datos no vivís en Funes, así que no necesitás subir nada. Si te mudaste,{" "}
          <Link href="/postulante/datos" className="font-medium text-primary underline underline-offset-4">
            actualizá tus datos
          </Link>
          .
        </p>
      </div>
    );
  }

  const estado = comprobante_url ? ESTADOS[estado_domicilio] : null;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <EncabezadoSeccion
        titulo="Comprobante de domicilio"
        descripcion="Es opcional y no te impide postularte. La Oficina de Empleo prioriza a los vecinos de Funes y tiene en cuenta el comprobante al revisar tu perfil."
      />

      {estado && (
        <div className={`flex gap-3 rounded-xl p-4 ${estado.clase}`}>
          <estado.icono aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-medium">{estado.texto}</p>
        </div>
      )}

      <TarjetaSeccion
        titulo={comprobante_url ? "Tu comprobante" : "Subí tu comprobante"}
        descripcion="Sirve una boleta de luz, gas, agua o internet, un contrato de alquiler o tu DNI con el domicilio actualizado. Tiene que verse tu nombre y la dirección."
      >
        <SubidaArchivo
          tipo="comprobante"
          userId={userId}
          etiqueta="comprobante"
          cargado={Boolean(comprobante_url)}
          // A verified proof is only replaced, never removed (see eliminarArchivo)
          eliminable={estado_domicilio !== "verificado"}
        />
      </TarjetaSeccion>
    </div>
  );
}
