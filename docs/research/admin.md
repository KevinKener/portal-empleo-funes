# Phase 6 plan — Admin area (Employment Office)

> Date: 2026-10-20. Status: **proposal, pending approval** (decisions in §6).
> Inputs: `AGENTS.md` §2–3 (business and security rules), `docs/ROADMAP.md` Phase 6, the schema in `supabase/migrations/`, `docs/research/email-notifications.md`, `docs/research/mejoras.md`, `docs/research/postulante-ux.md` (Funes-first ordering) and the tutor reviews.

---

## 1. Why and what for

Today every Office decision (verify a company, publish an offer, verify an address, pre-select a candidate) is done by hand in the Supabase SQL Editor. Phase 6 gives the Office its own area, so the full flow can be demoed end to end: **company → Office → job seeker → hire**, and the Office can measure it.

The database is already prepared for most of it: `es_admin()` / `actua_como_admin()`, Admin RLS policies on every table, the status triggers, the `postulaciones_admin` view (with `notas_admin`), the `seguimientos`, `cursos` and `derivaciones` tables, the Storage policy "admin lee documentos" and the `crear_perfil_nuevo_usuario` trigger that turns `app_metadata.rol = 'admin'` into an Admin profile. Phase 6 is mostly UI, Server Actions and a few small migrations.

## 2. Principles

1. **Work queue first.** Back-office tools are organised around a shared pool of pending items, with counts that open the records behind them, oldest first; a number without a way to act on it creates curiosity, not control ([Conduction, werkvoorraad](https://procest.conduction.nl/docs/Features/werkvoorraad/); [Process Street, dashboards](https://www.process.st/form-dashboard/); [Pega, work queues](https://support.pega.com/node/440846)). The Admin home is a **Bandeja** ("inbox"), not a chart page.
2. **The Office decides, the system helps.** Simple filters and a clear order (Funes residents first, Rule 4), never automatic scores (`docs/research/mejoras.md`, "Not recommended now"). Public employment services start with filterable portals before any automated matching ([OECD, PES matching tools](https://search.oecd.org/els/emp/Agenda_job_matching_December7.pdf)).
3. **Every rejection explains itself.** Offers already carry `motivo_rechazo`; companies and proofs of address should too, so the other side knows what to fix.
4. **Rule 1 stays intact.** The Office sees everything; companies still see only pre-selected candidates; job seekers and companies never talk inside the system.
5. **Same design language** as the rest of the portal (`BandaBienvenida`, `PaginaArea`, cards, brand green only, soft motion), but **desktop-first**: Office staff work on PCs. Lists become tables from `lg`, cards on phones.
6. **One notice, no double confirmation** (tutor review 2026-10-20): actions run on the first click; what they do is said next to the button.

## 3. Information architecture

Navigation (same `NavegacionArea`, tabs in the header, bottom bar on phones):

| Tab | Route | Content |
|-----|-------|---------|
| Bandeja | `/admin` | Greeting band + work queues with counts, oldest first |
| Empresas | `/admin/empresas` | Companies by status, detail and verification |
| Ofertas | `/admin/ofertas` | Offers to review, published offers with their applicants |
| Postulantes | `/admin/postulantes` | Search by category, name, town, verified address; profile view |
| Indicadores | `/admin/indicadores` | Metrics |

Inside the tabs: `/admin/domicilios` (from the Bandeja), `/admin/ofertas/[id]/postulantes` (pre-selection), `/admin/seguimientos`, `/admin/cursos`, `/admin/cuentas` (Admins).

### Bandeja (home) queues
| Queue | Source | Action |
|-------|--------|--------|
| Empresas por verificar | `empresas.estado = 'pendiente'` | Verify / reject with reason |
| Ofertas por revisar | `ofertas.estado = 'pendiente'` | Publish / reject with reason |
| Postulaciones por revisar | `postulaciones.estado = 'pendiente'` of published offers, grouped by offer | Pre-select / reject |
| Domicilios por verificar | Funes residents with a proof and `estado_domicilio = 'pendiente'` | Verify / reject |
| Seguimientos vencidos | Hires with no follow-up in the last 2 months | Record a follow-up |

Each queue shows its count and the age of its oldest item ("la más vieja, hace 3 días").

## 4. Features, by branch (one PR each, from `main`, never stacked)

### A. `feature/admin-base` — no migration
- `NavegacionAdmin`, `/admin` Bandeja with the five queues (counts + oldest age + link), `src/lib/admin/*.ts` queries (server-only, Admin client via RLS, never the secret key).
- Loading / empty / error states for the area.

### B. `feature/admin-ofertas` — no migration
- `/admin/ofertas`: tabs Por revisar · Publicadas · Todas; each row with company, category, age.
- Offer review page: the offer **exactly as job seekers will see it** (reuses `TextoOferta` and the public layout), company data at the side, and two actions: **Publicar** or **Rechazar** with a required reason (`motivo_rechazo`, already enforced by the trigger). Published offers can be closed by the Admin (state machine allows it).
- The company already sees the reason and can "Usar como base".

### C. `feature/admin-empresas` — small migration
- `/admin/empresas`: Pendientes · Verificadas · Rechazadas; detail with every field, CUIT formatted and checked (`cuitValido`), ARCA certificate (signed URL), the company's offers.
- **Verificar** or **Rechazar** with a reason.
- Migration: `empresas.motivo_rechazo text` (required when `rechazado`, cleared when verified), and — **decision D1** — a rejected company that edits its data goes back to `pendiente` (same idea as the proof of address, Rule 4), so it can fix and be reviewed again. `AvisoEmpresaSinVerificar` shows the reason.

### D. `feature/admin-preseleccion` — no migration (maybe an index)
- `/admin/ofertas/[id]/postulantes`: every application of the offer, **Funes residents first, then other towns, each by application date** (Rule 4, decision 2026-10-13), address status as a badge, filter "solo domicilio verificado".
- Candidate panel: personal data, categories, CV built on the platform and the uploaded file (signed URL), photo (Admin may see it), previous applications, **private notes** (`notas_admin`, never shown to others).
- Actions per row and in bulk: **Preseleccionar** (stamps `fecha_preseleccion`, the company starts seeing the candidate) or **Rechazar** with `cupo_completo` / `no_seleccionado` (Rule 10).
- `/admin/postulantes`: search by name/DNI, category, town and verified address, using the same candidate panel. (The Admin cannot apply on behalf of a job seeker: the insert policy is the job seeker's own; out of scope.)

### E. `feature/admin-domicilios` — small migration
- Queue of pending proofs with an inline preview (images shown, PDF opened by signed URL), person's name, town and address side by side.
- **Verificar** or **Rechazar**; decision **D2**: add `postulantes.motivo_domicilio text` so the job seeker reads why ("no se lee la dirección") next to "Subí otro".

### F. `feature/admin-seguimiento-cursos` — small migration
- Hire date: `postulaciones.fecha_contratacion timestamptz`, stamped by the trigger on the move to `contratado` (decision **D3**; today only `updated_at` hints at it). Backfill existing hires from `updated_at`.
- `/admin/seguimientos`: hires due for follow-up (no record in the last 2 months, counted from the hire or the last follow-up); record date + notes (`seguimientos`).
- `/admin/cursos`: create / edit courses (name, description, link).
- **Derivar a un curso** from a rejected application or from the candidate panel (`derivaciones`); the job seeker sees "Cursos recomendados para vos" in Mi panel (policy "derivaciones: postulante ve las propias" already exists; needs a read policy on `cursos`, already public to authenticated).

### G. `feature/admin-indicadores` — no migration (maybe a view)
- Period filter (last 30 days / this year / everything).
- Figures: registered job seekers (Funes vs. other towns), verified companies, published offers, applications, pre-selections, interviews, hires, **employability rate**, rejections by reason, referrals to courses, follow-ups done.
- **Decision D4**: employability rate = job seekers hired ÷ job seekers with at least one application, in the period.
- Charts built with CSS/SVG (no chart dependency), following the `dataviz` skill; accessible tables behind every chart. Excel/PDF export stays in v2 (ROADMAP).

### H. `feature/admin-cuentas` — no migration
- `/admin/cuentas`: list of Admins (email, created at). **Crear Admin** (Rule 7): server-only action that checks the caller is Admin, then uses the secret key to `auth.admin.createUser({ email, email_confirm: true, app_metadata: { rol: "admin" } })` (the existing trigger creates the profile) and sends the password-recovery email so the new Admin sets their own password with the existing `/recuperar` flow. No delete from the app (Rule 7).

### I. `feature/notificaciones` — dependency + env vars
- `nodemailer` (decision **D5**, pending since 2026-10-01) with the Office's demo Gmail (`empleofunes.demo@gmail.com`, App Password) — env vars `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` on Vercel.
- `src/lib/email/` (transport, Spanish templates with the municipal look, `notificar()`), sent with `after()` so nobody waits and a failed email never undoes a change.
- Events (`email-notifications.md` §4.3): company verified/rejected; offer published/rejected; new pre-selected candidates; address verified/rejected; application pre-selected / interview / hired / rejected (soft wording for `cupo_completo`); referral to a course; optional daily summary to the Office.

## 5. Cross-cutting

- **Security:** every Server Action starts with `requerirRol("admin")`, validates input (`esUuid`, enums from `estados.ts`, length limits) and relies on RLS + triggers as the real authority. The secret key is used only in H. No personal data in logs.
- **State machines:** transitions already live in `src/lib/estados.ts` and the triggers; Admin actions only call them.
- **Optimistic UI** for queue actions (the row leaves the list right away, comes back on error), like the company's selection draft.
- **Demo data:** the seed needs a few pending companies, offers and applications (Funes and other towns) to show every queue (ROADMAP Phase 7 "realistic demo data"; can be done at the start of A).
- **Docs:** README / CLAUDE.md route tables and ROADMAP updated per branch.

## 6. Decisions needed

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | `empresas.motivo_rechazo` + a rejected company that edits its data goes back to `pendiente` | Yes: otherwise a rejected company has no way forward |
| D2 | `postulantes.motivo_domicilio` for rejected proofs | Yes: "Subí otro" without a reason is a guessing game |
| D3 | `postulaciones.fecha_contratacion` stamped by the trigger | Yes: follow-up every 2 months needs a reliable start date |
| D4 | Employability rate = hired ÷ job seekers with ≥1 application, per period | Yes, and show both numbers next to the rate |
| D5 | Install `nodemailer` and set the SMTP env vars on Vercel | Yes, in branch I |
| D6 | Order of branches | A → B → C → D (full demo flow) → I (emails) → E → F → G → H |

## 7. Estimate

| Branch | Effort |
|--------|--------|
| A base + Bandeja | 0.5–1 day |
| B ofertas | 1 day |
| C empresas (+ migration) | 1 day |
| D preselección + búsqueda | 1.5–2 days |
| E domicilios (+ migration) | 0.5 day |
| F seguimiento + cursos (+ migration) | 1–1.5 days |
| G indicadores | 1 day |
| H cuentas | 0.5 day |
| I notificaciones | 1–1.5 days |
| **Total** | **~8–10 days** |

## 8. Out of scope (v2 or later)

Admin applying on behalf of a job seeker; automatic matching or scores; Excel/PDF export; super-admin that deletes Admins; audit log of who decided what (could be added later as `revisado_por` / `revisado_en` columns if the Office asks).
