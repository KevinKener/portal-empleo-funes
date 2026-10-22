# Roadmap — Municipal Job Portal

MVP work plan (~3 months) split into phases. Each phase ends in something **demoable**, so concrete progress can be shown at every review.

Legend: `[x]` done · `[ ]` pending · `[~]` in progress

---

## Current status

- **Current phase:** Phase 6 (Admin). Branches J (PR #35), A (Bandeja, PRs #36–#37), B (offers review, PR #38), C (companies, PR #39), the offer closing date (PR #40) and the landing by role (PR #41) merged; branches D1 (pre-selection per offer, PR #42) and D2 (job seeker search and section bands, PR #43) merged 2026-10-22. Phase 5 and the tutor review of 2026-10-20 are done (PRs #23–#34).
- **Latest progress:** 2026-10-22, `fix/inicio-por-rol`: signed-in companies and Admins opening the landing go to their panel (job seekers stay on it); the Admin gets "Ver portal" in the header. Before that, 2026-10-20, offer CRUD for companies on `feature/crud-ofertas` (no migrations): list, new draft, edit while `borrador`, send to review / take back / close / delete draft, "Usar como base" for rejected and closed offers, company area navigation. Test company: the seed's "Empresa Demo" (CUIT 30000000007, `verificado`), password set by hand in the SQL Editor. Before that, "Mi panel" redesign and profile photo merged (PRs #16, #17) and phone fixes (#18). Earlier: public portal live on Vercel (https://portal-empleo-funes.vercel.app). Phase 2 merged in PR #7: `GET /api/ofertas` and `/api/ofertas/[id]`, landing, `/ofertas` listing with category filter and pagination, offer detail, public layout with the municipal identity from funes.gob.ar. Before that, flow corrections from the tutor review (2026-10-08) on `feature/correcciones-flujo`: offers start as `borrador` (company edits only drafts, sends and takes back), rejected applications carry `motivo_rechazo`, company selection draft (`decision_empresa` + `confirmar_seleccion()`), ARCA certificate optional. Migrations applied in Supabase, types regenerated, `estados.ts` and `AGENTS.md` §2 updated.
- **Next step:** merge `fix/ver-portal` ("Ver portal" shows the landing to companies and the Office, decision 2026-10-22), then branch I `feature/notificaciones` (status emails; waiting for the OK to install `nodemailer` and on how to read recipients' emails). Order: J → A → B → C → D → I → E → F → G → H (`docs/research/admin.md` §7). Further ideas, ranked: [`docs/research/mejoras.md`](research/mejoras.md). The tutor's corrections arrive once everything is done.

> Update this section at the end of every work session.

---

## Tutor review — 2026-10-01

- [x] `AGENTS.md` / `CLAUDE.md` in English + explicit "User Communication" section (chat in Spanish)
- [x] Technical plans written to files and code comments in English; Spanish reserved for app-visible text
- [x] Migrate `:root` variables to semantic tokens in `@theme` (shadcn-compatible)
- [x] Admin accounts: flat model chosen (any Admin creates Admins, nobody deletes from the app) — business rule 7
- [x] Research: status email notifications in v1 → [`docs/research/email-notifications.md`](research/email-notifications.md)
- [x] Email provider decided: **Gmail SMTP**
- [x] Status email notifications approved for v1, sent from a demo Gmail account of the Employment Office
- [ ] Approve installing `nodemailer` when the email task starts

---

## Tutor review — 2026-10-20 (functional analysis, job seeker profile)

Everything built works; UX details to fix:

- [x] Categories do not block applying (only the CV does)
- [x] Do not lose the offer: upload the CV from the offer itself, or build it and come back (`?volver`)
- [x] CV dates: "Desde" cannot be after "Hasta" (checked while picking; "Hasta" cleared when "Trabajo ahí actualmente" is ticked)
- [x] Required fields marked with a red asterisk (`*`) in every form (`requerido` on `Campo`, `aria-required`)
- [x] Replace native `<select>` (sign-up step 3, CV dates) with a reusable component (`Selector` on shadcn/Base UI `select`)
- [x] Accept more CV formats: images, `.doc`, `.docx` (migration `20261020140000_formatos_cv.sql`)
- [x] No double confirmations: one notice is enough (`fix/confirmaciones`: postularme, offer actions, confirm selection and CV items run on the first tap; what they mean is said next to the button beforehand)
- [x] Use the available width better; single navigation (tabs) instead of header + area bar (`max-w-7xl`, `PaginaArea` with side column, area tabs inside the header from md)
- [x] Visual polish (beyond the review): moving brand background on the landing and account screens, latest-offers carousel, offer title morph into its page, status stripes on cards, two-column account screens; fixed the unreadable hover of `secondary` buttons (undefined CSS variable); richer footer with draft terms of use and privacy policy (`/terminos`, `/privacidad`), animated application tracker and profile task list
- [x] Profile photo: move the image inside the frame, position saved in the database (`feature/encuadre-foto`, migration `20261020150000_encuadre_foto.sql`)
- [x] Better-quality municipal logo (EliasGallay/Solicitudes-Farmacia `src/assets/brand`): `escudo-blanco.png` via `Escudo`, also the watermark of the area homes' greeting band

---

## Tutor review — 2026-10-08 (application flow deck)

- [x] Offers start as `borrador`; company edits only drafts and can take a pending offer back (company only)
- [x] Pending offers cannot be edited by the company
- [x] Rejection reason on applications: `cupo_completo` (soft) / `no_seleccionado`
- [x] Company selection draft (`tomar` / `descartar`) confirmed in bulk
- [x] ARCA certificate optional, tied to the company profile
- [x] OpenStreetMap suggested → moved to v2

---

## Phase 0 — Project base ✅

**Goal:** project running with the course stack and clear conventions.

- [x] Next.js 16 + React 19 + TypeScript
- [x] Tailwind CSS v4 + design tokens in `globals.css`
- [x] shadcn/ui (`base-nova` on Base UI)
- [x] Skeleton routes: `/`, `/ofertas`, `/ofertas/[id]`, `/empresa`, `/admin`
- [x] Client Component + Route Handler example (`/saludo`, `/api/saludo`) and `useOferta` hook
- [x] Documentation: `README.md`, `AGENTS.md`, `CLAUDE.md`, Next.js guide

**Demo:** the project starts, navigates between pages and consumes its own API.

---

## Phase 1 — Supabase and data model ✅

**Goal:** real, secure and versioned database.

- [x] Supabase clients (`src/lib/supabase/client.ts` and `server.ts`)
- [x] Dependencies installed
- [x] `.env.example` + `.gitignore` updated
- [x] Integration committed
- [x] Validate the proposed schema with the team (see below)
- [x] Initial migration: tables + status enums
- [x] RLS policies per role in the same migration
- [x] Private Storage buckets: `cvs`, `comprobantes-domicilio`, `constancias-arca`
- [x] Generated types in `src/types/database.ts`
- [x] `src/lib/estados.ts` with enums and transitions
- [x] `supabase/seed.sql` with demo categories and offers

**Demo:** tables created in Supabase with sample data and RLS active.

### Proposed schema (to validate before migrating)

| Table | Main fields | Notes |
|-------|-------------|-------|
| `perfiles` | `id` (= `auth.users.id`), `rol` | `rol`: `postulante` \| `empresa` \| `admin`. Flat Admin model: no extra role needed |
| `postulantes` | `perfil_id`, `dni` (unique), `nombre`, `apellido`, `localidad`, `direccion`, `telefono`, `descripcion`, `cv_url`, `comprobante_url`, `estado_domicilio` | CV built on the platform or PDF |
| `empresas` | `perfil_id`, `razon_social`, `cuit` (unique), `nombre_comercial`, `telefono`, `direccion`, `constancia_arca_url`, `estado` | Starts `pendiente` |
| `categorias` | `id`, `nombre` | Fields/industries |
| `postulante_categorias` | `postulante_id`, `categoria_id` | N:M (multi-category) |
| `ofertas` | `empresa_id`, `titulo`, `descripcion`, `categoria_id`, `requisitos`, `jornada`, `estado`, `motivo_rechazo`, `fecha_publicacion` | Only `publicada` is public |
| `postulaciones` | `oferta_id`, `postulante_id`, `estado`, `notas_admin`, `fecha_preseleccion`, `motivo_rechazo`, `decision_empresa` | Unique (`oferta_id`, `postulante_id`). `notas_admin` hidden from non-admins; companies only see rows with `fecha_preseleccion` set |
| `seguimientos` | `postulacion_id`, `fecha`, `notas` | Hired people; unused since the follow-up was dropped (2026-10-21) |
| `cursos` | `nombre`, `descripcion`, `enlace` | Training courses |
| `derivaciones` | `postulante_id`, `curso_id`, `fecha` | Rejected → courses |

---

## Phase 2 — Public portal

**Goal:** any resident can see offers without logging in.

- [x] `GET /api/ofertas` (only `publicada`, category filter, paginated)
- [x] `GET /api/ofertas/[id]` (404 if missing or not published)
- [x] Extend the `Oferta` interface in `useOferta` with the real fields
- [x] Municipal visual identity from funes.gob.ar (palette, Sora / Be Vietnam Pro, shield and logo; approved by the Employment Office)
- [x] Landing with portal presentation and latest offers
- [x] `/ofertas` listing with category filter
- [x] `/ofertas/[id]` detail with "Postularme" button (visitors → sign in and back; applying itself is Phase 4)
- [x] General layout: header, navigation, footer, responsive
- [x] Deploy to Vercel: https://portal-empleo-funes.vercel.app (auto-deploys `main`, preview URL per PR)
- [ ] Ask the municipality for vector (SVG) versions of the logos (current PNGs are low resolution)

**Demo:** public portal navigable from a phone with real offers from the database.

---

## Phase 3 — Authentication and roles

**Goal:** each role enters its own area and cannot see the others.

- [x] Create the demo Gmail account for the Employment Office (2FA + App Password): `empleofunes.demo@gmail.com`
- [x] Custom SMTP (Gmail) in Supabase Auth + Site URL / redirect URLs (test invite delivered, landed in spam)
- [x] Auth email templates in Spanish: `confirmar-cuenta.html` (Confirm sign up) and `recuperar-contrasena.html` (Reset password)
- [x] Job seeker sign-up (DNI, first name, last name, city, address, phone, email, password) — 3 steps + email code
- [x] Company sign-up (legal name, CUIT, trade name, phone, address, email, password) — ARCA certificate moved to the company profile (Phase 5)
- [x] Login with DNI/CUIT or email + password (email resolved on the server)
- [x] Password recovery via code sent by email (`/recuperar`)
- [x] Route protection per role (`src/proxy.ts` for the session + `requerirRol()` in each area layout)
- [x] Manual creation of the seed Admin account documented in the README
- [x] Log out

**Demo:** sign up as a job seeker and as a company, and check each one only reaches its own area.

---

## Phase 4 — Job seeker

**Goal:** the job seeker can complete their profile and apply.

- [x] Complete/edit profile and personal data (`/postulante` task list, `/postulante/datos`)
- [x] CV built on the platform **or** PDF upload (`/postulante/cv`)
- [x] Select several categories (`/postulante/rubros`)
- [x] Upload proof of address (status `pendiente`), only for Funes residents (`/postulante/domicilio`)
- [x] Apply to an offer (no duplicates; minimum profile = one category + a CV)
- [x] "Mis postulaciones" with the status of each one (`/postulante/postulaciones`)
- [x] "Mi panel" redesign ([research](research/panel-postulante.md)): next step with celebrations, applications summary with compact tracker, "Ofertas para vos", area navigation and "Mi perfil" hub (`/postulante/perfil`)
- [x] Optional profile photo (visible to the person and the Admin, never to companies): bucket `fotos-perfil`, `postulantes.foto_url` and policies (migration `20261013150000_foto_perfil.sql`)

**Demo:** a resident builds their profile from a phone and applies.

---

## Phase 5 — Company

**Goal:** the company posts offers and receives pre-selected candidates.

- [x] Pending-verification notice (no offer posting) — on `/empresa`
- [x] Offer CRUD (created as `borrador`, editable only as draft) — `/empresa/ofertas`, plus "Usar como base" to copy a rejected or closed offer into a new draft (decision 2026-10-20: never live offers, to avoid duplicates on the portal)
- [x] Send an offer for review and take it back while `pendiente`; close a published one
- [x] See the status of my offers (draft / pending / published / rejected + reason)
- [x] Company area navigation (now Mi panel · Mis ofertas · Mi empresa · Ver portal, renamed 2026-10-21), shared component with the job seeker's (`NavegacionArea`)
- [x] See **pre-selected** candidates, draft tomar/descartar and confirm in bulk (`confirmar_seleccion`) — `/empresa/ofertas/[id]/candidatos`; migration `20261020120000_candidatos_empresa.sql` lets companies read the CV built on the platform and shows phone/email only from `entrevista` on (decisions 2026-10-20)
- [x] Record a hire ("Contratar" on a candidate in `entrevista`, then confirm)
- [x] Company home with "Próximo paso" and an offers/candidates summary; candidate counts on each offer card ([improvement ideas](research/mejoras.md) #3)
- [x] Edit company data (includes uploading the optional ARCA certificate) — `/empresa/datos` ("Mi empresa" in the navigation); migration `20261020130000_datos_empresa.sql`: legal name fixed once verified (the Office changes it on request), ARCA path checked to be in the owner folder; pending companies get "subí tu constancia" as next step (decisions 2026-10-20)

**Demo:** a company posts an offer and sees the flow through to the hire.

---

## Phase 6 — Administrator (Employment Office)

Plan approved 2026-10-21: [`docs/research/admin.md`](research/admin.md) — design research (§4), work-queue home, branches J and A–I, decisions D1–D13 (all accepted; D8 dropped with the follow-up).

**Goal:** the office controls the whole flow.

- [x] Offer priority ("Urgente" / "Sin apuro", chosen by the company) and demand badges ("Muy solicitada", "Pocos postulantes", "Nueva"), listing sort, `aviso` token — `feature/ofertas-prioridad`, migration `20261021130000_prioridad_ofertas.sql` (branch J)
  - Same branch: "Mis postulaciones" (job seeker) and the company home / "Mis ofertas" redesigned (counters, trackers with "Ahora / Lo que sigue", status filters, candidates funnel, live searches) and the candidates page (offer funnel, key facts per candidate, "Tu selección" at the side) and "Mi empresa" (profile checklist, preview, verification steps, activity); copy-email fix; phone navigation (area bar also on public pages, active pill, `EnlaceVolver`), whole-card links above moving arrows, filter chips no longer clipped

- [x] Admin base: navigation with pending badges and the Bandeja home with the work queues — `feature/admin-base` (branch A, no migration)
- [x] Approve/reject company sign-ups, with a reason; a rejected company that fixes its data goes back to review (D1) — `/admin/empresas`, `feature/admin-empresas` (branch C)
- [x] Offer closing date (decision 2026-10-21): optional for the company (up to 60 days), 30 days by default, expired offers leave the portal and take no applications, only the Office extends them ("Vencidas" filter, "Cierra pronto" badge) — `feature/fecha-cierre-ofertas` (PR #40)
- [ ] Verify job seeker addresses (view proof)
- [x] Approve/reject offers (with reason), close them, take the urgency off — `/admin/ofertas`, `feature/admin-ofertas` (branch B, no migration)
- [x] Pre-select job seekers per offer — `/admin/ofertas/[id]/postulantes`, `feature/admin-preseleccion` (branch D1, no migration): Funes first, verified-address filter, bulk pre-select / reject with reason, candidate page with private notes
- [x] Job seeker search by category, name or city ("verified address" filter) — `/admin/postulantes`, `feature/admin-postulantes` (branch D2, no migration), with each person's profile and applications
- [ ] Metrics dashboard: job seekers, hires, employability rate, rejections by reason, supply vs. demand per category, review and fill times, online now; weekly report in PDF and Excel
- ~~Follow-up of hires (reminder every 2 months)~~ — dropped 2026-10-21: too many people for the Office to call (D9)
- [ ] Course materials section (`/cursos`, PDFs / videos / links), suggested automatically after 2 rejections and recommended by the Admin
- [ ] Create other Admin accounts (flat model, rule 7; server-only, uses the secret key after checking the caller is Admin)
- [ ] Status-change email notifications via Gmail SMTP ([research](research/email-notifications.md))

**Demo:** full end-to-end flow: company → admin → job seeker → hire.

---

## Phase 7 — Quality and delivery

**Goal:** polished MVP ready to present.

- [ ] Responsive review on phone, tablet and desktop
- [ ] Basic accessibility and loading/empty/error states on every screen
- [ ] Sign-up UX: warn that a DNI/CUIT is already registered on blur, not only on the final submit (Server Action returning only yes/no, with rate limiting so it cannot be used to enumerate registered documents)
- [ ] Review of RLS policies and data exposed on public routes
- [ ] Storage policies per role and bucket (job seekers only `cvs` / `comprobantes-domicilio`, companies only `constancias-arca`); a verified proof of address cannot be deleted through the Storage API either (security review 2026-10-13)
- [ ] Rate limiting for the DNI/CUIT lookups that use the secret key (sign-up and sign-in), and check how Supabase Auth rate limits apply when calls come from our server; `documentoOcupado()` should not delete an unconfirmed account that is still within its code window
- [x] Security headers (CSP, `frame-ancestors`, `nosniff`, `Referrer-Policy`) and Next.js 16.3.8 (security review 2026-10-13)
- [ ] Realistic demo data in the seed
- [ ] Tests for critical rules (status transitions, permissions) — tool to be defined
- [ ] Deploy to Vercel with environment variables configured
- [ ] Final README + demo script

**Demo:** final presentation in production.

---

## v2 (outside the MVP)

- Email notice when new course materials are suggested
- Metrics export for the province (Excel/PDF)
- Integration with the official registry to verify addresses
- Map with OpenStreetMap (e.g. Leaflet) for addresses/offers in Funes (tutor suggestion)
- Super-admin role (create **and delete** Admins), if the flat model falls short
