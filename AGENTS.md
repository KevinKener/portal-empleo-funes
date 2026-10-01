<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Rules — Municipal Job Portal

> This file applies to **any AI agent** working in this repo (Claude Code, Codex, Cursor, Copilot…).
> Claude Code specifics live in `CLAUDE.md`. The work plan lives in `docs/ROADMAP.md`.
> If anything in this file conflicts with a specific request, **ask before breaking the rule**.

---

## 0. User Communication

The user communicates in Spanish.

All explanations, implementation plans, progress updates, questions, summaries, and final reports must be written in Rioplatense Spanish.

Do not translate source code, technical identifiers, file paths, commands, library names, API names, or established software terminology unless necessary for clarity.

### Language by artifact

| Artifact | Language |
|----------|----------|
| Chat with the user (explanations, plans, questions, reports) | Rioplatense Spanish |
| Agent instructions (`AGENTS.md`, `CLAUDE.md`) | English |
| Technical plans written to files (`docs/ROADMAP.md`, `docs/research/*`) | English |
| Code comments and JSDoc | English |
| Text visible in the application (UI, error messages returned to the client, emails) | Spanish (Argentina) |
| Domain identifiers (tables, columns, variables, routes) | Spanish, see §4 |
| Team-facing docs (`README.md`, `docs/guia-nextjs.md`) and commit messages | Spanish |

---

## 1. Context in 30 seconds

Web portal for the **Employment Office of the Municipality of Funes** (Santa Fe, Argentina), built as part of the **Funes Tech Lab** program. It replaces the current manual process (CVs on paper or by email, typed into Excel by hand) with a digital system.

Three roles:

| Role | What it does |
|------|--------------|
| **Postulante** (job seeker) | Signs up, builds a profile/CV, verifies residence in Funes, applies to job offers and tracks their status. |
| **Empresa** (company) | Signs up (stays pending approval), posts job offers, receives **pre-selected** candidates and records hires. |
| **Admin** (Employment Office) | Mandatory intermediary: approves companies, offers and addresses; pre-selects candidates; tracks metrics; follows up on hires; refers people to training courses; creates other Admin accounts. |

~3-month MVP. Deployed on Vercel. Must be **responsive** (phone, tablet, desktop): many job seekers will use it from their phones.

---

## 2. Business rules (non-negotiable)

These rules come from the requirements gathering with the Employment Office. All code must honor them, **and they are enforced on the server / database, never only in the frontend**.

1. **The Admin is always in the middle.** Postulante and Empresa never communicate directly inside the system. A company never sees candidates the Admin has not pre-selected.
2. **Nothing is published without approval.** An offer is visible on the public portal only if its status is `publicada`.
3. **New companies start as `pendiente`** until the Admin verifies them. A pending company can log in, but **cannot post offers**.
4. **Job seeker address:** the job seeker uploads a proof of address; the Admin reviews it manually and marks it `verificado`. There is no integration with official registries (out of MVP scope). An unverified address **does not block** applying, but the Admin can filter and prioritize verified ones.
5. **Multi-category:** a job seeker can pick several categories/fields. Never model "one category per job seeker".
6. **Flexible CV:** the job seeker can build the CV on the platform **or** upload a PDF (meant for people less comfortable with digital tools). Both paths are valid.
7. **No public Admin sign-up.** The first (seed) Admin account is created manually in Supabase. After that, **any Admin can create other Admin accounts** from the admin area (flat model: all Admins are equal). **No Admin can delete Admin accounts from the app**; deactivating one is done manually in Supabase.
8. A job seeker **cannot apply twice** to the same offer.

### State machines

Transitions are validated in **a single place** (`src/lib/estados.ts`) and reused by the API. Do not hardcode loose status strings across the code.

**Empresa / Postulante address**
```
pendiente ──(admin)──► verificado
pendiente ──(admin)──► rechazado
```

**Oferta**
```
pendiente ──(admin)──► publicada ──(empresa or admin)──► cerrada
pendiente ──(admin)──► rechazada   (with reason)
```

**Postulacion**
```
pendiente ──(admin)──────► preseleccionado ──(empresa accepts)──► entrevista ──(empresa)──► contratado
    │                            │                                    │
    └──(admin)──► rechazado ◄────┴──(empresa rejects)─────────────────┘
```
- A `rechazado` job seeker can be **referred to courses** by the Admin.
- A `contratado` job seeker enters **follow-up every 2 months**.

---

## 3. Security and personal data

The system handles sensitive data of residents (DNI, address, phone, proof of address, CUIT). Treat all of it carefully:

- **Never** commit `.env`, `.env.local` or credentials. Only `.env.example` (without values) goes into the repo.
- Only the Supabase URL and the **publishable key** may use the `NEXT_PUBLIC_` prefix. Any secret (`SUPABASE_SECRET_KEY` / service role, SMTP credentials) lives **only on the server**, in files that import `"server-only"`, and is never used to bypass business rules for convenience. Creating Admin accounts (rule 7) is a legitimate use of the secret key, always after verifying the caller is an Admin.
- **RLS (Row Level Security) enabled on every table.** Real authorization lives in Postgres policies; UI checks are only for user experience.
- Storage buckets (CVs, proofs of address, ARCA certificates) are **private**. Access goes through short-lived signed URLs.
- Public routes (landing, offer listing) **never** return personal data: no DNI, address, job seeker email/phone, or CUIT.
- Login with DNI or CUIT: the email is resolved **on the server**. Never expose an endpoint that returns "the email for this DNI".
- Do not log personal data with `console.log` nor include it in error messages that reach the client.
- Validate **every** input entering through the API (types, length, DNI/CUIT format) before touching the database.

---

## 4. Code conventions

### General
- **Strict TypeScript.** `any` is forbidden; if you do not know the type, use `unknown` and validate it.
- **Server Components by default.** `"use client"` only when state, effects or events are needed.
- **Small functions and components with a single responsibility.** If a file goes past ~200 lines, it probably needs splitting.
- No dead code, no forgotten `console.log`, no TODOs without context (`// TODO(phase-4): ...` is fine).
- Do not duplicate logic: if something repeats twice, move it to `src/lib/` or a hook.

### Language and naming
- **Domain in Spanish:** `oferta`, `postulante`, `empresa`, `postulacion`, `categoria`, `estado`. Do not translate domain identifiers to English.
- **Technical conventions in English** where standard: `use*` for hooks, `page.tsx`, `route.ts`, `GET/POST`, `props`.
- Components: `PascalCase` (`TarjetaOferta.tsx`). Hooks: `useOfertas.ts`. Utilities: `kebab-case.ts` or `camelCase.ts`, but consistent within the folder.
- Database tables and columns: `snake_case` in Spanish (`ofertas`, `fecha_publicacion`).
- No accents or `ñ` in identifiers (`postulacion`, `anio`). In UI text, yes.

### Comments
- **Always in English** (see §0). UI strings stay in Spanish.
- Explain **why**, not what. `// Admin pre-selects first so the office keeps the link with the company` ✅ — `// increment i` ❌.
- Every exported function in `src/lib/` and every Route Handler gets a short JSDoc: what it does, who may call it, what it returns.
- Non-obvious business rules → comment citing the rule (e.g. `// Rule 2: only published offers`).

### Styles and UI
- Tailwind v4. Design tokens live in `src/app/globals.css` inside `@theme` and are consumed as Tailwind utilities (`bg-primary`, `text-muted-foreground`, `border-border`…). Token table in `CLAUDE.md`.
- Use **semantic tokens**. Do not use raw hex values or Tailwind palette colors (`bg-gray-50`, `text-green-700`) in new code. If a new color is really needed, add it as a token in `@theme`.
- Base components via shadcn (`npx shadcn add <component>`), `base-nova` style on **Base UI** (not Radix). shadcn components consume the same semantic tokens.
- Mobile-first: design for phones and scale up.
- Minimum accessibility: labels on every input, alt text, sufficient contrast, keyboard navigable.
- Everything that loads data has **loading**, **empty** and **error** states.

---

## 5. Folder structure

```
src/
├── app/                    # Routes (App Router)
│   ├── (publico)/          # Landing, public offers, login, sign-up
│   ├── postulante/         # Job seeker private area
│   ├── empresa/            # Company private area
│   ├── admin/              # Admin private area
│   └── api/                # Route Handlers
├── components/
│   ├── ui/                 # Generated by shadcn (may be edited, with care)
│   └── <dominio>/          # Own components grouped by domain (ofertas/, postulantes/…)
├── hooks/                  # Client custom hooks
├── lib/
│   ├── supabase/           # client.ts (browser) and server.ts (server)
│   ├── validaciones/       # Input validation schemas
│   ├── estados.ts          # Status enums and transitions (single source of truth)
│   └── utils.ts            # cn() and general utilities
└── types/
    └── database.ts         # Types generated from Supabase (do not edit by hand)

supabase/
├── migrations/             # Versioned schema changes (SQL)
└── seed.sql                # Test / demo data
docs/                       # Roadmap, Next.js guide, research, diagrams
```

> The structure is created as phases progress. Do not create empty folders "just in case".

---

## 6. Database (Supabase / PostgreSQL)

- **Every schema change is a migration** in `supabase/migrations/`. If something is changed from the Supabase dashboard, it is reflected in a migration the same day.
- Every new table: `id uuid` as PK, `created_at` and `updated_at`, RLS enabled and its policies **in the same migration**.
- Statuses are **Postgres enums**, aligned with `src/lib/estados.ts`.
- After migrating, regenerate types in `src/types/database.ts`.
- Never delete production data in a migration without explicit confirmation.

---

## 7. API (Route Handlers)

- Plural routes in Spanish: `/api/ofertas`, `/api/ofertas/[id]`, `/api/postulaciones`.
- Reads: prefer doing them directly in Server Components with the server client. The API is for what the client consumes and for mutations.
- Order inside every handler: **1) authentication → 2) authorization (role) → 3) input validation → 4) logic → 5) response**.
- Responses:
  - Success: the resource itself (`Response.json(oferta)`), with `201` on create and `204` on delete.
  - Error: always `{ error: string }` with the correct status code (`400`, `401`, `403`, `404`, `409`, `500`). Messages in Spanish (they reach the user), without internal details.
- In Next.js 16, `params` is a **Promise**: `const { id } = await params`.

---

## 8. Git

- `main` always works. Nobody works directly on `main`.
- One branch per task: `feature/<task>`, `fix/<bug>`, `docs/<topic>`, `chore/<topic>`.
- Small commits, in Spanish, with [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`.
- Integration via Pull Request, reviewed by the teammate.

---

## 9. Do NOT do without asking first

- Install, update or remove dependencies.
- Create or modify migrations / database schema / RLS policies.
- `commit`, `push`, `merge` or rewrite Git history.
- Touch configuration files (`next.config.*`, `tsconfig.json`, `components.json`, `eslint.config.*`).
- Change a business rule from section 2.
- Invent table names, columns or business decisions that are not documented: **if data is missing, ask**.

---

## 10. Definition of "done"

A task is done when:

- [ ] `npm run lint` and `npm run build` pass without errors.
- [ ] It works on phone and desktop.
- [ ] It has loading, empty and error states where relevant.
- [ ] It honors the business and security rules in this file.
- [ ] Comments in English where they add value.
- [ ] If routes, environment variables or setup changed → `README.md` was updated.
- [ ] The task was checked off in `docs/ROADMAP.md`.
