/**
 * Public contact details of the Employment Office (given by the Office,
 * 2026-10-21). It has no WhatsApp line: phone, email and in person only.
 * Change them here and every help card and the footer follow.
 */
const ASUNTO = encodeURIComponent("Consulta desde el Portal de Empleo")
const SALUDO = encodeURIComponent("Hola, les escribo desde el Portal de Empleo.\n\nMi consulta es: ")

export const OFICINA = {
  telefono: "(0341) 493-1164",
  /** Funes is in the Rosario area code (0341); international format for tel: links. */
  telefonoEnlace: "tel:+543414931164",
  email: "oficinaempleofunes@gmail.com",
  /** Opens the person's own mail app with the subject and a greeting already written. */
  emailEnlace: `mailto:oficinaempleofunes@gmail.com?subject=${ASUNTO}&body=${SALUDO}`,
  /** Same message in Gmail on the web: a mailto: link does nothing on computers with no mail app set up. */
  emailGmail: `https://mail.google.com/mail/?view=cm&fs=1&to=oficinaempleofunes@gmail.com&su=${ASUNTO}&body=${SALUDO}`,
  direccion: "Tomás de la Torre 1726, Funes",
  mapa: "https://www.google.com/maps/search/?api=1&query=Tom%C3%A1s+de+la+Torre+1726%2C+Funes%2C+Santa+Fe",
  horario: "Lunes a viernes de 7 a 13 h",
} as const
