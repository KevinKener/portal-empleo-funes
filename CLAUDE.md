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
| `/` | `src/app/(publico)/page.tsx` | Landing + latest offers; signed-in companies and Admins are sent to their panel (`inicioDe()` in `src/lib/auth.ts`, also the header shield's link; the Admin gets a "Ver portal" link by "Salir" from md) |
| `/ofertas` | `src/app/(publico)/ofertas/page.tsx` | Published offers, category filter, sort (`?orden=`), pagination (+ `loading`, `error`) |
| `/ofertas/[id]` | `src/app/(publico)/ofertas/[id]/page.tsx` | Published offer detail (+ `not-found`) |
| `/api/ofertas` | `src/app/api/ofertas/route.ts` | Public listing API (`?categoria`, `?pagina`, `?orden`) |
| `/api/ofertas/[id]` | `src/app/api/ofertas/[id]/route.ts` | Public detail API (404 unless `publicada`) |
| `/registro` | `src/app/(publico)/registro/page.tsx` | Sign-up: account type choice (+ shared `layout`, Server Actions in `actions.ts`) |
| `/registro/postulante`, `/registro/empresa` | `src/app/(publico)/registro/*/page.tsx` | Multi-step sign-up forms (`src/components/auth/`) |
| `/registro/verificar` | `src/app/(publico)/registro/verificar/page.tsx` | Email confirmation with a 6-digit code |
| `/ingresar` | `src/app/(publico)/ingresar/page.tsx` | Sign-in with DNI, CUIT or email (`?siguiente=`); `ingresar` / `salir` Server Actions in `actions.ts` |
| `/recuperar`, `/recuperar/codigo` | `src/app/(publico)/recuperar/` | Password recovery: identifier → emailed code + new password |
| `/terminos`, `/privacidad` | `src/app/(publico)/terminos/page.tsx`, `privacidad/page.tsx` | Terms of use and privacy policy (Ley 25.326) on `DocumentoLegal`; draft until the Municipality's legal area reviews them; they mirror AGENTS.md §2–3, keep them in sync |
| `/postulante` | `src/app/postulante/page.tsx` | "Mi panel": next step (with celebrations), applications summary, offers in your categories (+ `loading`, `error`); `layout.tsx` requires role `postulante` and adds `NavegacionPostulante`; Server Actions in `actions.ts` |
| `/postulante/perfil` | `src/app/postulante/perfil/page.tsx` | "Mi perfil": avatar and the "Completá tu perfil" task list linking to each section |
| `/postulante/datos` | `src/app/postulante/datos/page.tsx` | Edit personal data (DNI and email fixed) |
| `/postulante/rubros` | `src/app/postulante/rubros/page.tsx` | Category chips (Rule 5) |
| `/postulante/cv` | `src/app/postulante/cv/page.tsx` | CV: "Sobre vos", experience and education (add another) or PDF (Rule 6); `?volver=<offer id>` shows the way back to the offer once complete; actions in `cv/actions.ts` |
| `/postulante/domicilio` | `src/app/postulante/domicilio/page.tsx` | Proof of address, only for Funes residents (Rule 4) |
| `/postulante/postulaciones` | `src/app/postulante/postulaciones/page.tsx` | "Mis postulaciones": counts (`ContadoresPostulaciones`, shared with Mi panel), "En curso" (furthest stage first) and "Finalizadas"; each card has the tracker and "Ahora / Lo que sigue" (`DESPUES_POSTULACION` in `formato.ts`) |
| `/empresa` | `src/app/empresa/page.tsx` | Company home: pending-review notice, `ProximoPasoEmpresa` (main step with its number + "También tenés", from `pasosEmpresa()`), `ResumenEmpresa` (offers by stage linking to the filtered list, candidates funnel) and `BusquedasActivas` (rules in `src/lib/panel-empresa.ts`, + `loading`, `error`); `layout.tsx` requires role `empresa` and adds `NavegacionEmpresa` |
| `/empresa/datos` | `src/app/empresa/datos/page.tsx` | "Mi empresa": logo card, profile checklist (`PerfilEmpresa`, `tareasPerfilEmpresa()`), "Así te ven los postulantes" preview (`VistaPreviaEmpresa`), verification steps (`VerificacionEmpresa`), activity, company data (`FormularioEmpresa`, fixed data with a lock; CUIT and email fixed, `razon_social` only until verified, enforced by `validar_cambios_empresa`) and the optional ARCA certificate (`src/app/empresa/archivos.ts`); actions in `datos/actions.ts`; optional logo (`TarjetaLogo`, public bucket `logos-empresa`, `src/lib/logo-empresa.ts`) shown as `LogoEmpresa` on the company home, public offers and the job seeker's panel and applications (`empresasDeOfertas()`), initial when there is none |
| `/empresa/ofertas` | `src/app/empresa/ofertas/page.tsx` | "Mis ofertas": status chips with counts (`?estado=`, `FiltroOfertasEmpresa`), offers waiting for the company first; each card says what is happening and, once published, its candidates by stage (+ `loading`, `error`); Server Actions in `actions.ts` |
| `/empresa/ofertas/nueva`, `/empresa/ofertas/[id]`, `/empresa/ofertas/[id]/editar` | `src/app/empresa/ofertas/*/page.tsx` | New draft (verified companies only), offer page with status actions (`AccionesOferta`: send, take back, close, delete draft, "Usar como base" for rejected/closed), edit while `borrador` |
| `/empresa/ofertas/[id]/candidatos` | `src/app/empresa/ofertas/[id]/candidatos/page.tsx` | The offer at a glance with its funnel by stage, pre-selected candidates by stage (`candidatos_empresa` view, `src/lib/candidatos-empresa.ts`) with key facts (`src/lib/datos-candidato.ts`: experience, last job, education, matching category; never a score), draft decisions (`DecisionCandidato`, the card border follows them) applied with `confirmar_seleccion()` (`ResumenSeleccion`, side column from lg, sticky bar on phones), CV PDF via signed URL; actions in `actions.ts` |
| `/admin` | `src/app/admin/page.tsx` | "Bandeja": the Office's work queues (companies to verify, offers to review with urgent ones counted, applications to review by offer, proofs of address, offers with no applicants after 7 days) with the oldest item's age, amber past 3 days; queues with work first, empty ones folded into "Al día" (`src/lib/admin/bandeja.ts`, `ColaBandeja`, + `loading`, `error`); `layout.tsx` requires role `admin` and adds `NavegacionAdmin` (Bandeja · Empresas · Ofertas · Postulantes · Indicadores, with pending-count badges via `insignia` on `NavegacionArea`) |
| `/admin/ofertas` | `src/app/admin/ofertas/page.tsx` | Offers for the Office (drafts never show): search + status chips in the URL (`FiltrosLista`: `?estado=pendiente|publicada|sin-postulantes|rechazada|cerrada|todas`, `?q=`), table that becomes cards below lg (`TablaAdmin`); review queue urgent first then oldest, published ones with applications to review first (`src/lib/admin/ofertas.ts`, + `loading`) |
| `/admin/ofertas/[id]` | `src/app/admin/ofertas/[id]/page.tsx` | Review page: the offer exactly as job seekers see it (`CabeceraOferta` / `SeccionesOferta` in `src/components/ofertas/DetalleOferta.tsx`, shared with the public page), status, history (`LineaTiempo`), applications by stage, company data to call; `AccionesRevision`: publish, reject with a reason (frequent reasons as chips), close, toggle urgency; "Revisar la siguiente" after deciding; actions in `actions.ts` (+ `loading`, `not-found`) |
| `/admin/ofertas/[id]/postulantes` | `src/app/admin/ofertas/[id]/postulantes/page.tsx` | Pre-selection (branch D): applications of an offer, Funes residents first then other towns, each oldest first (Rule 4), status chips + search by name/DNI + "solo domicilio verificado" (`?estado=`, `?q=`, `?verificado=1`; `FiltrosLista` keeps extra params), `ListaPostulantes` (two `TablaAdmin` groups, checkboxes on pending rows, sticky bar with `AccionesPreseleccion`: pre-select or reject with `cupo_completo` / `no_seleccionado`, `SelectorMotivo`) via `usePreseleccion`; queries in `src/lib/admin/postulaciones.ts`, actions in `actions.ts` (+ `loading`) |
| `/admin/ofertas/[id]/postulantes/[postulacionId]` | `src/app/admin/ofertas/[id]/postulantes/[postulacionId]/page.tsx` | One applicant for the Office: the shared `FichaPostulante` (data, photo, phone, address badge `InsigniaDomicilio`, categories, CV with `CvCandidato`, shared with the company cards) with "Ver perfil completo", other applications, decision (`AccionesPostulacion`), history (`LineaTiempo`, undated steps allowed), private notes (`NotasAdmin`, `notas_admin` via the `postulaciones_admin` view), "Revisar la siguiente" (+ `loading`, `not-found`) |
| `/admin/empresas` | `src/app/admin/empresas/page.tsx` | Companies for the Office: search by name, legal name or CUIT + chips (`?estado=pendiente|verificado|rechazado|todas`), verification queue oldest first (`src/lib/admin/empresas.ts`, + `loading`) |
| `/admin/empresas/[id]` | `src/app/admin/empresas/[id]/page.tsx` | A company: data with the CUIT check digit validated, ARCA certificate (`BotonConstancia`, signed URL 60 s), its offers, and `AccionesEmpresa` (verify, reject with a reason through the shared `FormularioRechazo`); a company that fixed its data after a rejection shows the old reason; actions in `actions.ts` (+ `loading`, `not-found`) |
| `/admin/postulantes` | `src/app/admin/postulantes/page.tsx` | Job seekers for the Office (branch D2): every registered person in a dense sortable table (`?orden=funes|nombre|recientes|postulaciones` from the column headers; Funes first by default) with photo (`urlsFotosPerfil()` signs a page of photos in one request), DNI, town + address pill, experience, education, categories, applications (total via `postulaciones(count)`, "en curso") and sign-up date; one segmented filter bar (`BarraFiltrosPostulantes`: `BuscadorLista` with `enBarra`, `FiltroSelect` for town with counts and category, "Domicilio verificado" checkbox), the table in `TablaPostulantes`; 30 per page with the range and `Paginacion` (takes an `href` builder) in the table's footer; `TarjetaPostulanteAdmin` cards below lg; `listarPostulantesAdmin()` in `src/lib/admin/postulantes.ts` (+ `loading`) |
| `/admin/postulantes/[id]` | `src/app/admin/postulantes/[id]/page.tsx` | A job seeker's profile: `FichaPostulante` (shared with the application page; CV file via `abrirCvPostulante` in `src/app/admin/postulantes/actions.ts`) and `PostulacionesPostulante`, each application linking to where the Office decides (`obtenerPerfilPostulante()`, + `loading`, `not-found`) |
| `/admin/indicadores` | `src/app/admin/indicadores/page.tsx` | Placeholder (`SeccionEnCamino`) until branch G builds it (`docs/research/admin.md` §5) |

Other key files:

- `src/lib/supabase/client.ts` → Supabase client for the **browser** (Client Components).
- `src/lib/supabase/server.ts` → Supabase client for the **server** (Server Components, Route Handlers).
- `src/types/database.ts` → generated DB types (`npx supabase gen types typescript --linked --schema public`). Never edit by hand; both Supabase clients are typed with it.
- `src/lib/estados.ts` → statuses and transitions (`puedeCambiarEstado`, `siguientesEstados`). Mirrors the status triggers in `supabase/migrations/`; change both together.
- `src/app/(publico)/layout.tsx` → public shell (`Encabezado`, `PiePagina` in `src/components/layout/`).
- `src/lib/ofertas.ts` → public offers queries over the `ofertas_publicas` view, shared by the API and Server Components. `src/lib/categorias.ts`, `src/lib/formato.ts` (labels, dates) and `src/lib/validaciones/ofertas.ts` sit next to it.
- `src/hooks/useOferta.ts` → consumes `/api/ofertas/[id]` from Client Components.
- `src/proxy.ts` → refreshes the Supabase session on every request (`src/lib/supabase/proxy.ts`) and sends visitors without one away from `/postulante`, `/empresa`, `/admin`. Role checks live in each area's layout via `requerirRol()` (`src/lib/auth.ts`, with `obtenerSesion()` and `AREA_POR_ROL`).
- `src/lib/email-pendiente.ts` → httpOnly cookie with the email waiting for a code (`registro` / `recuperar` flows).
- `src/lib/perfil-postulante.ts` → profile summary, task list and `puedePostularse()` (minimum: a CV in either format; categories are recommended, never required, tutor review 2026-10-20).
- `src/lib/panel-postulante.ts` → "Mi panel" rules and queries (`proximoPaso()`, `obtenerOfertasParaVos()`, `empresasDeOfertas()`). `src/components/postulante/panel/VistosPanel.tsx` remembers the previous visit in `localStorage` for celebrations and "Novedad" badges (`docs/research/panel-postulante.md`).
- `src/lib/ofertas-empresa.ts` → the signed-in company (`obtenerEmpresaActual()`) and its own offers; `validarOferta()` in `src/lib/validaciones/ofertas.ts`. `src/components/layout/NavegacionArea.tsx` is the shared area navigation, used by `NavegacionPostulante` (Mi panel · Buscar · Postulaciones · Mi perfil) and `NavegacionEmpresa` (Mi panel · Mis ofertas · Mi empresa · Ver portal) in two variants: tabs inside the site header from md and a bottom bar below that (`MarcoArea` renders both, so there is a single bar; the public layout also shows the signed-in person's bottom bar on phones, with "Buscar" / "Ver portal" lit, and the active tab has a pill behind its icon). Sub-pages go back with `EnlaceVolver` (pill above the title; `PaginaArea`'s `volver` uses it). Area pages use `PaginaArea` (left-aligned title, optional `aside` column from lg, `NotaLateral` cards) and area homes `BandaBienvenida` (`src/components/layout/`). `FondoMarca` is the moving brand background (landing hero and `MarcoAuth`, still under reduced motion); motion tokens (`animate-deriva`, `animate-luz`, `animate-entrada`) and the offer title morph (`<ViewTransition>`, `.morph`) live in `globals.css`. `CarruselOfertas` is the landing's snap carousel: glides one card every 3.5 s and holds still on hover/focus/touch, off screen and with reduced motion. Landing pieces live in `src/components/portada/` (`RubrosFlotantes`, `PasosAnimados`). `Revelar` fades sections in on first scroll (visible without JS). `FondoMarca` also leans towards the pointer on desktop and is used by `BandaBienvenida`.
- `src/lib/cierre-oferta.ts` → offer closing date (`ofertas.fecha_cierre`, a plain day in Funes time; `CIERRE` defaults: 30 days, 60 max, "Cierra pronto" from 3 days): `hoyArgentina()`, `diasParaCierre()`, `textoCierre()`, `formatearDia()` (date-only values, formatted in UTC so they do not shift a day) and `ofertaVencida()` (derived, never a status; the database mirrors it with `hoy_argentina()` in `ofertas_publicas` and `oferta_esta_publicada()`). The company picks it in `CampoCierre`; only the Office extends it (`extenderOferta`).
- `src/lib/insignias-oferta.ts` → badges of a published offer (`insigniasOferta()`: "Urgente" from `ofertas.prioridad`, "Cierra pronto" from the closing date, "Muy solicitada" / "Pocos postulantes" from the view's `nivel_demanda` bucket, never the count, and "Nueva"), drawn by `InsigniasOferta` on cards, the offer page and "Ofertas para vos". `/ofertas` sorts with `?orden=recientes|urgentes|solicitadas` (`OrdenOfertas`, URLs built by `hrefOfertas()`); the company picks the priority with `CampoPrioridad`.
- `src/lib/postulaciones.ts` → the job seeker's applications (only readable columns) and `yaSePostulo()`. Applying is `postularme()` in `src/app/postulante/actions.ts`, called from `AccionPostular` on the offer detail.
- `src/lib/archivos.ts` → upload limits, Storage paths (`<uid>/cv.<pdf|doc|docx|jpg|png>`, `<uid>/comprobante.<ext>`, `<uid>/foto.jpg`), phone photo shrinking and the profile photo preparation (shrunk to 1024 px, not cropped). The person frames the photo with `EncuadreFoto` (drag, arrows, zoom); `src/lib/encuadre.ts` holds the framing type and style, saved in `postulantes.foto_x` / `foto_y` / `foto_zoom` by `guardarEncuadre()` and honoured by `Avatar`. Files go browser → Storage directly (Vercel caps bodies at 4.5 MB); `src/app/postulante/archivos.ts` and `src/app/empresa/archivos.ts` (ARCA certificate, `<uid>/arca.pdf`) record, open (signed URL, 60 s) or remove them through the shared `SubidaArchivo` field (`src/components/formularios/`), which receives them as `acciones`; `src/lib/foto-perfil.ts` signs the profile photo for display (1 h; owner and Admin only, never companies).
- Share previews: `src/app/opengraph-image.tsx` (site) and `src/app/(publico)/ofertas/[id]/opengraph-image.tsx` (each offer: title, company logo or initial, category, hours) built with `TarjetaCompartir` (`src/components/og/`, portal fonts as TTF in `og/fuentes/`); `metadataBase` in the root layout points to production.
- `src/lib/oficina.ts` → the Employment Office's public contact (phone, email, address, hours; no WhatsApp line), used by `AyudaOficina` (help card in Mi panel and the CV), the footer and the privacy policy. The email opens `ContactoEmail`, a small menu (Gmail on the web on computers, the mail app, copy; phones get no Gmail web option, `pointer-coarse`), because a bare `mailto:` does nothing on computers with no mail app set up.
- `PantallaEstado` (`src/components/layout/`) is the shared look of not-found and error screens (`src/app/not-found.tsx`, offer not found, every `error.tsx`). Loading skeletons use the `esqueleto` utility (shimmer, `globals.css`); `contador` counts a number up from 0 (`--hasta`) and `tramo-en-curso` / `tramo-en-curso-y` animate the current stretch of a tracker. `AvisoFormulario` shows errors inline and confirmations as a floating toast.
- `TablaAdmin` (`src/components/admin/`) is the Office's data table: real `<table>` from lg (header sticks under the site header, sortable columns as links with `aria-sort`, `numerica` columns right-aligned with tabular digits, optional `pie` for counts and pagination), cards below lg.
- `src/components/formularios/` → shared form fields (`Campo` with `requerido` for the red asterisk, `CampoTexto`, `CampoContrasena`, `CampoLocalidad`, `Selector` — the select to use instead of a native `<select>` —, `AvisoFormulario`, `SubidaArchivo`).
- `src/lib/ingreso.ts` → resolves DNI/CUIT → email on the server for sign-in (never exposed).
- `src/lib/supabase/admin.ts` → secret-key client (`server-only`, bypasses RLS). Only for lookups anonymous flows need (`src/lib/registro.ts`) and, later, creating Admins.
- `src/lib/validaciones/auth.ts` → sign-up validation shared by the browser (inline feedback) and the Server Actions. `src/hooks/useFormularioPorPasos.ts` drives the multi-step forms.
- `supabase/templates/` → Spanish auth email templates, pasted manually in the Supabase dashboard.
- `public/marca/` → municipal brand assets: `escudo-blanco.png` (higher-resolution white shield, from the repo the tutor shared) drawn by `Escudo` as a CSS mask in any token color, `escudo.png` and the white logo from funes.gob.ar; `src/app/icon.png` is the favicon.
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
| `primary` / `primary-foreground` | Brand green (funes.gob.ar): main actions, links, focus |
| `primary-hover`, `primary-deep` | Primary hover state / dark brand panels |
| `secondary` (+ `-foreground`) | Soft green surfaces (notices, badges) |
| `muted` / `muted-foreground` | Subtle surfaces / secondary text |
| `accent` (+ `-foreground`) | Hover/selected surfaces in menus and lists |
| `destructive` | Errors and invalid fields |
| `aviso` / `aviso-suave` | Time-sensitive, not an error: urgent offers, overdue Admin queues (always with icon + words) |
| `border`, `input`, `ring` | Borders, input borders, focus ring |
| `font-sans`, `font-heading` | Body font (Be Vietnam Pro) / headings font (Sora), loaded with `next/font` in the root layout |

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
