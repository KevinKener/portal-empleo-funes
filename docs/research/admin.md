# Phase 6 plan — Admin area (Employment Office)

> Date: 2026-10-20. Status: **proposal, pending approval** (decisions in §7; design research in §4, 2026-10-21).
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
5. **Same design language** as the rest of the portal (`BandaBienvenida`, `PaginaArea`, cards, brand green only, soft motion). Designed for the Office PC first, but **every screen works on a phone** (360 px, no horizontal scroll): tables from `lg`, cards below (see §4).
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

Inside the tabs: `/admin/domicilios` (from the Bandeja), `/admin/ofertas/[id]/postulantes` (pre-selection), `/admin/cursos` (materials), `/admin/cuentas` (Admins). Public: `/cursos`.

### Bandeja (home) queues
| Queue | Source | Action |
|-------|--------|--------|
| Empresas por verificar | `empresas.estado = 'pendiente'` | Verify / reject with reason |
| Ofertas por revisar | `ofertas.estado = 'pendiente'` | Publish / reject with reason |
| Postulaciones por revisar | `postulaciones.estado = 'pendiente'` of published offers, grouped by offer | Pre-select / reject |
| Domicilios por verificar | Funes residents with a proof and `estado_domicilio = 'pendiente'` | Verify / reject |
| Ofertas sin postulantes | Published offers with no application after 7 days | Call the company, adjust or share the offer |

Each queue shows its count and the age of its oldest item ("la más vieja, hace 3 días").

## 4. Design research: similar projects, professional back offices and dashboards

> Added 2026-10-21. Revised the same day after the team's feedback (§4.5): no 2-month follow-ups, richer metrics with a weekly report, live visitors counter, offer priority and demand badges, courses as a materials section.
> Goal: an Admin area that feels as polished as the public portal and the job seeker/company areas, works on a phone, and follows what proven back offices do.

### 4.1 What similar projects do

| Source | What we take |
|--------|--------------|
| National **Portal Público de Empleo**, with a back office for municipal Employment Offices whose job is *intermediation* ([gestionempleo.trabajo.gob.ar](https://gestionempleo.trabajo.gob.ar/); [Potenciar Trabajo, intermediación laboral](https://potenciartrabajo.org/intermediacion-laboral/)) | Same model as ours (Rule 1): the Office sits between both sides and also refers people to training (our `derivaciones`). |
| Municipal and provincial portals: [Tigre](https://empleos.tigre.gob.ar/), [Córdoba](https://desarrolloyempleo.cba.gov.ar/portal-de-empleo/), [Provincia de Buenos Aires](http://www.portalempleo.gba.gov.ar/), [Florencio Varela](https://empleo.florenciovarela.gov.ar/) | The team talks to the company to shape the profile before searching. Our offer review page should therefore show the company's contact data next to the offer, so the Office can call before publishing or rejecting. |
| ATS pipelines ([Kula](https://support.kula.ai/articles/9404876453-candidate-pipeline-view), [Pitchnhire](https://www.docs.pitchnhire.com/features/jobpipeline/), [Greenhouse application review](https://support.greenhouse.io/hc/en-us/articles/4401963991707-Application-review-stage), [myinterview](https://support.myinterview.com/en/articles/6813669-using-candidate-actions-to-manage-candidates)) | Two views of the same applicants: a **table** for scanning and bulk actions, and a **pipeline** by stage with the count in each column header and the time spent in the stage. Filters are shared between both views. |
| UK Ministry of Justice design system: [case list](https://design-patterns.service.justice.gov.uk/pages/case-list/), [notification badge](https://design-patterns.service.justice.gov.uk/components/notification-badge/), [timeline](https://design-patterns.service.justice.gov.uk/components/timeline/); [DWP timeline notes](https://design-system.dwp.gov.uk/components/timeline/design-notes) | Lists put the search first, then filters, then a sortable table, with dates in their own column. Navigation tabs carry a count badge for pending work. A record's history is a vertical timeline. |
| Split views ([Zendesk Agent Home split view](https://support.zendesk.com/hc/en-us/articles/10418462740634-Announcing-split-view-for-Agent-Home-Closed-EAP)) | The list stays on the left and the selected item opens on the right, so reviewing many items never loses the queue. |
| Bulk actions ([SaaSUI](https://www.saasui.design/blog/saas-bulk-actions-ux-patterns), [Eleken](https://www.eleken.co/blog-posts/bulk-actions-ux), [uxdesign.cc](https://uxdesign.cc/the-bulk-experience-7fcca8080f82), [SaaSUI destructive actions](https://www.saasui.design/blog/saas-destructive-actions-confirmation-ux-patterns)) | Use checkboxes plus a sticky bar showing the selected count. "Select all" must say whether it covers the page or the whole filter. Bulk irreversible actions name the count on the button itself. |

### 4.2 Dashboards: two kinds, two screens

NN/g separates **operational** dashboards (time-sensitive work you act on now) from **analytical** ones (context for decisions, no urgency), and both must be readable at a glance ([NN/g, dashboards and preattentive processing](https://www.nngroup.com/articles/dashboards-preattentive/); [Basedash](https://www.basedash.com/blog/operational-dashboards-vs-analytical-dashboards-how-to-design-each)). That maps to our two screens:

- **Bandeja** = operational: counts that are links, oldest item first, nothing decorative.
- **Indicadores** = analytical. The layout runs from KPI tiles to trend charts to detail tables, with progressive disclosure and drill-down, and color used only where it means something ([Edana](https://edana.ch/en/2025/11/25/designing-an-effective-dashboard-ux-best-practices-and-a-universal-architecture/), [Setproduct](https://setproduct.com/blog/dashboard-ui-design), [Datapad](https://datapad.io/docs/guides/dashboard-best-practices), [Fusioncharts](https://www.fusioncharts.com/blog/dashboard-design-best-practices/amp/), [AdminLTE 2026 examples](https://adminlte.io/blog/25-best-dashboard-design-examples-for-2026-real-products-principles/)). Every tile answers one question the Office or the Municipality asks; each opens the list behind its number. The design is tested with realistic data and with zeros.

Public employment services measure more than placements. Programs such as Wagner-Peyser count entered employment *and* retention ([South Carolina, performance measures](https://www.scworks.org/sites/scworks/files/content/policies-and-procedures/wagner-peyser-program-year-2012-negotiated-performance-measures-and-the-recording-of-placements-and-positive-referral-results-12-06-accessible.pdf)). Placement-only metrics hide whether people kept the job ([Florida OPPAGA](https://oppaga.fl.gov/Documents/Reports/98-23.pdf)), so other services also report placement rate and vacancies over time ([PESO Philippines](https://malaya.com.ph/news/national-news/pesos-netting-high-placement-rate-ble), [Hong Kong Labour Dept.](https://www.labour.gov.hk/eng/public/iprd/2023/figure_en/figure5_2.htm)). Retention would need someone to follow every hire up, which the Office cannot staff (§4.5), so we measure what the system records by itself: hires, time to fill an offer, and supply vs. demand per category.

### 4.3 Layouts (desktop and phone)

**Bandeja** (`/admin`):
```
DESKTOP (lg+)                                          PHONE (360–767)
┌──────────────────────────────────────────────────┐   ┌──────────────────────┐
│ [Escudo] Portal de Empleo  Bandeja(7) Empresas(2)│   │ [Escudo] Portal      │
│                            Ofertas(3) Postulan… │   ├──────────────────────┤
├──────────────────────────────────────────────────┤   │ ¡Hola, Ana!          │
│ BandaBienvenida: ¡Hola, Ana! Hoy tenés 7 cosas   │   │ 7 cosas para revisar │
│ para revisar · FondoMarca                        │   ├──────────────────────┤
├────────────────┬────────────────┬────────────────┤   │ ▸ Ofertas      3   › │
│ Ofertas      3 │ Empresas     2 │ Postulaciones 9│   │   la más vieja: 3 d  │
│ más vieja 3 d  │ más vieja 1 d  │ en 2 ofertas   │   │ ▸ Empresas     2   › │
│ [Revisar ›]    │ [Revisar ›]    │ [Revisar ›]    │   │ ▸ Postulaciones 9  › │
├────────────────┴───────┬────────┴────────────────┤   │ ▸ Domicilios   1   › │
│ Domicilios 1 · Sin pos.│ Al día: 4 colas vacías ✓ │   │ ▸ Sin postul.  0  ✓ │
│ vencidos 0             │ (estado vacío festejado) │   ├──────────────────────┤
└────────────────────────┴──────────────────────────┘   │ Bandeja Ofertas …    │ ← bottom bar
                                                        └──────────────────────┘
```
Queues with work come first; empty ones collapse into a single "al día" line. A queue counts as "vieja" after 3 days, shown with an icon and words, not only color.

**Lists** (`/admin/ofertas`, `/admin/empresas`, `/admin/postulantes`): search box, filter chips (in the URL, `searchParams`), then the table.
```
DESKTOP                                                 PHONE
┌ [Buscar…              ] [Por revisar 3][Publicadas][Todas] ┐   ┌ [Buscar…        ] ┐
├──┬────────────────┬───────────┬──────────┬────────┬──────┤   │ chips (scroll-x)  │
│☐ │ Oferta         │ Empresa   │ Rubro    │ Enviada│      │   ├───────────────────┤
├──┼────────────────┼───────────┼──────────┼────────┼──────┤   │ Repositor         │
│☐ │ Repositor      │ [L] Demo  │ Comercio │ hace 3d│ Ver ›│   │ [L] Demo·Comercio │
│☐ │ Cajera         │ [L] Súper │ Comercio │ hace 1d│ Ver ›│   │ Enviada hace 3 d  │
└──┴────────────────┴───────────┴──────────┴────────┴──────┘   │ [Revisar ›]       │
                                                              └───────────────────┘
```
The table keeps real `<table>` semantics; below `lg` each row renders as a card with the same fields, and lower-priority columns drop first. Dates get their own column, and the row action sits at the end ([Sizzy](https://sizzy.co/blog/responsive-tables), [Ramotion](https://www.ramotion.com/blog/mobile-tables-design/), [Simon Willison](https://tools.simonwillison.net/mobile-tables), [LogRocket](https://dev.to/logrocket/improving-responsive-data-table-ux-with-css-2ngi)).

**Applicants of an offer** (`/admin/ofertas/[id]/postulantes`): this is where the Office spends most of its time.
```
DESKTOP (xl: split view)                                         PHONE
┌ Repositor · Demo   [Tabla | Etapas]  [☐ solo dom. verificado] ┐ ┌ Repositor · Demo     ┐
├──────────────────────────────┬───────────────────────────────┤ │ [Tabla|Etapas]       │
│ FUNES (5)                    │ [Foto] Juan Pérez  Funes ✓dom. │ │ FUNES (5)            │
│ ☐ Juan Pérez   ✓dom.  hace 2d│ Rubros · CV (armado / PDF)     │ │ ☐ Juan Pérez  ✓ dom. │
│ ☐ Lucía Gómez  pend.  hace 1d│ ─ Historial ────────────────── │ │   hace 2 d       ›   │
│ OTRAS LOCALIDADES (3)        │ ● 20/10 Se postuló             │ │ OTRAS LOC. (3)       │
│ ☐ Marcos Ruiz  Roldán hace 3d│ ● 18/09 Preselec. en Cajera    │ │ …                    │
│                              │ Notas privadas [__________]    │ ├──────────────────────┤
│                              │ [Preseleccionar] [Rechazar ▾]  │ │ 2 elegidos [Presel.] │ ← sticky
├──────────────────────────────┴───────────────────────────────┤ │ [Rechazar ▾]         │
│ 2 elegidos  [Preseleccionar 2] [Rechazar 2 ▾ motivo]  sticky │ └──────────────────────┘
└──────────────────────────────────────────────────────────────┘
Etapas view: Pendiente 9 │ Preseleccionado 3 │ Entrevista 1 │ Contratado 0 (columns, scroll-x on phones)
```
The candidate panel opens on the right from `xl` and as its own page below that. Its history is a timeline (MoJ style) built from dates we already store (`created_at`, `fecha_preseleccion`, status changes, follow-ups). The bulk bar shows the selected count and the reason picker, so the button itself says what will happen ("Rechazar 2 · cupo completo"). That keeps the one-notice rule while making a bulk rejection explicit.

**Indicadores** (`/admin/indicadores`):
```
DESKTOP                                                    PHONE
┌ Período: [30 días][Este año][Todo]                  ┐   ┌ [30 d][Año][Todo] ┐
├────────────┬────────────┬────────────┬──────────────┤   ├───────────────────┤
│Postulantes │Contratados │Tasa de     │Días para     │   │ Postulantes  412  │
│ 412  ▁▂▃▅▆ │ 23   ▁▁▂▃▅ │empleab. 8% │cubrir: 12    │   │ ▁▂▃▅▆ Funes 71 %  │
│Funes 71 %  │            │23 de 290   │(mediana)     │   │ Contratados   23  │
├────────────┴────────────┴────────────┴──────────────┤   │ …(tiles stacked)  │
│ Embudo: postulaciones → preselec. → entrevista → contr.│ │ Embudo (vertical) │
├──────────────────────────┬──────────────────────────┤   │ Rechazos          │
│ Rechazos por motivo      │ Derivaciones a cursos    │   │ Derivaciones      │
│ (barras + tabla)         │ (barras + tabla)         │   └───────────────────┘
└──────────────────────────┴──────────────────────────┘
```
Each tile shows a number, a short label, the comparison that gives it meaning ("23 de 290") and a small sparkline. Every chart has an accessible table behind it ("Ver datos"). Charts are CSS/SVG with no new dependency.

### 4.4 Visual language (same portal, calmer)

- **Reuse:** `MarcoArea` + `NavegacionArea` (tabs and bottom bar), `BandaBienvenida` + `FondoMarca` (Bandeja only, compact on the rest), `PaginaArea`, `TarjetaSeccion`, `NotaLateral`, `LogoEmpresa`, `Avatar`, `SeguimientoPostulacion`, `TextoOferta`, `AvisoFormulario` toasts, `esqueleto` skeletons, `PantallaEstado`, `Selector`.
- **New shared pieces** (`src/components/admin/`):
  - `TablaAdmin`: a table that turns into cards below `lg`.
  - `BarraSeleccion`: the sticky bulk bar.
  - `FiltrosLista`: search plus chips kept in the URL.
  - `ColaBandeja`.
  - `LineaTiempo`.
  - `PanelCandidato`.
  - `TarjetaIndicador` (with a sparkline).
  - A count badge prop on `NavegacionArea` items.
- **Motion:** quieter than the public portal, because staff use these screens for hours. Keep entrance motion, the leaving row (optimistic), counters that tick when a queue changes, and a small festejo when a queue reaches zero. No moving shine on tables. Everything stays behind `motion-safe`.
- **Color:** brand green and the existing semantic tokens only. Statuses reuse the badges already in the job seeker and company areas. One possible new token, `aviso` (amber), for overdue queues and follow-ups (decision **D7**). It is always paired with an icon and text.
- **Density:** tables use `text-sm` with 44 px rows (still tappable). Cards on phones keep the current spacing.
- **Keyboard:** everything is reachable by Tab. In the split view, ↑/↓ move between candidates (optional, desktop only).
- **Responsive checks per branch:** 360, 390, 768 and 1280 px; `scrollWidth === innerWidth`; bottom bar and sticky bulk bar never overlap (the bulk bar sits above the area bar on phones).

### 4.5 Team feedback (2026-10-21) and what it changes

1. **No 2-month follow-up of hires.** There are too many people for the Office to call. `/admin/seguimientos`, the "Seguimientos vencidos" queue and the retention metric are dropped. `AGENTS.md` §2 ("a `contratado` job seeker enters follow-up every 2 months") and the ROADMAP item change with this. The `seguimientos` table stays unused, with no destructive migration (decision **D9**).
2. **Metrics with more detail, plus a weekly report.** See §4.6.
3. **Live visitors counter.** See §4.7.
4. **Offer cards that say more.** Two signals:
   - Priority chosen by the company: "Urgente" or "Sin apuro".
   - Demand computed by the system: "Muy solicitada", "Pocos postulantes" and "Nueva".
   See §4.8.
5. **Courses become a materials section.** Informal resources such as interview preparation, food handling and how to write a CV, given as PDFs, videos or links. The portal **suggests them automatically after 2 rejections**, and the Office can still recommend one by hand. See §4.9.

### 4.6 Indicadores and the weekly report

Every number below comes from data the system already records (plus `fecha_contratacion`, D3, and `fecha_envio`, D10), so nobody has to type anything:

| Group | Indicators | Why the Office cares |
|-------|-----------|----------------------|
| People | New job seekers per week; Funes vs. other towns and top towns; % with a CV; % of Funes residents with a verified address | Reach of the portal; who still needs help finishing the profile |
| Companies and offers | New and verified companies; offers sent, published and rejected (by reason); **days from sending to publishing** (the Office's own speed); offers with no applicants after 7 days | Workload and bottlenecks |
| Matching | Funnel: applications → pre-selected → interview → hired, with the conversion at each step; **days to fill** (published → first hire, median); urgent offers still open | Whether intermediation works |
| Supply vs. demand per category | Published offers vs. job seekers interested in each category, plus applications per offer | Where courses are needed and where companies will struggle (e.g. many offers in Gastronomía, few people) |
| Outcomes | Hires; employability rate (D4); rejections by reason; materials suggested and opened | The numbers the Municipality reports |
| Activity | Online now (§4.7); active in the last 7 days | Whether the portal is alive |

**Weekly report**: a "Descargar reporte" button on Indicadores. It covers the last full week (Monday to Sunday) by default, with a week picker, and compares each figure with the previous week (▲ / ▼).

- **PDF:** a one-page summary with the municipal look: the KPIs, the funnel, the top categories, the offers that need attention and a short "lo destacado" in plain words.
- **Excel:** one sheet per group above, with the detail rows (offers, counts per category, per town). It never includes DNI, phone or address, only aggregates and offer or company names (AGENTS.md §3).
- **Generation:** both are built on the server by a Route Handler for Admins only (`/api/admin/reporte?semana=…&formato=pdf|xlsx`).
- **Dependencies (decision D11):** `exceljs` for the `.xlsx` and `@react-pdf/renderer` for a real PDF download. The zero-dependency alternative is a print-styled page plus "Guardar como PDF", and CSV instead of Excel.
- **Optional, with branch I:** email the report to the Office every Monday morning with a Vercel cron.

### 4.7 "En línea ahora"

- **How it works:** Supabase Realtime **Presence**, already part of `@supabase/supabase-js`, so no new dependency and no table. Every open tab joins one channel with a random key and its area (público, postulante or empresa). It sends no name, id or IP, so there is no personal data.
- **Where it shows:**
  - **Admin:** the Bandeja and Indicadores show "12 personas en el portal ahora", with a soft pulsing dot and a breakdown by area.
  - **Landing:** it could show "personas buscando trabajo ahora" only above a minimum, say 5, because a "1" looks empty (decision **D12**).
- **"Active in the last 7 days":** it comes from `auth.users.last_sign_in_at` through a `security definer` function that only Admins can call.
- **Limits and config:**
  - The free plan allows 200 concurrent Realtime connections, enough for Funes. The landing counter is the first thing to switch off if traffic grows.
  - The CSP in `next.config.ts` needs `wss://<project>.supabase.co` in `connect-src`. That is a config change, so it needs approval (**D12**).

### 4.8 Offer priority and demand badges

- **Priority (company):** when creating or editing a draft, "¿Qué tan rápido necesitás cubrirla?" offers **Urgente** or **Sin apuro**, defaulting to Sin apuro.
  - It needs the migration `ofertas.prioridad` (enum `normal` | `urgente`) and the column in `ofertas_publicas` (D10).
  - The Office sees urgent offers first in "Ofertas por revisar" and can switch an offer back to normal if the company marks everything as urgent.
- **Demand (system), computed in `ofertas_publicas` as aggregates only:**
  - "Muy solicitada": in the top 20 % by applications, minimum 10.
  - "Pocos postulantes, ¡buena chance!": 3 or fewer after 5 days.
  - "Nueva": published in the last 3 days.
  - The exact count is never shown publicly, only the badge, so the number does not put people off.
- **Where:**
  - `TarjetaOferta`: badge with an icon and a soft accent. Urgent uses the `aviso` token (D7) with a lightning icon.
  - `/ofertas`: sorting by "Más recientes", "Urgentes primero" or "Más solicitadas".
  - The landing carousel puts urgent offers first.
  - "Ofertas para vos" highlights "Pocos postulantes".
- **Company side:** "Mis ofertas" shows the real count.

### 4.9 Courses as a materials section

- **Public route:** `/cursos`, the "Aprendé y preparate" section, open to everyone because it is municipal help (decision **D13**). Cards are grouped by topic: Entrevistas, CV, Manipulación de alimentos, Atención al cliente, and so on. Each card shows its type (PDF, video, link), the duration or page count, and opens the material.
- **Storage:**
  - PDFs go in a public bucket `materiales-cursos`.
  - Videos are YouTube or Drive links, never uploads, because Supabase's free storage is 1 GB.
- **Migration:** `cursos` gains `tema`, `tipo` (`pdf` | `video` | `enlace`), `archivo_url` and `orden`, plus the bucket (D10).
- **Automatic suggestion:** after a job seeker's **2nd rejection**, Mi panel shows "Te recomendamos estos materiales" with a kind message, picked by the categories of the rejected offers when possible. The rule is evaluated on read, so there is no job and nothing to store.
- **Manual recommendation:** the Office can still recommend a material from the candidate panel (`derivaciones`). It shows the same way with "Te lo recomendó la Oficina de Empleo".
- **Admin:** `/admin/cursos` lets the Office upload, edit and order materials, and shows how many times each was opened. That needs a tiny counter column, or the "abiertos" metric is left out.

## 5. Features, by branch (one PR each, from `main`, never stacked)

### A. `feature/admin-base` — no migration
- `NavegacionAdmin` with pending-count badges, `/admin` Bandeja with the five queues (counts + oldest age + link, empty queues collapsed into "al día"), the shared `TablaAdmin` / `FiltrosLista` pieces (§4.4), `src/lib/admin/*.ts` queries (server-only, Admin client via RLS, never the secret key).
- Loading / empty / error states for the area.
- Built 2026-10-21: the other sections are placeholders (`SeccionEnCamino`) so tabs and queue links never 404; `TablaAdmin` and `FiltrosLista` moved to branch B, their first user (no unused code in A).

### B. `feature/admin-ofertas` — no migration
- `/admin/ofertas`: tabs Por revisar · Publicadas · Todas; each row with company, category, age.
- Offer review page: the offer **exactly as job seekers will see it** (reuses `TextoOferta` and the public layout), company data at the side, and two actions: **Publicar** or **Rechazar** with a required reason (`motivo_rechazo`, already enforced by the trigger). Published offers can be closed by the Admin (state machine allows it).
- The company already sees the reason and can "Usar como base".
- Built 2026-10-21: chips Por revisar · Publicadas · Sin postulantes · Rechazadas · Cerradas · Todas with search (drafts are never listed: the company's private work); the review page reuses the public banner and sections (`DetalleOferta.tsx`), shows the history (`LineaTiempo`, moved up from D), applications by stage and the company's contact; rejecting offers frequent reasons as chips; the Admin can also take the urgency off or put it on; after deciding, "Revisar la siguiente" goes on with the queue.

### C. `feature/admin-empresas` — small migration
- `/admin/empresas`: Pendientes · Verificadas · Rechazadas; detail with every field, CUIT formatted and checked (`cuitValido`), ARCA certificate (signed URL), the company's offers.
- **Verificar** or **Rechazar** with a reason.
- Migration: `empresas.motivo_rechazo text` (required when `rechazado`, cleared when verified), and — **decision D1** — a rejected company that edits its data goes back to `pendiente` (same idea as the proof of address, Rule 4), so it can fix and be reviewed again. `AvisoEmpresaSinVerificar` shows the reason.

### D. `feature/admin-preseleccion` — no migration (maybe an index)
- `/admin/ofertas/[id]/postulantes`: every application of the offer, **Funes residents first, then other towns, each by application date** (Rule 4, decision 2026-10-13), address status as a badge, filter "solo domicilio verificado".
- Candidate panel: personal data, categories, CV built on the platform and the uploaded file (signed URL), photo (Admin may see it), previous applications, **private notes** (`notas_admin`, never shown to others).
- Two views over the same filters: table and pipeline by stage (§4.3); split view from `xl`; candidate history as a `LineaTiempo`.
- Actions per row and in bulk (`BarraSeleccion`): **Preseleccionar** (stamps `fecha_preseleccion`, the company starts seeing the candidate) or **Rechazar** with `cupo_completo` / `no_seleccionado` (Rule 10).
- `/admin/postulantes`: search by name/DNI, category, town and verified address, using the same candidate panel. (The Admin cannot apply on behalf of a job seeker: the insert policy is the job seeker's own; out of scope.)

### E. `feature/admin-domicilios` — small migration
- Queue of pending proofs with an inline preview (images shown, PDF opened by signed URL), person's name, town and address side by side.
- **Verificar** or **Rechazar**; decision **D2**: add `postulantes.motivo_domicilio text` so the job seeker reads why ("no se lee la dirección") next to "Subí otro".

### F. `feature/cursos` — migration
- Materials section `/cursos` (public), `/admin/cursos` to manage it, bucket `materiales-cursos`, new `cursos` columns (§4.9).
- Automatic suggestion after 2 rejections in Mi panel, plus manual "Recomendar material" from the candidate panel (`derivaciones`).
- Hire date `postulaciones.fecha_contratacion` (D3, for "days to fill"), stamped by the trigger, backfilled from `updated_at`.

### G. `feature/admin-indicadores` — no migration (maybe a view)
- Period filter (last 30 days / this year / everything).
- Figures: registered job seekers (Funes vs. other towns), verified companies, published offers, applications, pre-selections, interviews, hires, **employability rate**, rejections by reason, referrals to courses, materials suggested, supply vs. demand per category, days to publish and to fill, online now and active this week (§4.6, §4.7). KPI tiles with sparkline and comparison, each opening its list.
- **Decision D4**: employability rate = job seekers hired ÷ job seekers with at least one application, in the period.
- Charts built with CSS/SVG (no chart dependency), following the `dataviz` skill; accessible tables behind every chart.
- **Weekly report** in PDF and Excel (§4.6, D11) and the presence counter (§4.7, D12).

### J. `feature/ofertas-prioridad` — migration (can go before A)
- `ofertas.prioridad`, demand badges in `ofertas_publicas`, `ofertas.fecha_envio` stamped by the trigger on `borrador → pendiente` (§4.8, D10).
- Company form field, `TarjetaOferta` badges, `/ofertas` sorting, carousel and "Ofertas para vos" ordering, real counts in "Mis ofertas".

### H. `feature/admin-cuentas` — no migration
- `/admin/cuentas`: list of Admins (email, created at). **Crear Admin** (Rule 7): server-only action that checks the caller is Admin, then uses the secret key to `auth.admin.createUser({ email, email_confirm: true, app_metadata: { rol: "admin" } })` (the existing trigger creates the profile) and sends the password-recovery email so the new Admin sets their own password with the existing `/recuperar` flow. **Gotcha (seen 2026-10-21 creating the seed Admin):** GoTrue writes `app_metadata` after the insert, so `crear_perfil_nuevo_usuario()` does not see `rol = admin` and no profile is created; the action must insert the `perfiles` row itself (secret-key client) right after `createUser`. No delete from the app (Rule 7).

### I. `feature/notificaciones` — dependency + env vars
- `nodemailer` (decision **D5**, pending since 2026-10-01) with the Office's demo Gmail (`empleofunes.demo@gmail.com`, App Password) — env vars `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` on Vercel.
- `src/lib/email/` (transport, Spanish templates with the municipal look, `notificar()`), sent with `after()` so nobody waits and a failed email never undoes a change.
- Events (`email-notifications.md` §4.3): company verified/rejected; offer published/rejected; new pre-selected candidates; address verified/rejected; application pre-selected / interview / hired / rejected (soft wording for `cupo_completo`); referral to a course; optional daily summary to the Office.

## 6. Cross-cutting

- **Security:** every Server Action starts with `requerirRol("admin")`, validates input (`esUuid`, enums from `estados.ts`, length limits) and relies on RLS + triggers as the real authority. The secret key is used only in H. No personal data in logs.
- **State machines:** transitions already live in `src/lib/estados.ts` and the triggers; Admin actions only call them.
- **Optimistic UI** for queue actions (the row leaves the list right away, comes back on error), like the company's selection draft.
- **Demo data:** the seed needs a few pending companies, offers and applications (Funes and other towns) to show every queue (ROADMAP Phase 7 "realistic demo data"; can be done at the start of A).
- **Docs:** README / CLAUDE.md route tables and ROADMAP updated per branch.

## 7. Decisions needed

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | `empresas.motivo_rechazo` + a rejected company that edits its data goes back to `pendiente` | Yes: otherwise a rejected company has no way forward |
| D2 | `postulantes.motivo_domicilio` for rejected proofs | Yes: "Subí otro" without a reason is a guessing game |
| D3 | `postulaciones.fecha_contratacion` stamped by the trigger | Yes: "days to fill" needs a reliable hire date |
| D4 | Employability rate = hired ÷ job seekers with ≥1 application, per period | Yes, and show both numbers next to the rate |
| D5 | Install `nodemailer` and set the SMTP env vars on Vercel | Yes, in branch I |
| D6 | Order of branches | J → A → B → C → D (full demo flow) → I (emails) → E → F → G → H |
| D7 | New `aviso` (amber) token in `@theme` for overdue queues and follow-ups, always with icon + text | Yes: green cannot say "late", and red already means error |
| D9 | Drop the 2-month follow-up of hires (AGENTS.md §2, ROADMAP Phase 6); keep the `seguimientos` table unused | Yes, as the team decided; tell the tutor, since it came from the Office's requirements |
| D10 | Migrations: `ofertas.prioridad` + `fecha_envio`, demand columns in `ofertas_publicas`, `cursos` materials columns + bucket | Yes (branches J and F) |
| D11 | Report formats: `exceljs` + `@react-pdf/renderer` (real downloads) vs. print page + CSV (no dependencies) | Real downloads: the Office asked for "Excel o PDF" |
| D12 | Presence counter: Admin always; landing only above 5; CSP `connect-src` gains `wss://` | Yes |
| D13 | `/cursos` public (anyone) vs. only signed-in job seekers | Public: it is municipal help and brings people to sign up |

## 8. Estimate

| Branch | Effort |
|--------|--------|
| A base + Bandeja | 0.5–1 day |
| B ofertas | 1 day |
| C empresas (+ migration) | 1 day |
| D preselección + búsqueda (table, stages, split view) | 2–2.5 days |
| E domicilios (+ migration) | 0.5 day |
| F cursos / materiales (+ migration) | 1–1.5 days |
| J prioridad y demanda de ofertas (+ migration) | 1 day |
| G indicadores + reporte semanal + en línea | 2–2.5 days |
| H cuentas | 0.5 day |
| I notificaciones | 1–1.5 days |
| **Total** | **~11–14 days** |

## 9. Out of scope (v2 or later)

Admin applying on behalf of a job seeker; automatic matching or scores; follow-up of hires every 2 months (dropped 2026-10-21); super-admin that deletes Admins; audit log of who decided what (could be added later as `revisado_por` / `revisado_en` columns if the Office asks).
