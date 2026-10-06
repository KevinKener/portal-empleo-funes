# CLAUDE.md

Guide for Claude Code when working in this repository.
General rules (business, security, conventions, user communication) live in `AGENTS.md` and the plan in `docs/ROADMAP.md`; both are loaded here:

@AGENTS.md
@docs/ROADMAP.md

---

## User Communication

The user communicates in Spanish.

All explanations, implementation plans, progress updates, questions, summaries, and final reports must be written in Rioplatense Spanish.

Do not translate source code, technical identifiers, file paths, commands, library names, API names, or established software terminology unless necessary for clarity.

Files follow the language table in `AGENTS.md` §0 (instructions, technical plans and code comments in English; UI text in Spanish).

---

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build — run it before calling anything done
npm run lint     # ESLint (eslint-config-next)
```

There is no test runner yet (see Phase 7 in the roadmap).

---

## Current architecture

**Municipal Job Portal** — Next.js 16 (App Router) + React 19 + TypeScript. UI in Spanish.
All code lives in `src/`. The `@/*` alias points to `src/*`.

| Route | File | Status |
|-------|------|--------|
| `/` | `src/app/page.tsx` | Home (skeleton) |
| `/ofertas` | `src/app/ofertas/page.tsx` | Listing (skeleton) |
| `/ofertas/[id]` | `src/app/ofertas/[id]/page.tsx` | Dynamic detail (skeleton) |
| `/empresa` | `src/app/empresa/page.tsx` | Company dashboard (skeleton) |
| `/admin` | `src/app/admin/page.tsx` | Admin dashboard (skeleton) |
| `/saludo` | `src/app/saludo/page.tsx` | Client Component + fetch example |
| `/api/saludo` | `src/app/api/saludo/route.ts` | Example endpoint |

Other key files:

- `src/lib/supabase/client.ts` → Supabase client for the **browser** (Client Components).
- `src/lib/supabase/server.ts` → Supabase client for the **server** (Server Components, Route Handlers).
- `src/types/database.ts` → generated DB types (`npx supabase gen types typescript --linked --schema public`). Never edit by hand; both Supabase clients are typed with it.
- `src/lib/estados.ts` → statuses and transitions (`puedeCambiarEstado`, `siguientesEstados`). Mirrors the status triggers in `supabase/migrations/`; change both together.
- `src/hooks/useOferta.ts` → consumes `/api/ofertas/[id]` (the route does **not exist yet**, see Phase 2).
- `src/app/globals.css` → Tailwind v4 (`@import "tailwindcss"`, no `tailwind.config.*`) + design tokens in `@theme`.
- `src/app/empresa/empresa.styles.css` → route-specific styles.
- `components.json` → shadcn config (`base-nova` on **Base UI**, `@base-ui/react`, not Radix).
- `cn()` is re-exported from `@/lib/utils`.

> Keep this table up to date when routes are added.

### Design tokens (`globals.css` → `@theme`)

Each token generates Tailwind utilities (`bg-*`, `text-*`, `border-*`…) and a CSS variable (`var(--color-*)`).

| Token | Use |
|-------|-----|
| `background` / `foreground` | Page background (paper) / main text (ink) |
| `card`, `popover` (+ `-foreground`) | Raised surfaces |
| `primary` / `primary-foreground` | Brand teal: main actions, links, focus |
| `primary-hover`, `primary-deep` | Primary hover state / dark brand panels |
| `secondary` (+ `-foreground`) | Soft teal surfaces (notices, badges) |
| `muted` / `muted-foreground` | Subtle surfaces / secondary text |
| `accent` (+ `-foreground`) | Hover/selected surfaces in menus and lists |
| `destructive` | Errors and invalid fields |
| `border`, `input`, `ring` | Borders, input borders, focus ring |
| `font-sans`, `font-serif` | Body font / headings font |

---

## Next.js 16 — what differs from what you "know"

- **`params` is a Promise** in dynamic routes (pages and Route Handlers): always `await params`.
- **Layouts** use `LayoutProps<"/route">` imported from `next`, not a hand-written `{ children: ReactNode }`.
- The old `middleware.ts` is now **`proxy.ts`** in Next 16 — confirm it in the local docs before building route protection (Phase 3).
- `after()` from `next/server` runs work after the response is sent (useful for non-blocking side effects such as notification emails).
- When in doubt, **read `node_modules/next/dist/docs/`** before writing code. If a pattern from the internet does not work, this is probably why.

---

## Supabase in this project

- Variables (in `.env.local`, never committed):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY` → **only if needed** (e.g. creating Admin accounts, rule 7), server only, with `import "server-only"`.
- In Server Components and Route Handlers always use the client from `server.ts` (it handles session cookies). In the browser, the one from `client.ts`.
- Database types are imported from `@/types/database` (generated). Do not type rows by hand.
- **Do not assume table or column names.** If they are not in a migration under `supabase/migrations/` or in the roadmap's proposed schema, ask.

---

## Workflow for every session

1. **Get oriented:** read the "Current status" section of the roadmap and confirm which task we are on.
2. **Plan before touching:** if the task affects more than 2 files, the database or authentication, first propose a short plan (files to create/modify and why) and **wait for the OK**. The plan is presented to the user in Spanish; if it is saved to a file, the file is in English.
3. **Small, focused changes:** do only what the task asks. If something worth improving shows up out of scope, list it at the end as a suggestion, do not do it.
4. **Verify:** run `npm run lint` and `npm run build` before saying it is ready.
5. **Close the task:**
   - check off the item in `docs/ROADMAP.md` and update "Current status";
   - if routes, variables or setup changed → update `README.md` and the table above;
   - **propose** the commit message (Conventional Commits, in Spanish). Do not commit or push unless the user asks.
6. **If information is missing** (business decision, table name, credential): stop and ask. Do not invent.

---

## Response style

- Speak in **Rioplatense Spanish**, direct and structured (see User Communication).
- Explain decisions in 1–2 lines; details go in code comments.
- When finishing, summarize: what was done, which files were touched, how to test it and what comes next.
