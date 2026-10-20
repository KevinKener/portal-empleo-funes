import type { Metadata } from "next";
import Link from "next/link";
import { DocumentoLegal, type SeccionLegal } from "@/components/legal/DocumentoLegal";

export const metadata: Metadata = { title: "Política de privacidad" };

// Mirrors what the portal really does with personal data (AGENTS.md §3, RLS
// and the candidatos_empresa view); keep both in sync when that changes.
const SECCIONES: SeccionLegal[] = [
  {
    id: "responsable",
    titulo: "Quién es responsable de tus datos",
    contenido: (
      <p>
        La Municipalidad de Funes, a través de su Oficina de Empleo, es responsable de los datos personales que cargás
        en este portal, en los términos de la Ley N° 25.326 de Protección de los Datos Personales.
      </p>
    ),
  },
  {
    id: "datos",
    titulo: "Qué datos pedimos",
    contenido: (
      <>
        <p>Si buscás trabajo:</p>
        <ul>
          <li>DNI, nombre, apellido, localidad, dirección, teléfono y email.</li>
          <li>Tu CV: lo que cargás en el portal (experiencia, estudios, presentación) o el archivo que subís.</li>
          <li>Los rubros que te interesan.</li>
          <li>Opcionales: foto de perfil y, si vivís en Funes, comprobante de domicilio.</li>
        </ul>
        <p>Si sos una empresa:</p>
        <ul>
          <li>Razón social, CUIT, nombre comercial, teléfono, dirección y email.</li>
          <li>Opcional: constancia de inscripción en ARCA.</li>
        </ul>
      </>
    ),
  },
  {
    id: "finalidad",
    titulo: "Para qué los usamos",
    contenido: (
      <ul>
        <li>Acercar a vecinos que buscan trabajo con empresas que publican ofertas.</li>
        <li>Revisar postulaciones y preseleccionar candidatos para cada oferta.</li>
        <li>Verificar empresas, ofertas y domicilios.</li>
        <li>Acompañar a las personas contratadas y ofrecer cursos de capacitación.</li>
        <li>Elaborar estadísticas de empleo, siempre sin identificar a nadie.</li>
      </ul>
    ),
  },
  {
    id: "acceso",
    titulo: "Quién puede verlos",
    contenido: (
      <>
        <p>La Oficina de Empleo ve los datos de tu perfil para acompañarte en cada postulación.</p>
        <p>
          Una empresa solo ve tu nombre, tu localidad, tus rubros y tu CV cuando la Oficina te preselecciona para una de
          sus ofertas. Tu teléfono y tu email los ve recién cuando te elige para una entrevista.
        </p>
        <p>
          Tu DNI, tu dirección, tu foto y tu comprobante de domicilio nunca se comparten con empresas. En las ofertas
          públicas solo aparece el nombre comercial de la empresa.
        </p>
      </>
    ),
  },
  {
    id: "seguridad",
    titulo: "Cómo los protegemos",
    contenido: (
      <p>
        Los datos se guardan en servicios de infraestructura en la nube con acceso restringido por rol. Los archivos (CV,
        comprobantes y constancias) son privados y solo se abren con enlaces que vencen en minutos.
      </p>
    ),
  },
  {
    id: "conservacion",
    titulo: "Cuánto tiempo los guardamos",
    contenido: (
      <p>
        Mientras tu cuenta esté activa. Si pedís darla de baja, la Oficina de Empleo elimina tus datos, salvo los que deba
        conservar por obligación legal.
      </p>
    ),
  },
  {
    id: "derechos",
    titulo: "Tus derechos",
    contenido: (
      <>
        <p>
          Podés acceder a tus datos, actualizarlos, corregirlos o pedir que los eliminemos, en forma gratuita (artículos
          14 a 16 de la Ley N° 25.326). Muchos los podés cambiar vos mismo desde tu perfil; para lo demás, comunicate con
          la Oficina de Empleo de la Municipalidad de Funes.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la
          atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por
          incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    titulo: "Cookies y almacenamiento",
    contenido: (
      <p>
        Usamos solo las cookies necesarias para mantener tu sesión iniciada. Tu navegador también guarda, solo en tu
        dispositivo, qué novedades de tu panel ya viste. No usamos cookies de publicidad ni de seguimiento.
      </p>
    ),
  },
  {
    id: "cambios",
    titulo: "Cambios en esta política",
    contenido: (
      <p>
        Si cambiamos esta política, vas a ver la nueva versión en esta página con su fecha de actualización. Ver también
        los{" "}
        <Link href="/terminos" className="font-medium text-primary underline underline-offset-4">
          términos y condiciones
        </Link>
        .
      </p>
    ),
  },
];

/** Privacy policy (Ley 25.326). Draft until the Municipality's legal area reviews it. */
export default function PrivacidadPage() {
  return (
    <DocumentoLegal
      titulo="Política de privacidad"
      actualizado="20 de octubre de 2026"
      intro={<p>Qué datos te pedimos, para qué los usamos, quién los ve y cómo ejercer tus derechos.</p>}
      secciones={SECCIONES}
    />
  );
}
