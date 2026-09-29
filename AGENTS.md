<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas para agentes — Portal Municipal de Empleo

> Este archivo aplica a **cualquier agente de IA** que trabaje en el repo (Claude Code, Codex, Cursor, Copilot…).
> Lo específico de Claude Code está en `CLAUDE.md`. El plan de trabajo está en `docs/ROADMAP.md`.
> Si algo de este archivo choca con un pedido puntual, **preguntá antes de romper la regla**.

---

## 1. Contexto en 30 segundos

Portal web para la **Oficina de Empleo de la Municipalidad de Funes** (Santa Fe, Argentina), desarrollado en el marco del programa **Funes Tech Lab**. Reemplaza el proceso manual actual (CVs en papel o por mail, cargados a mano en Excel) por un sistema digital.

Tres roles:

| Rol | Qué hace |
|-----|----------|
| **Postulante** | Se registra, arma su perfil/CV, verifica domicilio en Funes, se postula a ofertas y sigue el estado. |
| **Empresa** | Se registra (queda pendiente de aprobación), carga ofertas, recibe candidatos **ya preseleccionados** y registra contrataciones. |
| **Admin** (Oficina de Empleo) | Intermediario obligado: aprueba empresas, ofertas y domicilios; preselecciona postulantes; mide indicadores; hace seguimiento; deriva a cursos. |

MVP de ~3 meses. Deploy en Vercel. Tiene que ser **responsive** (celular, tablet, PC): muchos postulantes van a usarlo desde el celular.

---

## 2. Reglas de negocio (no negociables)

Estas reglas salen del relevamiento con la Oficina de Empleo. Todo el código tiene que respetarlas, **y se validan en el servidor / base de datos, nunca solo en el frontend**.

1. **El Admin está siempre en el medio.** Postulante y Empresa nunca se comunican de forma directa dentro del sistema. La empresa no ve postulantes que el Admin no haya preseleccionado.
2. **Nada se publica sin aprobación.** Una oferta solo es visible en el portal público si su estado es `publicada`.
3. **Empresas nuevas quedan `pendiente`** hasta que el Admin las verifique. Una empresa pendiente puede loguearse, pero **no puede cargar ofertas**.
4. **Domicilio de postulantes:** el postulante sube un comprobante; el Admin lo revisa a mano y marca `verificado`. No hay integración con padrones oficiales (fuera de alcance del MVP). Un domicilio no verificado **no bloquea** postularse, pero el Admin puede filtrar y priorizar por verificados.
5. **Multi-categoría:** un postulante puede elegir varias categorías/rubros. Nunca modelar "una sola categoría por postulante".
6. **CV flexible:** el postulante puede armar el CV en la plataforma **o** subir un PDF (pensado para quien no maneja tanto lo digital). Ambos caminos son válidos.
7. **No hay registro público de Admin.** Las cuentas de Admin se crean a mano desde Supabase.
8. Un postulante **no puede postularse dos veces** a la misma oferta.

### Máquinas de estado

Las transiciones se validan en **un único lugar** (`src/lib/estados.ts`) y se reutilizan en la API. No hardcodear strings de estado sueltos por el código.

**Empresa / Domicilio del postulante**
```
pendiente ──(admin)──► verificado
pendiente ──(admin)──► rechazado
```

**Oferta**
```
pendiente ──(admin)──► publicada ──(empresa o admin)──► cerrada
pendiente ──(admin)──► rechazada   (con motivo)
```

**Postulación**
```
pendiente ──(admin)──────► preseleccionado ──(empresa acepta)──► entrevista ──(empresa)──► contratado
    │                            │                                   │
    └──(admin)──► rechazado ◄────┴──(empresa rechaza)────────────────┘
```
- Un postulante `rechazado` puede ser **derivado a cursos** por el Admin.
- Un `contratado` entra al **seguimiento cada 2 meses**.

---

## 3. Seguridad y datos personales

Se manejan datos sensibles de vecinos (DNI, dirección, teléfono, comprobantes de domicilio, CUIT). Tratar todo con cuidado:

- **Nunca** commitear `.env`, `.env.local` ni credenciales. Solo `.env.example` (sin valores) va al repo.
- Solo pueden tener prefijo `NEXT_PUBLIC_` la URL de Supabase y la **publishable key**. Cualquier clave secreta (`SUPABASE_SECRET_KEY` / service role) vive **solo en el servidor**, en archivos que importen `"server-only"`, y nunca se usa para saltear reglas de negocio por comodidad.
- **RLS (Row Level Security) activado en todas las tablas.** La autorización real está en las policies de Postgres; los chequeos en la UI son solo de experiencia de usuario.
- Buckets de Storage (CVs, comprobantes, constancias ARCA) son **privados**. Se accede con URLs firmadas de corta duración.
- Las rutas públicas (landing, listado de ofertas) **nunca** devuelven datos personales: ni DNI, ni dirección, ni email/teléfono de postulantes, ni CUIT.
- Login con DNI o CUIT: se resuelve el email **del lado del servidor**. No exponer ningún endpoint que devuelva "el email de este DNI".
- No loguear datos personales en `console.log` ni en mensajes de error que lleguen al cliente.
- Validar **todo** input que entra por la API (tipos, largo, formato de DNI/CUIT) antes de tocar la base.

---

## 4. Convenciones de código

### General
- **TypeScript estricto.** Prohibido `any`; si no sabés el tipo, usá `unknown` y validalo.
- **Server Components por defecto.** `"use client"` solo cuando haga falta estado, efectos o eventos.
- Funciones y componentes **chicos y con una sola responsabilidad**. Si un archivo pasa ~200 líneas, probablemente haya que partirlo.
- Sin código muerto, sin `console.log` olvidados, sin TODOs sin contexto (`// TODO(fase-4): ...` está bien).
- No duplicar lógica: si algo se repite dos veces, va a `src/lib/` o a un hook.

### Idioma y nombres
- **Dominio en español:** `oferta`, `postulante`, `empresa`, `postulacion`, `categoria`, `estado`.
- **Convenciones técnicas en inglés** donde es estándar: `use*` para hooks, `page.tsx`, `route.ts`, `GET/POST`, `props`.
- Componentes: `PascalCase` (`TarjetaOferta.tsx`). Hooks: `useOfertas.ts`. Utilidades: `kebab-case.ts` o `camelCase.ts`, pero consistente dentro de la carpeta.
- Tablas y columnas de la base: `snake_case` en español (`ofertas`, `fecha_publicacion`).
- Sin tildes ni ñ en identificadores (`postulacion`, `anio`). En textos de UI, sí.

### Comentarios
- **Siempre en español.**
- Explican **por qué**, no qué. `// El admin preselecciona antes para no perder el nexo con la empresa` ✅ — `// incrementa i` ❌.
- Toda función exportada de `src/lib/` y todo Route Handler lleva un comentario JSDoc corto: qué hace, quién puede llamarlo, qué devuelve.
- Reglas de negocio no obvias → comentario citando la regla (ej: `// Regla 2: solo ofertas publicadas`).

### Estilos y UI
- Tailwind v4 + variables de marca de `globals.css` (`--teal`, `--ink`, `--paper`, `--muted`, `--line`). No inventar colores nuevos sin necesidad.
- Componentes base con shadcn (`npx shadcn add <componente>`), estilo `base-nova` sobre **Base UI** (no Radix).
- Mobile-first: diseñar para celular y escalar.
- Accesibilidad mínima: labels en todos los inputs, textos alternativos, contraste suficiente, navegable con teclado.
- Todo lo que carga datos tiene estado de **carga**, **vacío** y **error**.

---

## 5. Estructura de carpetas

```
src/
├── app/                    # Rutas (App Router)
│   ├── (publico)/          # Landing, ofertas públicas, login, registro
│   ├── postulante/         # Área privada del postulante
│   ├── empresa/            # Área privada de la empresa
│   ├── admin/              # Área privada del admin
│   └── api/                # Route Handlers
├── components/
│   ├── ui/                 # Generados por shadcn (se pueden tocar, con criterio)
│   └── <dominio>/          # Componentes propios agrupados por dominio (ofertas/, postulantes/…)
├── hooks/                  # Custom hooks de cliente
├── lib/
│   ├── supabase/           # client.ts (browser) y server.ts (servidor)
│   ├── validaciones/       # Esquemas de validación de inputs
│   ├── estados.ts          # Enums y transiciones de estado (fuente única)
│   └── utils.ts            # cn() y utilidades generales
└── types/
    └── database.ts         # Tipos generados desde Supabase (no editar a mano)

supabase/
├── migrations/             # Cambios de esquema versionados (SQL)
└── seed.sql                # Datos de prueba / demo
docs/                       # Roadmap, guía de Next.js, diagramas
```

> La estructura se va creando a medida que avanzan las fases. No crear carpetas vacías "por las dudas".

---

## 6. Base de datos (Supabase / PostgreSQL)

- **Todo cambio de esquema es una migración** en `supabase/migrations/`. Si se toca algo desde el dashboard de Supabase, se refleja en una migración ese mismo día.
- Cada tabla nueva: `id uuid` como PK, `created_at` y `updated_at`, RLS activado y sus policies **en la misma migración**.
- Los estados son **enums de Postgres**, alineados con `src/lib/estados.ts`.
- Después de migrar, regenerar tipos en `src/types/database.ts`.
- Nunca borrar datos de producción en una migración sin confirmación explícita.

---

## 7. API (Route Handlers)

- Rutas en plural y en español: `/api/ofertas`, `/api/ofertas/[id]`, `/api/postulaciones`.
- Lecturas: preferir hacerlas directo en Server Components con el cliente de servidor. La API se usa para lo que consume el cliente y para las mutaciones.
- Orden dentro de cada handler: **1) autenticación → 2) autorización (rol) → 3) validación del input → 4) lógica → 5) respuesta**.
- Respuestas:
  - Éxito: el recurso directo (`Response.json(oferta)`), con `201` al crear y `204` al borrar.
  - Error: siempre `{ error: string }` con el código correcto (`400`, `401`, `403`, `404`, `409`, `500`). Mensajes en español, sin detalles internos.
- En Next.js 16, `params` es una **Promise**: `const { id } = await params`.

---

## 8. Git

- `main` siempre funciona. Nadie trabaja directo sobre `main`.
- Una rama por tarea: `feature/<tarea>`, `fix/<bug>`, `docs/<tema>`, `chore/<tema>`.
- Commits chicos, en español, con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`.
- Integración por Pull Request, revisado por el compañero.

---

## 9. Qué NO hacer sin preguntar antes

- Instalar, actualizar o sacar dependencias.
- Crear o modificar migraciones / esquema de la base / policies de RLS.
- Hacer `commit`, `push`, `merge` o reescribir historia de Git.
- Tocar archivos de configuración (`next.config.*`, `tsconfig.json`, `components.json`, `eslint.config.*`).
- Cambiar una regla de negocio de la sección 2.
- Inventar nombres de tablas, columnas o decisiones de negocio que no estén documentadas: **si falta el dato, se pregunta**.

---

## 10. Definición de "terminado"

Una tarea está terminada cuando:

- [ ] `npm run lint` y `npm run build` pasan sin errores.
- [ ] Funciona en celular y en escritorio.
- [ ] Tiene estados de carga, vacío y error donde corresponde.
- [ ] Respeta las reglas de negocio y de seguridad de este archivo.
- [ ] Comentarios en español donde aportan.
- [ ] Si cambió rutas, variables de entorno o setup → se actualizó el `README.md`.
- [ ] Se tildó la tarea en `docs/ROADMAP.md`.
