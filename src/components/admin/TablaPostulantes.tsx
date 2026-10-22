import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { InsigniaDomicilio } from "@/components/admin/InsigniaDomicilio";
import { TablaAdmin, type ColumnaAdmin } from "@/components/admin/TablaAdmin";
import { TarjetaPostulanteAdmin } from "@/components/admin/TarjetaPostulanteAdmin";
import { Paginacion } from "@/components/ofertas/Paginacion";
import { Avatar } from "@/components/postulante/Avatar";
import { POSTULANTES_POR_PAGINA, type FilaPostulanteAdmin, type ListadoPostulantes, type OrdenPostulantes } from "@/lib/admin/postulantes";
import { datosClave } from "@/lib/datos-candidato";
import { formatearDni, haceCuanto } from "@/lib/formato";

const RUTA = "/admin/postulantes";
// One chip keeps every row the same height; the rest show on hover and in the profile
const RUBROS_VISIBLES = 1;

function Persona({ fila }: { fila: FilaPostulanteAdmin }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar nombre={fila.nombre} apellido={fila.apellido} foto={fila.foto} encuadre={fila.encuadre} tamanio="sm" />
      <span className="min-w-0">
        {/* The name link covers the whole row */}
        <Link
          href={`${RUTA}/${fila.id}`}
          title={`${fila.nombre} ${fila.apellido}`}
          className="block truncate font-semibold text-foreground group-hover:text-primary after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
        >
          {fila.apellido}, {fila.nombre}
        </Link>
        <span className="block text-xs text-muted-foreground">DNI {formatearDni(fila.dni)}</span>
      </span>
    </span>
  );
}

/** One line of the CV built on the platform, or a quiet dash. */
function Linea({ texto, detalle }: { texto: string | null; detalle?: string | null }) {
  if (!texto) return <span className="text-muted-foreground/60">—</span>;
  return (
    <span className="block truncate" title={detalle ? `${texto} · ${detalle}` : texto}>
      {texto}
      {detalle && <span className="block truncate text-xs text-muted-foreground">{detalle}</span>}
    </span>
  );
}

function Rubros({ fila }: { fila: FilaPostulanteAdmin }) {
  if (fila.categorias.length === 0) return <span className="text-muted-foreground/60">—</span>;
  const resto = fila.categorias.length - RUBROS_VISIBLES;
  return (
    <span className="flex min-w-0 items-center gap-1" title={fila.categorias.join(", ")}>
      {fila.categorias.slice(0, RUBROS_VISIBLES).map((categoria) => (
        <span key={categoria} className="min-w-0 truncate rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground/80">
          {categoria}
        </span>
      ))}
      {resto > 0 && <span className="shrink-0 text-xs font-medium text-muted-foreground">+{resto}</span>}
    </span>
  );
}

function Postulaciones({ fila }: { fila: FilaPostulanteAdmin }) {
  const { total, enCurso } = fila.postulaciones;
  if (total === 0) return <span className="text-muted-foreground/60">0</span>;
  return (
    <span className="block leading-tight">
      <span className="font-semibold">{total}</span>
      {enCurso > 0 && <span className="block text-xs font-medium text-primary">{enCurso} en curso</span>}
    </span>
  );
}

type PropsTablaPostulantes = {
  listado: ListadoPostulantes;
  ordenActual: OrdenPostulantes;
  momento: number;
  /** URL of the list with some params changed (null removes one), keeping the rest. */
  href: (cambios: Record<string, string | null>) => string;
};

/**
 * The Office's job seekers as a dense, sortable table (branch D2; NN/g:
 * tables beat cards for finding and comparing records): photo, name and
 * DNI, town and address, experience, education, categories, applications and
 * sign-up date, with the range and pagination in its footer. Cards below lg.
 */
export function TablaPostulantes({ listado, ordenActual, momento, href }: PropsTablaPostulantes) {
  const columnas: ColumnaAdmin<FilaPostulanteAdmin>[] = [
    { titulo: "Postulante", celda: (fila) => <Persona fila={fila} />, orden: "nombre", className: "w-[24%] max-w-0" },
    {
      titulo: "Localidad",
      celda: (fila) => <InsigniaDomicilio localidad={fila.localidad} estado={fila.estadoDomicilio} tieneComprobante={fila.tieneComprobante} />,
      orden: "funes",
      className: "w-[17%]",
    },
    {
      titulo: "Experiencia",
      celda: (fila) => {
        const datos = datosClave(fila, null, momento);
        if (!datos.experiencia && !datos.formacion && fila.tieneCvPdf) {
          return (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <FileText aria-hidden className="size-3.5 text-primary" /> CV adjunto
            </span>
          );
        }
        // The header already says "Experiencia": "5 años", not "5 años de experiencia"
        return <Linea texto={datos.experiencia?.replace(" de experiencia", "") ?? null} detalle={datos.ultimoPuesto} />;
      },
      className: "w-[14%] max-w-0",
    },
    { titulo: "Formación", celda: (fila) => <Linea texto={datosClave(fila, null, momento).formacion} />, className: "w-[15%] max-w-0" },
    { titulo: "Rubros", celda: (fila) => <Rubros fila={fila} />, secundaria: true, className: "w-[16%] max-w-0" },
    { titulo: "Postulaciones", celda: (fila) => <Postulaciones fila={fila} />, orden: "postulaciones", numerica: true },
    {
      titulo: "Alta",
      celda: (fila) => <span className="whitespace-nowrap text-muted-foreground">{haceCuanto(fila.creado, momento)}</span>,
      orden: "recientes",
      secundaria: true,
    },
    {
      titulo: "",
      celda: () => <ChevronRight aria-hidden className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />,
      className: "w-10 pr-3",
    },
  ];
  const desde = (listado.pagina - 1) * POSTULANTES_POR_PAGINA + 1;
  const hasta = desde + listado.filas.length - 1;

  return (
    <TablaAdmin
      titulo="Postulantes"
      filas={listado.filas}
      clave={(fila) => fila.id}
      columnas={columnas}
      orden={{ actual: ordenActual, href: (valor) => href({ orden: valor === "funes" ? null : valor, pagina: null }) }}
      tarjeta={(fila) => <TarjetaPostulanteAdmin fila={fila} momento={momento} />}
      pie={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            {desde}–{hasta} de {listado.total}
          </p>
          <Paginacion pagina={listado.pagina} totalPaginas={listado.totalPaginas} href={(numero) => href({ pagina: String(numero) })} />
        </div>
      }
    />
  );
}
