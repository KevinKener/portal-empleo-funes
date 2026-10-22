import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, Inbox, Send } from "lucide-react";
import { PaginaArea } from "@/components/layout/PaginaArea";
import { textoGrupo } from "@/components/postulante/ContadoresPostulaciones";
import { TarjetaPostulacion } from "@/components/postulante/TarjetaPostulacion";
import { buttonVariants } from "@/components/ui/button";
import { requerirRol } from "@/lib/auth";
import { contarPorGrupo, empresasDeOfertas, separarPostulaciones, type EmpresaDeOferta } from "@/lib/panel-postulante";
import { obtenerResumenPerfil } from "@/lib/perfil-postulante";
import { listarMisPostulaciones, type MiPostulacion } from "@/lib/postulaciones";

export const metadata: Metadata = { title: "Mis postulaciones" };

/**
 * Every application of the signed-in job seeker: counts per status, then the
 * ones still moving (furthest stage first) and, apart, the finished ones.
 */
export default async function PostulacionesPage() {
  const { userId } = await requerirRol("postulante");
  const resumen = await obtenerResumenPerfil(userId);
  if (!resumen) notFound();
  const postulaciones = await listarMisPostulaciones(resumen.postulante.id);
  const empresas = await empresasDeOfertas(postulaciones.flatMap((p) => (p.oferta ? [p.oferta.id] : [])));
  const { activas, finalizadas } = separarPostulaciones(postulaciones);

  return (
    <PaginaArea
      titulo="Mis postulaciones"
      descripcion="Seguí en qué etapa está cada postulación. La Oficina de Empleo revisa tu perfil antes de enviarlo a la empresa."
      banda={{
        // What is with the company stands out: it is the stage that moves next
        cifras: contarPorGrupo(postulaciones).map(({ grupo, cantidad }) => ({
          valor: cantidad,
          texto: textoGrupo(grupo, cantidad),
          destacada: grupo === "con_la_empresa" || grupo === "contratado",
        })),
        accion: postulaciones.length > 0 ? { href: "/ofertas", texto: "Buscar más ofertas" } : null,
      }}
    >
      {postulaciones.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Inbox aria-hidden className="size-7" />
          </span>
          <p className="font-heading text-lg font-semibold">Todavía no te postulaste a ninguna oferta.</p>
          <p className="max-w-sm text-sm text-muted-foreground">Cuando lo hagas, acá vas a ver en qué etapa está cada una y qué sigue.</p>
          <Link href="/ofertas" className={buttonVariants({ className: "mt-2 h-11 px-6 text-base hover:bg-primary-hover" })}>
            Ver ofertas
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <Grupo titulo="En curso" Icono={Send} postulaciones={activas} empresas={empresas} vacio="No tenés postulaciones en curso. ¡Buscá una oferta nueva!" />
          {finalizadas.length > 0 && <Grupo titulo="Finalizadas" Icono={Archive} postulaciones={finalizadas} empresas={empresas} desde={activas.length} />}
        </div>
      )}
    </PaginaArea>
  );
}

function Grupo({
  titulo,
  Icono,
  postulaciones,
  empresas,
  vacio,
  desde = 0,
}: {
  titulo: string;
  Icono: typeof Send;
  postulaciones: MiPostulacion[];
  empresas: Map<string, EmpresaDeOferta>;
  vacio?: string;
  /** Cards already shown above, so the entrance keeps flowing down the page. */
  desde?: number;
}) {
  return (
    <section aria-label={titulo} className="space-y-4">
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <Icono aria-hidden className="size-5 text-primary" />
        {titulo}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{postulaciones.length}</span>
      </h2>
      {postulaciones.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {postulaciones.map((postulacion, i) => (
            <li
              key={postulacion.id}
              className="motion-safe:animate-entrada"
              style={{ "--retraso": `${Math.min(desde + i, 8) * 80}ms` } as CSSProperties}
            >
              <TarjetaPostulacion postulacion={postulacion} empresa={postulacion.oferta ? empresas.get(postulacion.oferta.id) : undefined} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
