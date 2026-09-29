# Roadmap — Portal Municipal de Empleo

Plan de trabajo del MVP (~3 meses) dividido en fases. Cada fase termina en algo **demostrable**, para poder mostrar avances concretos en cada revisión.

Leyenda: `[x]` hecho · `[ ]` pendiente · `[~]` en curso

---

## Estado actual

- **Fase en curso:** Fase 1 — Supabase y modelo de datos
- **Último avance:** integración de Supabase commiteada en `feature/supabase-setup` (clientes, dependencias, `.env.example`); documentación del proyecto en `docs/documentacion-proyecto`. Sin push.
- **Próximo paso:** validar con el equipo el esquema de datos propuesto antes de escribir la migración inicial.

> Actualizar esta sección al cerrar cada sesión de trabajo.

---

## Fase 0 — Base del proyecto ✅

**Objetivo:** proyecto andando con el stack del curso y convenciones claras.

- [x] Next.js 16 + React 19 + TypeScript
- [x] Tailwind CSS v4 + variables de marca en `globals.css`
- [x] shadcn/ui (`base-nova` sobre Base UI)
- [x] Rutas esqueleto: `/`, `/ofertas`, `/ofertas/[id]`, `/empresa`, `/admin`
- [x] Ejemplo Client Component + Route Handler (`/saludo`, `/api/saludo`) y hook `useOferta`
- [x] Documentación: `README.md`, `AGENTS.md`, `CLAUDE.md`, guía de Next.js

**Demo:** el proyecto levanta, navega entre páginas y consume una API propia.

---

## Fase 1 — Supabase y modelo de datos `[~]`

**Objetivo:** base de datos real, segura y versionada.

- [x] Clientes de Supabase (`src/lib/supabase/client.ts` y `server.ts`)
- [x] Dependencias instaladas
- [x] `.env.example` + `.gitignore` actualizados
- [x] Commit de la integración
- [ ] Validar con el equipo el esquema propuesto (ver abajo)
- [ ] Migración inicial: tablas + enums de estado
- [ ] Policies de RLS por rol en la misma migración
- [ ] Buckets de Storage privados: `cvs`, `comprobantes-domicilio`, `constancias-arca`
- [ ] Tipos generados en `src/types/database.ts`
- [ ] `src/lib/estados.ts` con enums y transiciones
- [ ] `supabase/seed.sql` con categorías y ofertas de demo

**Demo:** tablas creadas en Supabase con datos de ejemplo y RLS activo.

### Esquema propuesto (a validar antes de migrar)

| Tabla | Campos principales | Notas |
|-------|-------------------|-------|
| `perfiles` | `id` (= `auth.users.id`), `rol` | `rol`: `postulante` \| `empresa` \| `admin` |
| `postulantes` | `perfil_id`, `dni` (único), `nombre`, `apellido`, `localidad`, `direccion`, `telefono`, `descripcion`, `cv_url`, `comprobante_url`, `estado_domicilio` | CV armado en plataforma o PDF |
| `empresas` | `perfil_id`, `razon_social`, `cuit` (único), `nombre_comercial`, `telefono`, `direccion`, `constancia_arca_url`, `estado` | Arranca `pendiente` |
| `categorias` | `id`, `nombre` | Rubros |
| `postulante_categorias` | `postulante_id`, `categoria_id` | N:M (multi-categoría) |
| `ofertas` | `empresa_id`, `titulo`, `descripcion`, `categoria_id`, `requisitos`, `modalidad`, `estado`, `motivo_rechazo`, `fecha_publicacion` | Solo `publicada` es pública |
| `postulaciones` | `oferta_id`, `postulante_id`, `estado`, `notas_admin` | Único (`oferta_id`, `postulante_id`) |
| `seguimientos` | `postulacion_id`, `fecha`, `notas` | Contratados, cada 2 meses |
| `cursos` | `nombre`, `descripcion`, `enlace` | Capacitaciones |
| `derivaciones` | `postulante_id`, `curso_id`, `fecha` | Rechazados → cursos |

---

## Fase 2 — Portal público

**Objetivo:** cualquier vecino puede ver ofertas sin loguearse.

- [ ] `GET /api/ofertas` (solo `publicada`, filtro por categoría, paginado)
- [ ] `GET /api/ofertas/[id]` (404 si no existe o no está publicada)
- [ ] Extender la interfaz `Oferta` en `useOferta` con los campos reales
- [ ] Landing con presentación del portal y últimas ofertas
- [ ] Listado `/ofertas` con filtro por categoría
- [ ] Detalle `/ofertas/[id]` con botón "Postularme" (lleva a login si no hay sesión)
- [ ] Layout general: header, navegación, footer, responsive

**Demo:** portal público navegable desde el celular con ofertas reales de la base.

---

## Fase 3 — Autenticación y roles

**Objetivo:** cada rol entra a su área y no puede ver la de los demás.

- [ ] Registro de postulante (DNI, nombre, apellido, localidad, dirección, teléfono, email, contraseña)
- [ ] Registro de empresa (razón social, CUIT, nombre comercial, teléfono, dirección, constancia ARCA, email, contraseña)
- [ ] Login con DNI/CUIT o email + contraseña (resolución de email del lado del servidor)
- [ ] Recuperación de contraseña por código al email
- [ ] Protección de rutas por rol (`proxy.ts`, ver doc de Next 16)
- [ ] Creación manual de cuenta Admin documentada en el README
- [ ] Cerrar sesión

**Demo:** registrarse como postulante y como empresa, y comprobar que cada uno solo accede a su área.

---

## Fase 4 — Postulante

**Objetivo:** el postulante puede completar su perfil y postularse.

- [ ] Completar/editar perfil y datos personales
- [ ] CV armado en la plataforma **o** subida de PDF
- [ ] Selección de varias categorías
- [ ] Subida de comprobante de domicilio (estado `pendiente`)
- [ ] Postularse a una oferta (sin duplicados)
- [ ] "Mis postulaciones" con estado de cada una

**Demo:** un vecino arma su perfil desde el celular y se postula.

---

## Fase 5 — Empresa

**Objetivo:** la empresa publica ofertas y recibe candidatos preseleccionados.

- [ ] Aviso de cuenta pendiente de verificación (sin carga de ofertas)
- [ ] ABM de ofertas (quedan `pendiente` al crearse)
- [ ] Ver estado de mis ofertas (pendiente / publicada / rechazada + motivo)
- [ ] Ver candidatos **preseleccionados** y aceptar/rechazar
- [ ] Registrar contratación
- [ ] Editar datos de la empresa

**Demo:** una empresa carga una oferta y ve el flujo hasta la contratación.

---

## Fase 6 — Administrador (Oficina de Empleo)

**Objetivo:** la oficina controla todo el circuito.

- [ ] Aprobar/rechazar registro de empresas
- [ ] Verificar domicilio de postulantes (ver comprobante)
- [ ] Aprobar/rechazar ofertas (con motivo)
- [ ] Preselección de postulantes por oferta
- [ ] Buscador de postulantes por categoría, nombre o localidad (filtro "domicilio verificado")
- [ ] Dashboard de indicadores: postulantes, contratados, tasa de empleabilidad
- [ ] Seguimiento de contratados (recordatorio cada 2 meses)
- [ ] Derivar postulantes no seleccionados a cursos

**Demo:** circuito completo de punta a punta: empresa → admin → postulante → contratación.

---

## Fase 7 — Calidad y entrega

**Objetivo:** MVP prolijo y listo para presentar.

- [ ] Revisión responsive en celular, tablet y PC
- [ ] Accesibilidad básica y estados de carga/vacío/error en todas las pantallas
- [ ] Revisión de policies de RLS y de datos expuestos en rutas públicas
- [ ] Datos de demo realistas en el seed
- [ ] Tests de las reglas críticas (transiciones de estado, permisos) — a definir herramienta
- [ ] Deploy en Vercel con variables de entorno configuradas
- [ ] README final + guion de la demo

**Demo:** presentación final en producción.

---

## v2 (fuera del MVP)

- Notificaciones automáticas de cursos a postulantes no seleccionados
- Emails de aviso por cambio de estado
- Exportación de indicadores para provincia (Excel/PDF)
- Integración con padrón oficial para verificar domicilio
