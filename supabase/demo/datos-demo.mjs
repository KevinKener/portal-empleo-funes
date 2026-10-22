// Demo data for showing the portal (decision 2026-10-22): companies arriving in Funes,
// their offers, job seekers at every stage, and three accounts to log in with
// (job seeker, company, Office). Run from the repo root:
//
//   node supabase/demo/datos-demo.mjs listar       # what is in the database (read-only)
//   node supabase/demo/datos-demo.mjs limpiar      # deletes every non-Admin account and its files
//   node supabase/demo/datos-demo.mjs crear        # creates the demo; prints the 3 logins once
//   node supabase/demo/datos-demo.mjs borrar-demo  # removes everything this script created
//
// Uses SUPABASE_SECRET_KEY from .env (server-side, never committed). Passwords are
// generated on every `crear` and only printed, never stored. Real brand names are
// used because these companies are arriving in Funes, but without their official
// logos, and every offer says it is an example at the end of its requirements.

import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { randomInt } from "node:crypto"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const { createClient } = createRequire(`${RAIZ}/package.json`)("@supabase/supabase-js")

const env = Object.fromEntries(
  readFileSync(`${RAIZ}/.env`, "utf8")
    .split("\n")
    .filter((linea) => linea.includes("=") && !linea.trim().startsWith("#"))
    .map((linea) => {
      const i = linea.indexOf("=")
      return [linea.slice(0, i).trim(), linea.slice(i + 1).trim().replace(/^"|"$/g, "")]
    }),
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

// Every demo account uses this suffix, so borrar-demo finds them all
const SUFIJO = ".demo@example.com"
const BUCKETS = ["cvs", "comprobantes-domicilio", "constancias-arca", "fotos-perfil", "logos-empresa"]
// At the end of the requirements: shown inside the offer, never in the card previews
const NOTA_DEMO = "Oferta de ejemplo para la demostración del Portal de Empleo de Funes."
const DIA = 24 * 60 * 60 * 1000

const haceDias = (dias) => new Date(Date.now() - dias * DIA).toISOString()
// Plain day in Funes time (the database checks closing dates against hoy_argentina())
const enDias = (dias) => new Date(Date.now() - 3 * 60 * 60 * 1000 + dias * DIA).toISOString().slice(0, 10)

function falla(paso, error) {
  if (error) throw new Error(`${paso}: ${error.message ?? error}`)
}

function contrasena() {
  const letras = "abcdefghjkmnpqrstuvwxyz"
  const parte = Array.from({ length: 4 }, () => letras[randomInt(letras.length)]).join("")
  return `Funes-${parte}-${randomInt(1000, 9999)}`
}

/** Valid CUIT (check digit as cuitValido() in src/lib/validaciones/auth.ts) from a 10-digit base. */
function cuit(base) {
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = pesos.reduce((total, peso, i) => total + peso * Number(base[i]), 0)
  const resto = 11 - (suma % 11)
  return base + (resto === 11 ? 0 : resto === 10 ? 9 : resto)
}

/** A one-page PDF with a line of text: placeholder CV and proof of address. */
function pdf(texto) {
  const contenido = `BT /F1 14 Tf 72 720 Td (${texto}) Tj ET`
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]
  let salida = "%PDF-1.4\n"
  const posiciones = []
  objetos.forEach((objeto, i) => {
    posiciones.push(salida.length)
    salida += `${i + 1} 0 obj\n${objeto}\nendobj\n`
  })
  const xref = salida.length
  salida += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const p of posiciones) salida += `${String(p).padStart(10, "0")} 00000 n \n`
  salida += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([salida], { type: "application/pdf" })
}

async function todosLosUsuarios() {
  const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 })
  falla("listar usuarios", error)
  return data.users
}

/** Deletes a user's files in every bucket (Storage does not cascade), then the user (the database does). */
async function borrarCuenta(usuario) {
  for (const bucket of BUCKETS) {
    const { data } = await db.storage.from(bucket).list(usuario.id)
    if (data?.length) await db.storage.from(bucket).remove(data.map((archivo) => `${usuario.id}/${archivo.name}`))
  }
  const { error } = await db.auth.admin.deleteUser(usuario.id)
  falla(`borrar ${usuario.email}`, error)
}

async function listar() {
  const usuarios = await todosLosUsuarios()
  const { data: perfiles } = await db.from("perfiles").select("id, rol")
  const rol = new Map(perfiles.map((p) => [p.id, p.rol]))
  const ocultar = (email) => email?.replace(/^(.{2}).*(@.*)$/, "$1…$2") ?? "-"
  console.log(`Cuentas: ${usuarios.length}`)
  for (const u of usuarios) console.log(`- ${(rol.get(u.id) ?? "sin perfil").padEnd(10)} ${ocultar(u.email)}`)
}

async function limpiar() {
  const { data: admins } = await db.from("perfiles").select("id").eq("rol", "admin")
  const quedan = new Set(admins.map((a) => a.id))
  const borrar = (await todosLosUsuarios()).filter((u) => !quedan.has(u.id))
  for (const usuario of borrar) await borrarCuenta(usuario)
  console.log(`Borradas ${borrar.length} cuentas (con sus datos y archivos). Quedan ${quedan.size} Admin.`)
}

async function borrarDemo() {
  const demo = (await todosLosUsuarios()).filter((u) => u.email?.endsWith(SUFIJO))
  for (const usuario of demo) await borrarCuenta(usuario)
  console.log(`Borradas ${demo.length} cuentas de demostración.`)
}

// ---------------------------------------------------------------------------
// Demo content
// ---------------------------------------------------------------------------

const EMPRESAS = [
  { clave: "mcdonalds", nombre: "McDonald's", base: "3071900001", direccion: "Av. Galarza 2150, Funes", alta: 30 },
  { clave: "rockfeller", nombre: "Rock & Feller's", base: "3071900002", direccion: "Hipólito Yrigoyen 1890, Funes", alta: 28 },
  // The company login of the demo: offers at every stage
  { clave: "starbucks", nombre: "Starbucks", base: "3071900003", direccion: "Av. Fuerza Aérea 2350, Funes", alta: 45, login: true },
  { clave: "lagallega", nombre: "La Gallega", base: "3071900004", direccion: "Córdoba 1650, Funes", alta: 26 },
  { clave: "lareina", nombre: "La Reina", base: "3071900005", direccion: "San José 1320, Funes", alta: 25 },
  { clave: "mostaza", nombre: "Mostaza", base: "3071900006", direccion: "Av. Galarza 2480, Funes", alta: 20 },
  { clave: "shell", nombre: "Shell", base: "3071900007", direccion: "Ruta 9 km 315, Funes", alta: 18 },
  // Waiting for the Office: the Bandeja's "Empresas por verificar"
  { clave: "axion", nombre: "Axion Energy", base: "3071900008", direccion: "Ruta 9 km 317, Funes", alta: 2, pendiente: true },
]

const POSTULANTES = [
  {
    clave: "maria", nombre: "María", apellido: "Fernández", dni: "40123456", localidad: "funes", direccion: "Mitre 1450", alta: 21,
    domicilio: "verificado", login: true,
    descripcion: "Me gusta el trato con la gente y aprendo rápido. Tengo disponibilidad horaria completa y vivo cerca del centro.",
    rubros: ["Gastronomía", "Atención al cliente", "Comercio y ventas"],
    experiencias: [
      { puesto: "Cajera", empresa: "Autoservicio Don José", desde: "2024-03-01", hasta: null, tareas: "Cobro, arqueo de caja y atención al público." },
      { puesto: "Moza", empresa: "Bar del Centro", desde: "2022-01-01", hasta: "2024-02-01", tareas: "Atención de mesas y armado del salón." },
    ],
    formaciones: [
      { nivel: "secundario", titulo: "Bachiller en Economía", institucion: "Escuela Nº 1234", estado: "completo" },
      { nivel: "curso", titulo: "Manipulación de alimentos", institucion: "Municipalidad de Funes", estado: "completo" },
    ],
  },
  {
    clave: "lucas", nombre: "Lucas", apellido: "Gómez", dni: "39876543", localidad: "funes", direccion: "Belgrano 980", alta: 14, domicilio: "verificado",
    rubros: ["Logística y transporte", "Comercio y ventas"],
    experiencias: [{ puesto: "Repartidor", empresa: "Distribuidora Funes", desde: "2021-05-01", hasta: null, tareas: "Reparto en moto y control de remitos." }],
    formaciones: [{ nivel: "secundario", titulo: "Secundario completo", institucion: null, estado: "completo" }],
  },
  {
    clave: "sofia", nombre: "Sofía", apellido: "Martínez", dni: "42345678", localidad: "funes", direccion: "Sarmiento 2210", alta: 9,
    // Uploaded a proof: the Bandeja's "Domicilios por verificar"
    domicilio: "comprobante",
    descripcion: "Estudio gastronomía y trabajé como barista. Busco un trabajo de media jornada para combinar con la carrera.",
    rubros: ["Gastronomía", "Atención al cliente"],
    experiencias: [{ puesto: "Barista", empresa: "Café de Rosario", desde: "2023-02-01", hasta: "2025-06-01", tareas: "Preparación de café de especialidad y caja." }],
    formaciones: [{ nivel: "terciario", titulo: "Técnica en Gastronomía", institucion: "Instituto Gastronómico Rosario", estado: "en_curso" }],
  },
  {
    clave: "joaquin", nombre: "Joaquín", apellido: "Pereyra", dni: "41234567", localidad: "roldan", direccion: "Catamarca 455", alta: 12,
    rubros: ["Construcción", "Industria y producción"],
    experiencias: [{ puesto: "Ayudante de albañil", empresa: "Obras Roldán", desde: "2019-03-01", hasta: "2023-12-01", tareas: null }],
    formaciones: [{ nivel: "secundario", titulo: "Secundario", institucion: null, estado: "incompleto" }],
  },
  {
    clave: "valentina", nombre: "Valentina", apellido: "Ruiz", dni: "43456789", localidad: "funes", direccion: "Moreno 1780", alta: 40,
    rubros: ["Administración", "Atención al cliente"],
    experiencias: [{ puesto: "Recepcionista", empresa: "Consultorios Funes", desde: "2022-08-01", hasta: null, tareas: "Turnos, agenda y atención telefónica." }],
    formaciones: [{ nivel: "universitario", titulo: "Licenciatura en Administración", institucion: "UNR", estado: "en_curso" }],
  },
  {
    clave: "martin", nombre: "Martín", apellido: "Sosa", dni: "38765432", localidad: "rosario", direccion: "Pellegrini 3400", alta: 6,
    // CV uploaded as a file, the path for people less comfortable building it (Rule 6)
    cvPdf: true, rubros: ["Logística y transporte"], experiencias: [], formaciones: [],
  },
  {
    clave: "camila", nombre: "Camila", apellido: "Acosta", dni: "44567890", localidad: "funes", direccion: "Alvear 610", alta: 4, domicilio: "verificado",
    descripcion: "Es mi primer trabajo. Soy responsable y me encanta la cocina.",
    rubros: ["Gastronomía", "Comercio y ventas"], experiencias: [],
    formaciones: [{ nivel: "secundario", titulo: "Secundario", institucion: "Escuela Nº 556", estado: "en_curso" }],
  },
  {
    clave: "diego", nombre: "Diego", apellido: "Benítez", dni: "37654321", localidad: "funes", direccion: "Italia 1120", alta: 35, domicilio: "verificado",
    rubros: ["Comercio y ventas"],
    experiencias: [{ puesto: "Carnicero", empresa: "Carnicería El Novillo", desde: "2012-04-01", hasta: "2024-09-01", tareas: "Despostado, atención y pedidos." }],
    formaciones: [{ nivel: "primario", titulo: "Primario", institucion: null, estado: "completo" }],
  },
  {
    clave: "agustina", nombre: "Agustina", apellido: "López", dni: "45678901", localidad: "otra", direccion: "Ibarlucea, calle 5 Nº 230", alta: 10,
    rubros: ["Atención al cliente", "Limpieza y mantenimiento"],
    experiencias: [{ puesto: "Personal de limpieza", empresa: "Edificio Central", desde: "2020-01-01", hasta: null, tareas: null }],
    formaciones: [{ nivel: "secundario", titulo: "Secundario completo", institucion: null, estado: "completo" }],
  },
]

// empresa, título, rubro, jornada, estado, prioridad, publicada hace N días (or enviada), cierre en N días
const OFERTAS = [
  { clave: "mc-crew", empresa: "mcdonalds", titulo: "Crew de cocina y caja", rubro: "Gastronomía", jornada: "media_jornada", estado: "publicada", urgente: true, hace: 5, cierre: 25,
    descripcion: "Sumate al equipo de la nueva sucursal de Funes. Vas a preparar pedidos, atender la caja y mantener el orden del local.",
    requisitos: "Mayor de 18 años. Disponibilidad para turnos rotativos. No hace falta experiencia: te capacitamos." },
  { clave: "mc-encargado", empresa: "mcdonalds", titulo: "Encargado/a de turno", rubro: "Gastronomía", jornada: "completa", estado: "publicada", hace: 12, cierre: 18,
    descripcion: "Coordinarás al equipo del turno, el stock y la atención para que cada pedido salga a tiempo.",
    requisitos: "Experiencia liderando equipos en gastronomía o comercio. Secundario completo." },
  { clave: "rf-mozo", empresa: "rockfeller", titulo: "Mozo/a de salón", rubro: "Gastronomía", jornada: "media_jornada", estado: "publicada", hace: 1, cierre: 30,
    descripcion: "Buscamos mozos y mozas para el salón de Funes, con buena onda y ganas de atender bien.",
    requisitos: "Experiencia en salón (deseable). Disponibilidad noches y fines de semana." },
  { clave: "rf-bartender", empresa: "rockfeller", titulo: "Bartender", rubro: "Gastronomía", jornada: "por_horas", estado: "pendiente", enviada: 1,
    descripcion: "Preparación de tragos clásicos y de autor en la barra del local.", requisitos: "Experiencia comprobable en barra." },
  { clave: "sb-barista", empresa: "starbucks", titulo: "Barista", rubro: "Gastronomía", jornada: "media_jornada", estado: "publicada", hace: 9, cierre: 21,
    descripcion: "Prepará café de especialidad y hacé que cada cliente se sienta en casa en la primera tienda de Funes.",
    requisitos: "Gusto por la atención al público. Disponibilidad 4 horas diarias. Experiencia con café (deseable)." },
  { clave: "sb-supervisor", empresa: "starbucks", titulo: "Supervisor/a de tienda", rubro: "Comercio y ventas", jornada: "completa", estado: "pendiente", enviada: 4,
    descripcion: "Liderá la operación diaria de la tienda: equipo, caja, stock y experiencia del cliente.",
    requisitos: "Dos años de experiencia como supervisor/a en gastronomía o retail." },
  { clave: "sb-finde", empresa: "starbucks", titulo: "Barista fines de semana", rubro: "Gastronomía", jornada: "por_horas", estado: "borrador",
    descripcion: "Turnos de sábados y domingos para la tienda de Funes.", requisitos: null },
  { clave: "sb-apertura", empresa: "starbucks", titulo: "Cajero/a para la apertura", rubro: "Atención al cliente", jornada: "temporal", estado: "cerrada", hace: 40,
    descripcion: "Refuerzo para las primeras semanas de la tienda.", requisitos: "Experiencia en caja." },
  { clave: "lg-repositor", empresa: "lagallega", titulo: "Repositor/a", rubro: "Comercio y ventas", jornada: "completa", estado: "publicada", urgente: true, hace: 6, cierre: 2,
    descripcion: "Reposición de góndolas, control de vencimientos y orden del salón en la nueva sucursal.",
    requisitos: "Secundario completo. Disponibilidad turno mañana." },
  { clave: "lg-cajero", empresa: "lagallega", titulo: "Cajero/a", rubro: "Comercio y ventas", jornada: "media_jornada", estado: "publicada", hace: 15, cierre: 15,
    descripcion: "Atención en línea de cajas y cobro con todos los medios de pago.", requisitos: "Experiencia en caja (deseable)." },
  { clave: "lr-carnicero", empresa: "lareina", titulo: "Carnicero/a", rubro: "Comercio y ventas", jornada: "completa", estado: "publicada", hace: 8, cierre: 22,
    descripcion: "Despostado, preparación de cortes y atención en el mostrador de carnicería.", requisitos: "Experiencia comprobable como carnicero/a." },
  // Published a while ago with nobody applying: the Bandeja's "Ofertas sin postulantes"
  { clave: "lr-chofer", empresa: "lareina", titulo: "Chofer de reparto", rubro: "Logística y transporte", jornada: "completa", estado: "publicada", hace: 10, cierre: 20,
    descripcion: "Reparto de pedidos a domicilio en Funes y Roldán con vehículo de la empresa.", requisitos: "Licencia de conducir profesional vigente." },
  { clave: "mz-crew", empresa: "mostaza", titulo: "Crew de cocina", rubro: "Gastronomía", jornada: "media_jornada", estado: "publicada", hace: 3, cierre: 27,
    descripcion: "Preparación de hamburguesas y papas, siguiendo los estándares de calidad de la marca.", requisitos: "Mayor de 18 años." },
  { clave: "sh-playero", empresa: "shell", titulo: "Playero/a", rubro: "Atención al cliente", jornada: "completa", estado: "publicada", hace: 11, cierre: 19,
    descripcion: "Carga de combustible, cobro y atención a los clientes de la estación sobre Ruta 9.", requisitos: "Disponibilidad para turnos rotativos, incluso noche." },
  { clave: "sh-shop", empresa: "shell", titulo: "Vendedor/a de Shop", rubro: "Comercio y ventas", jornada: "media_jornada", estado: "pendiente", enviada: 2,
    descripcion: "Atención y venta en la tienda de la estación de servicio.", requisitos: "Secundario completo." },
]

// postulante, oferta, estado, días desde que se postuló, motivo when rejected
const POSTULACIONES = [
  ["maria", "sb-barista", "preseleccionado", 7], ["maria", "mc-crew", "pendiente", 4], ["maria", "lg-repositor", "rechazado", 5, "cupo_completo"], ["maria", "rf-mozo", "pendiente", 1],
  ["sofia", "sb-barista", "entrevista", 8], ["camila", "sb-barista", "preseleccionado", 3], ["valentina", "sb-barista", "pendiente", 2],
  ["agustina", "sb-barista", "rechazado", 6, "no_seleccionado"], ["lucas", "sb-barista", "pendiente", 5],
  ["valentina", "sb-apertura", "contratado", 38], ["diego", "sb-apertura", "rechazado", 37, "cupo_completo"],
  ["camila", "mc-crew", "pendiente", 2], ["lucas", "mc-crew", "pendiente", 3], ["agustina", "mc-encargado", "pendiente", 6],
  ["sofia", "rf-mozo", "pendiente", 1], ["diego", "lg-repositor", "pendiente", 4], ["lucas", "lg-repositor", "pendiente", 5],
  ["valentina", "lg-cajero", "pendiente", 9], ["diego", "lr-carnicero", "preseleccionado", 6], ["martin", "sh-playero", "pendiente", 5],
  ["joaquin", "sh-playero", "pendiente", 7], ["camila", "mz-crew", "pendiente", 2],
]

async function crearUsuario(email, contrasenaUsuario, metadatos, appMetadatos) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: contrasenaUsuario,
    email_confirm: true,
    user_metadata: metadatos,
    app_metadata: appMetadatos,
  })
  falla(`crear ${email}`, error)
  return data.user.id
}

async function crear() {
  const existentes = (await todosLosUsuarios()).filter((u) => u.email?.endsWith(SUFIJO))
  if (existentes.length > 0) throw new Error("Ya hay datos de demostración: corré `borrar-demo` antes de crearlos de nuevo.")

  const { data: categorias, error: errorCategorias } = await db.from("categorias").select("id, nombre")
  falla("categorías", errorCategorias)
  const categoria = (nombre) => {
    const encontrada = categorias.find((c) => c.nombre === nombre)
    if (!encontrada) throw new Error(`Falta la categoría ${nombre}`)
    return encontrada.id
  }
  const logins = {}

  // Companies: the sign-up trigger creates perfiles + empresas from the metadata
  const empresaId = {}
  for (const e of EMPRESAS) {
    const clave = contrasena()
    const uid = await crearUsuario(`${e.clave}${SUFIJO}`, clave, {
      rol: "empresa",
      razon_social: `${e.nombre} Funes S.A.`,
      cuit: cuit(e.base),
      nombre_comercial: e.nombre,
      telefono: `341 49${String(e.base).slice(-5)}`,
      direccion: e.direccion,
    })
    const { data: fila, error } = await db
      .from("empresas")
      .update({ estado: e.pendiente ? "pendiente" : "verificado", created_at: haceDias(e.alta) })
      .eq("perfil_id", uid)
      .select("id")
      .single()
    falla(`empresa ${e.nombre}`, error)
    empresaId[e.clave] = fila.id
    if (e.login) logins.empresa = { usuario: `CUIT ${cuit(e.base)} (${e.nombre})`, contrasena: clave }
  }

  // Job seekers, their categories, CV built on the platform and files
  const postulanteId = {}
  for (const p of POSTULANTES) {
    const clave = contrasena()
    const uid = await crearUsuario(`${p.clave}${SUFIJO}`, clave, {
      rol: "postulante",
      dni: p.dni,
      nombre: p.nombre,
      apellido: p.apellido,
      localidad: p.localidad,
      direccion: p.direccion,
      telefono: `341 5${p.dni.slice(-6)}`,
    })
    const { data: fila, error } = await db.from("postulantes").select("id").eq("perfil_id", uid).single()
    falla(`postulante ${p.nombre}`, error)
    const id = fila.id
    postulanteId[p.clave] = id

    const cambios = { created_at: haceDias(p.alta), descripcion: p.descripcion ?? null }
    if (p.cvPdf) {
      const ruta = `${uid}/cv.pdf`
      falla("subir CV", (await db.storage.from("cvs").upload(ruta, pdf(`CV de ${p.nombre} ${p.apellido} - ejemplo`), { upsert: true })).error)
      cambios.cv_url = ruta
    }
    // Verified addresses also have their proof, as if the Office had reviewed it
    if (p.domicilio === "comprobante" || p.domicilio === "verificado") {
      const ruta = `${uid}/comprobante.pdf`
      falla("subir comprobante", (await db.storage.from("comprobantes-domicilio").upload(ruta, pdf("Comprobante de domicilio - ejemplo"), { upsert: true })).error)
      cambios.comprobante_url = ruta
    }
    falla(`datos de ${p.nombre}`, (await db.from("postulantes").update(cambios).eq("id", id)).error)
    // A separate update: changing the proof sends the address back to pendiente (Rule 4)
    if (p.domicilio === "verificado") {
      falla(`domicilio de ${p.nombre}`, (await db.from("postulantes").update({ estado_domicilio: "verificado" }).eq("id", id)).error)
    }

    if (p.rubros.length) {
      falla("rubros", (await db.from("postulante_categorias").insert(p.rubros.map((r) => ({ postulante_id: id, categoria_id: categoria(r) })))).error)
    }
    if (p.experiencias.length) {
      falla("experiencias", (await db.from("experiencias").insert(p.experiencias.map((x) => ({ ...x, postulante_id: id })))).error)
    }
    if (p.formaciones.length) {
      falla("formaciones", (await db.from("formaciones").insert(p.formaciones.map((x) => ({ ...x, postulante_id: id })))).error)
    }
    if (p.login) logins.postulante = { usuario: `DNI ${p.dni} (${p.nombre} ${p.apellido})`, contrasena: clave }
  }

  // Offers, inserted in their final status (the Office's review is skipped for the demo)
  const ofertaId = {}
  for (const o of OFERTAS) {
    const enviada = o.enviada ?? o.hace
    const fila = {
      empresa_id: empresaId[o.empresa],
      categoria_id: categoria(o.rubro),
      titulo: o.titulo,
      descripcion: o.descripcion,
      requisitos: o.requisitos ? `${o.requisitos}\n\n${NOTA_DEMO}` : NOTA_DEMO,
      jornada: o.jornada,
      estado: o.estado,
      prioridad: o.urgente ? "urgente" : "normal",
      created_at: haceDias((enviada ?? 1) + 1),
      fecha_envio: o.estado === "borrador" ? null : haceDias(enviada ?? 1),
      fecha_publicacion: o.hace !== undefined && o.estado !== "pendiente" ? haceDias(o.hace) : null,
      fecha_cierre: o.cierre ? enDias(o.cierre) : null,
    }
    const { data, error } = await db.from("ofertas").insert(fila).select("id").single()
    falla(`oferta ${o.titulo}`, error)
    ofertaId[o.clave] = data.id
  }

  // Applications at every stage, so each panel has something to show
  for (const [persona, oferta, estado, dias, motivo] of POSTULACIONES) {
    const preseleccionada = ["preseleccionado", "entrevista", "contratado"].includes(estado) || (estado === "rechazado" && motivo === "cupo_completo" && oferta === "sb-apertura")
    const { error } = await db.from("postulaciones").insert({
      oferta_id: ofertaId[oferta],
      postulante_id: postulanteId[persona],
      estado,
      motivo_rechazo: estado === "rechazado" ? motivo : null,
      created_at: haceDias(dias),
      fecha_preseleccion: preseleccionada ? haceDias(Math.max(dias - 2, 0)) : null,
    })
    falla(`postulación ${persona} → ${oferta}`, error)
  }

  // The demo Office account. GoTrue writes app_metadata after the insert, so the
  // sign-up trigger never sees rol = admin: the profile is created here (admin.md, branch H)
  const claveAdmin = contrasena()
  const adminId = await crearUsuario(`admin${SUFIJO}`, claveAdmin, {}, { rol: "admin" })
  const { data: perfilAdmin } = await db.from("perfiles").select("id").eq("id", adminId).maybeSingle()
  if (!perfilAdmin) falla("perfil admin", (await db.from("perfiles").insert({ id: adminId, rol: "admin" })).error)
  logins.admin = { usuario: `admin${SUFIJO}`, contrasena: claveAdmin }

  console.log(`Creadas ${EMPRESAS.length} empresas, ${POSTULANTES.length} postulantes, ${OFERTAS.length} ofertas y ${POSTULACIONES.length} postulaciones.\n`)
  console.log("Ingresos de la demo (guardalos: no se vuelven a mostrar):")
  for (const [rol, { usuario, contrasena: clave }] of Object.entries(logins)) console.log(`- ${rol.padEnd(10)} ${usuario}  ·  ${clave}`)
}

const MODOS = { listar, limpiar, crear, "borrar-demo": borrarDemo }
const modo = process.argv[2]
if (!MODOS[modo]) {
  console.log("Uso: node supabase/demo/datos-demo.mjs listar | limpiar | crear | borrar-demo")
  process.exit(1)
}
await MODOS[modo]()
