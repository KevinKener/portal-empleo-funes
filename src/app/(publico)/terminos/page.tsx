import type { Metadata } from "next";
import Link from "next/link";
import { DocumentoLegal, type SeccionLegal } from "@/components/legal/DocumentoLegal";

export const metadata: Metadata = { title: "Términos y condiciones" };

// Mirrors the business rules in AGENTS.md §2 (the Office in the middle,
// nothing published without approval); keep both in sync.
const SECCIONES: SeccionLegal[] = [
  {
    id: "objeto",
    titulo: "Qué es este portal",
    contenido: (
      <p>
        El Portal de Empleo es un servicio gratuito de la Oficina de Empleo de la Municipalidad de Funes para acercar a
        personas que buscan trabajo con empresas que ofrecen puestos. Al crear una cuenta, aceptás estos términos y la{" "}
        <Link href="/privacidad" className="font-medium text-primary underline underline-offset-4">
          política de privacidad
        </Link>
        .
      </p>
    ),
  },
  {
    id: "oficina",
    titulo: "El rol de la Oficina de Empleo",
    contenido: (
      <ul>
        <li>Revisa y aprueba a las empresas antes de que puedan publicar ofertas.</li>
        <li>Revisa cada oferta antes de publicarla, y puede pedir cambios o no publicarla.</li>
        <li>Revisa las postulaciones y preselecciona a las personas que presenta a cada empresa.</li>
        <li>
          Acompaña el proceso, pero no es parte de la relación laboral entre la persona y la empresa ni garantiza una
          contratación.
        </li>
      </ul>
    ),
  },
  {
    id: "cuentas",
    titulo: "Tu cuenta",
    contenido: (
      <ul>
        <li>Los datos que cargás tienen que ser verdaderos y estar actualizados.</li>
        <li>Tu contraseña es personal: no la compartas. Si creés que alguien la conoce, cambiala.</li>
        <li>Cada persona o empresa puede tener una sola cuenta.</li>
      </ul>
    ),
  },
  {
    id: "postulantes",
    titulo: "Si buscás trabajo",
    contenido: (
      <ul>
        <li>Podés postularte a cualquier oferta publicada, una vez por oferta.</li>
        <li>
          Tu perfil y tu CV los ve la Oficina de Empleo; la empresa solo ve lo que se detalla en la política de
          privacidad, y únicamente si te preseleccionan.
        </li>
        <li>Postularte no asegura una entrevista ni un puesto.</li>
      </ul>
    ),
  },
  {
    id: "empresas",
    titulo: "Si sos una empresa",
    contenido: (
      <ul>
        <li>Las ofertas tienen que describir puestos reales, legales y con condiciones claras.</li>
        <li>
          No se aceptan requisitos discriminatorios por género, edad, religión, nacionalidad, origen, orientación sexual,
          aspecto físico ni ningún otro motivo prohibido por la Ley N° 23.592.
        </li>
        <li>Los datos de contacto de los candidatos se usan solo para el proceso de selección de esa oferta.</li>
        <li>Te pedimos que registres en el portal a quién contrataste, para que la Oficina pueda medir cuánta gente consigue trabajo.</li>
      </ul>
    ),
  },
  {
    id: "uso",
    titulo: "Uso no permitido",
    contenido: (
      <ul>
        <li>Cargar datos falsos o de otra persona.</li>
        <li>Publicar ofertas engañosas, cobrar a los postulantes o pedirles pagos de cualquier tipo.</li>
        <li>Usar los datos de otras personas para fines distintos a la búsqueda laboral.</li>
        <li>Intentar acceder a información o áreas del portal que no te corresponden.</li>
      </ul>
    ),
  },
  {
    id: "suspension",
    titulo: "Suspensión de cuentas",
    contenido: (
      <p>
        La Oficina de Empleo puede rechazar ofertas, dejar de publicarlas o suspender cuentas que no cumplan estos
        términos.
      </p>
    ),
  },
  {
    id: "cambios",
    titulo: "Cambios en estos términos",
    contenido: (
      <p>
        Si cambiamos estos términos, vas a ver la nueva versión en esta página con su fecha de actualización. Se rigen
        por las leyes de la República Argentina.
      </p>
    ),
  },
];

/** Terms of use. Draft until the Municipality's legal area reviews it. */
export default function TerminosPage() {
  return (
    <DocumentoLegal
      titulo="Términos y condiciones"
      actualizado="20 de octubre de 2026"
      intro={<p>Las reglas para usar el Portal de Empleo de la Municipalidad de Funes, en palabras simples.</p>}
      secciones={SECCIONES}
    />
  );
}
