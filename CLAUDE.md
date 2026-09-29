# CLAUDE.md

Guía para Claude Code cuando trabaja en este repositorio.
Las reglas generales (negocio, seguridad, convenciones) están en `AGENTS.md` y el plan en `docs/ROADMAP.md`; ambos se cargan acá:

@AGENTS.md
@docs/ROADMAP.md

---

## Comandos

```bash
npm run dev      # servidor de desarrollo (http://localhost:3000)
npm run build    # build de producción — correrlo antes de dar algo por terminado
npm run lint     # ESLint (eslint-config-next)
```

No hay test runner configurado todavía (ver Fase 7 del roadmap).

---

## Arquitectura actual

**Portal Municipal de Empleo** — Next.js 16 (App Router) + React 19 + TypeScript, en español.
Todo el código vive en `src/`. El alias `@/*` apunta a `src/*`.

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/` | `src/app/page.tsx` | Home (esqueleto) |
| `/ofertas` | `src/app/ofertas/page.tsx` | Listado (esqueleto) |
| `/ofertas/[id]` | `src/app/ofertas/[id]/page.tsx` | Detalle dinámico (esqueleto) |
| `/empresa` | `src/app/empresa/page.tsx` | Dashboard empresa (esqueleto) |
| `/admin` | `src/app/admin/page.tsx` | Dashboard admin (esqueleto) |
| `/saludo` | `src/app/saludo/page.tsx` | Ejemplo de Client Component + fetch |
| `/api/saludo` | `src/app/api/saludo/route.ts` | Endpoint de ejemplo |

Otros archivos clave:

- `src/lib/supabase/client.ts` → cliente de Supabase para el **navegador** (Client Components).
- `src/lib/supabase/server.ts` → cliente de Supabase para el **servidor** (Server Components, Route Handlers).
- `src/hooks/useOferta.ts` → consume `/api/ofertas/[id]` (la ruta todavía **no existe**, ver Fase 2).
- `src/app/globals.css` → Tailwind v4 (`@import "tailwindcss"`, sin `tailwind.config.*`) + variables de marca en `:root`.
- `src/app/empresa/empresa.styles.css` → estilos específicos de esa ruta.
- `components.json` → config de shadcn (`base-nova` sobre **Base UI**, `@base-ui/react`, no Radix).
- `cn()` se reexporta desde `@/lib/utils`.

> Mantener esta tabla actualizada cuando se agreguen rutas.

---

## Next.js 16 — lo que cambia respecto a lo que "sabés"

- **`params` es una Promise** en rutas dinámicas (páginas y Route Handlers): siempre `await params`.
- **Layouts** usan `LayoutProps<"/ruta">` importado de `next`, no `{ children: ReactNode }` a mano.
- El antiguo `middleware.ts` pasó a llamarse **`proxy.ts`** en Next 16 — confirmarlo en la doc local antes de crear la protección de rutas (Fase 3).
- Ante cualquier duda, **leer `node_modules/next/dist/docs/`** antes de escribir código. Si un patrón de internet no funciona, es probablemente por esto.

---

## Supabase en este proyecto

- Variables (en `.env.local`, nunca commiteado):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY` → **solo si hace falta**, solo en servidor, con `import "server-only"`.
- En Server Components y Route Handlers usar siempre el cliente de `server.ts` (maneja las cookies de sesión). En el navegador, el de `client.ts`.
- Los tipos de la base se importan de `@/types/database` (generados). No tipar filas a mano.
- **No asumir nombres de tablas ni columnas.** Si no están en una migración de `supabase/migrations/` o en el esquema propuesto del roadmap, preguntar.

---

## Forma de trabajo en cada sesión

1. **Ubicarse:** leer la sección "Estado actual" del roadmap y confirmar en qué tarea estamos.
2. **Planificar antes de tocar:** si la tarea afecta más de 2 archivos, la base de datos o la autenticación, primero proponer un plan corto (archivos a crear/modificar y por qué) y **esperar el OK**.
3. **Cambios chicos y enfocados:** hacer solo lo que pide la tarea. Si aparece algo para mejorar fuera de alcance, anotarlo al final como sugerencia, no hacerlo.
4. **Verificar:** correr `npm run lint` y `npm run build` antes de decir que está listo.
5. **Cerrar la tarea:**
   - tildar el ítem en `docs/ROADMAP.md` y actualizar "Estado actual";
   - si cambiaron rutas, variables o setup → actualizar `README.md` y la tabla de arriba;
   - **proponer** el mensaje de commit (Conventional Commits, en español). No commitear ni pushear sin que el usuario lo pida.
6. **Si falta información** (decisión de negocio, nombre de tabla, credencial): frenar y preguntar. No inventar.

---

## Estilo de respuesta

- Hablar en **español rioplatense**, directo y estructurado.
- Explicar decisiones en 1–2 líneas; el detalle va en los comentarios del código.
- Al terminar, resumir: qué se hizo, qué archivos se tocaron, cómo probarlo y qué sigue.
