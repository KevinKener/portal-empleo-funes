# Roadmap — Municipal Job Portal

MVP work plan (~3 months) split into phases. Each phase ends in something **demoable**, so concrete progress can be shown at every review.

Legend: `[x]` done · `[ ]` pending · `[~]` in progress

---

## Current status

- **Current phase:** Phase 2 — Public portal.
- **Latest progress:** Phase 2 public portal on `feature/api-ofertas`: `GET /api/ofertas` and `/api/ofertas/[id]`, landing, `/ofertas` listing with category filter and pagination, offer detail, public layout with the municipal identity from funes.gob.ar. Before that, flow corrections from the tutor review (2026-10-08) on `feature/correcciones-flujo`: offers start as `borrador` (company edits only drafts, sends and takes back), rejected applications carry `motivo_rechazo`, company selection draft (`decision_empresa` + `confirmar_seleccion()`), ARCA certificate optional. Migrations applied in Supabase, types regenerated, `estados.ts` and `AGENTS.md` §2 updated.
- **Next step:** deploy the public portal to Vercel for the demo, then Phase 3 (authentication).

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
| `seguimientos` | `postulacion_id`, `fecha`, `notas` | Hired people, every 2 months |
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
- [~] `/ofertas/[id]` detail with "Postularme" button (shown disabled with a "coming soon" note; wire it to login in Phase 3)
- [x] General layout: header, navigation, footer, responsive
- [ ] Deploy to Vercel (preview) for the demo
- [ ] Ask the municipality for vector (SVG) versions of the logos (current PNGs are low resolution)

**Demo:** public portal navigable from a phone with real offers from the database.

---

## Phase 3 — Authentication and roles

**Goal:** each role enters its own area and cannot see the others.

- [ ] Create the demo Gmail account for the Employment Office (2FA + App Password)
- [ ] Custom SMTP (Gmail) in Supabase Auth + auth email templates in Spanish (required: the default provider only emails project team members)
- [ ] Job seeker sign-up (DNI, first name, last name, city, address, phone, email, password)
- [ ] Company sign-up (legal name, CUIT, trade name, phone, address, optional ARCA certificate, email, password)
- [ ] Login with DNI/CUIT or email + password (email resolved on the server)
- [ ] Password recovery via code sent by email
- [ ] Route protection per role (`proxy.ts`, see Next 16 docs)
- [ ] Manual creation of the seed Admin account documented in the README
- [ ] Log out

**Demo:** sign up as a job seeker and as a company, and check each one only reaches its own area.

---

## Phase 4 — Job seeker

**Goal:** the job seeker can complete their profile and apply.

- [ ] Complete/edit profile and personal data
- [ ] CV built on the platform **or** PDF upload
- [ ] Select several categories
- [ ] Upload proof of address (status `pendiente`)
- [ ] Apply to an offer (no duplicates)
- [ ] "Mis postulaciones" with the status of each one

**Demo:** a resident builds their profile from a phone and applies.

---

## Phase 5 — Company

**Goal:** the company posts offers and receives pre-selected candidates.

- [ ] Pending-verification notice (no offer posting)
- [ ] Offer CRUD (created as `borrador`, editable only as draft)
- [ ] Send an offer for review and take it back while `pendiente`
- [ ] See the status of my offers (draft / pending / published / rejected + reason)
- [ ] See **pre-selected** candidates, draft tomar/descartar and confirm in bulk (`confirmar_seleccion`)
- [ ] Record a hire
- [ ] Edit company data

**Demo:** a company posts an offer and sees the flow through to the hire.

---

## Phase 6 — Administrator (Employment Office)

**Goal:** the office controls the whole flow.

- [ ] Approve/reject company sign-ups
- [ ] Verify job seeker addresses (view proof)
- [ ] Approve/reject offers (with reason)
- [ ] Pre-select job seekers per offer
- [ ] Job seeker search by category, name or city ("verified address" filter)
- [ ] Metrics dashboard: job seekers, hires, employability rate, rejections by reason and referrals to courses
- [ ] Follow-up of hires (reminder every 2 months)
- [ ] Refer non-selected job seekers to courses
- [ ] Create other Admin accounts (flat model, rule 7; server-only, uses the secret key after checking the caller is Admin)
- [ ] Status-change email notifications via Gmail SMTP ([research](research/email-notifications.md))

**Demo:** full end-to-end flow: company → admin → job seeker → hire.

---

## Phase 7 — Quality and delivery

**Goal:** polished MVP ready to present.

- [ ] Responsive review on phone, tablet and desktop
- [ ] Basic accessibility and loading/empty/error states on every screen
- [ ] Review of RLS policies and data exposed on public routes
- [ ] Realistic demo data in the seed
- [ ] Tests for critical rules (status transitions, permissions) — tool to be defined
- [ ] Deploy to Vercel with environment variables configured
- [ ] Final README + demo script

**Demo:** final presentation in production.

---

## v2 (outside the MVP)

- Automatic course notifications to non-selected job seekers
- Metrics export for the province (Excel/PDF)
- Integration with the official registry to verify addresses
- Map with OpenStreetMap (e.g. Leaflet) for addresses/offers in Funes (tutor suggestion)
- Super-admin role (create **and delete** Admins), if the flat model falls short
