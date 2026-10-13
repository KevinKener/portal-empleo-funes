# Research: the job seeker's "Mi panel" and profile photo

> Date: 2026-10-13. Status: **decided** (§6), ready to plan.
> Scope: `/postulante` home ("Mi panel"), light gamification, the applications preview, offer suggestions, navigation inside the area, and an optional profile photo. Builds on [`postulante-ux.md`](postulante-ux.md) (task list, CV, applications timeline).

---

## 1. Summary

1. **One "next step" card at the top.** The panel always answers "¿qué hago ahora?" with a single primary action that changes with the person's situation (choose categories → build CV → apply → check a news item).
2. **Gamification as encouragement, never pressure.** An honest progress meter, the application tracker, and a short celebration **in the moment** when something good really happens. **No achievements shelf, streaks, points, rankings or guilt messages**: many users are unemployed, and the portal is a public service.
3. **"Mis postulaciones" becomes a real section**, not a footnote: a count per status, the last applications as compact cards with a 4-step tracker ("Enviada → Oficina → Empresa → Resultado"), and a full-width "Ver mis X postulaciones" button.
4. **"Ofertas para vos":** up to 3 published offers in the person's categories that they have not applied to yet. This is the most useful content a job seeker home can show, and it needs no schema change.
5. **Area navigation:** Inicio · Mi perfil · Postulaciones · Ofertas, as tabs on desktop and a bottom bar on phones.
6. **Profile photo: optional, visible only to the person and the Admin, never to companies.** Initials avatar by default. Needs a migration (bucket + column).

---

## 2. Findings

### 2.1 What job seeker homes show (LinkedIn, Indeed, Computrabajo, Bumeran)

- **Application status is the core.** LinkedIn shows the status of an application in three places: the email notification, the offer itself and "My Jobs" (submitted, viewed, CV downloaded). Indeed's "My Jobs" groups applications by status (interviewing, offer, hired, not selected).
- Argentine boards (Computrabajo, Bumeran) tell the person when their CV was **seen** ("CV visto", "CV leído") and use stages like "En proceso" and "Finalista". People value knowing that someone looked at them, even when there is no decision yet.
- **Recommended offers** based on the profile are the other fixed block in every job seeker home.
- Takeaway for us: our statuses are richer than "visto" (the Admin really reviews every application), so the panel should **tell that story**: who has the application now and what comes next.

### 2.2 Profile completion and gamification

- **LinkedIn "profile strength":** members start as *Beginner*, reach *Intermediate* after four sections and *All-Star* after seven. The level is **only visible to the person**, and the meter disappears once the profile is complete. Completeness is tied to a real benefit (being found in search).
- **Endowed progress effect** (Nunes & Drèze, 2006): a loyalty card that started with 2 of 10 stamps was completed by 34% of people, against 19% for a card of 8 starting from zero. Checklists that start with a step already done (account created) are completed more often. Our task list already counts "Revisar tus datos" as done.
- **Progress must be honest and must move.** Feedback that speeds up has the lowest drop-off; feedback that crawls has the highest. Inflated progress is perceived as manipulation. Landing.jobs explicitly avoided the "forever 99%" meter.
- **Explain the benefit of each step** ("Elegir rubros: así te mostramos ofertas para vos") instead of a bare checklist.
- **Do not block features behind completion**, except where a business rule requires it (our minimum to apply: one category + a CV).

### 2.3 Gamification for unemployed people: risks

- Research on gamified job-search tools for unemployed youth shows **promising but preliminary** results. It also reminds that long unemployment is linked to depression and lower self-esteem. Related interventions report low long-term engagement.
- **Streaks** (Duolingo) rely on loss aversion. Critics document anxiety, guilt-driven notifications ("sad owl") and a punitive reset. Even designers who defend them recommend protection against losing the streak and no punishment.
- Takeaway: a job search depends on things outside the person's control (there may be no offers in their category this week). Any mechanic that **punishes inactivity** or **compares people** is a bad fit. What fits:
  - celebrating real progress (profile ready, first application, a step forward in an application);
  - always showing a doable next step;
  - warm, plain language, and soft messages for bad news (we already soften `cupo_completo`).

### 2.4 Status trackers ("pizza tracker")

- Domino's tracker shaped most delivery apps: a few named stages, with the current one highlighted. Visible progress makes waiting feel better ("labor illusion").
- India's UX4G government design system has a **Status Tracker** pattern for public services: vertical journey timeline, "action required" alerts and rejection feedback screens.
- Warning: a tracker must be **accurate**. If a stage can take weeks, say so instead of implying speed.
- We already have this timeline on `/postulante/postulaciones` (`TarjetaPostulacion`). The panel needs a **compact** version: 4 dots and the current label.

### 2.5 Celebrations and motion

- Confetti and particles are the first thing to adapt for `prefers-reduced-motion`. The recommended approach is to **replace** the motion (an instant change or a short fade), not to remove the feedback.
- WCAG 2.3.3 (motion triggered by interaction) and 2.2.2 (anything moving for more than 5 s must be stoppable).
- Takeaway: celebrations last under 1.5 s, happen once per milestone, and use the `motion-safe:` variants we already use.

### 2.6 Public-service dashboards

- *Mi Argentina* (national government app) redesigned its home so people **choose which services appear**. It uses cards per area and notifications about ongoing procedures and expirations.
- The academic survey "Dashboard Design Patterns" (144 dashboards) notes there is surprisingly little design guidance for dashboards. A home for non-expert users fits the **narrative** genre: a few blocks telling "where you are and what's next", not charts.

### 2.7 Photo on the CV

- The City of Buenos Aires approved the **"Currículum Equitativo"** (2021): CVs may not include a photo, age, marital status, address or other sources of discrimination, and employers may not ask for them. It applies to the public and private sectors in CABA. Funes is not covered, but it is the reference in Argentina.
- That law built on INADI's recommendation No. 6 (2008) against discrimination in job offers. INADI was dissolved in 2024, so the recommendation is a background reference, not a current rule.
- Studies of photo-free CVs say they help but do not remove discrimination alone.
- Takeaway: if we add a photo, it must **never reach companies**. That is consistent with Rule 1 (the Admin is always in the middle) and with `candidatos_empresa`, which already hides DNI, phone and address.

---

## 3. Proposed panel

### 3.1 Layout (phone first)

```
┌──────────────────────────────────────┐
│ (KR)  ¡Hola, Kevin!                  │  avatar: photo or initials
│       Tu perfil está listo ✓         │  one-line status
├──────────────────────────────────────┤
│ PRÓXIMO PASO                         │
│ Hay 2 ofertas nuevas de Gastronomía  │  next-step card: one primary
│ [ Ver ofertas para vos ]             │  action, changes with state
├──────────────────────────────────────┤
│ Mis postulaciones                    │
│  ● 2 en revisión  ● 1 con la empresa │  count per status (chips)
│ ┌──────────────────────────────────┐ │
│ │ Mozo/a · Parrilla El Ombú        │ │
│ │ ●──●──○──○  La Oficina te        │ │  compact tracker
│ │             recomendó            │ │
│ └──────────────────────────────────┘ │
│  … up to 3 cards                     │
│ [   Ver mis 5 postulaciones   →    ] │  full-width secondary button
├──────────────────────────────────────┤
│ Ofertas para vos                     │  up to 3, in your categories,
│  Ayudante de cocina   NUEVA          │  not applied yet
│  …                                   │
├──────────────────────────────────────┤
│ Tu perfil  ▸ 3 de 3                  │  task list; collapses when done
├──────────────────────────────────────┤
│ Consejo de la Oficina                │  short tip, rotates
└──────────────────────────────────────┘
 [Inicio] [Mi perfil] [Postulaciones] [Ofertas]   ← bottom bar (phone)
```

Desktop: two columns. Left (2/3): next step, Mis postulaciones, Ofertas para vos. Right (1/3): profile, tip. Navigation as tabs under the header.

### 3.2 "Próximo paso" card (rules, first match wins)

| Situation | Message | Action |
|-----------|---------|--------|
| A celebration is pending (§3.5) | The celebration message | See §3.5 |
| No categories | "Elegí los rubros que te interesan y te mostramos ofertas para vos." | Elegir rubros |
| No CV | "Armá tu CV acá o subí el que ya tenés en PDF." | Armar mi CV |
| Proof of address rejected (Funes) | "Tu comprobante no se pudo verificar. Subí otro cuando puedas." | Subir comprobante |
| An application moved since the last visit | "¡Novedades! La empresa quiere entrevistarte para Mozo/a." | Ver postulación |
| New offers in their categories | "Hay 2 ofertas nuevas de Gastronomía." | Ver ofertas para vos |
| Nothing pending | "Todo al día. Te avisamos cuando haya novedades." | Ver todas las ofertas |

### 3.3 Mis postulaciones (replaces "Tus últimas postulaciones")

- Section title with total, chips with **count per status** in plain words.
- Up to 3 cards, **active ones first**, then newest. Each one: title, company trade name, the compact 4-step tracker and one sentence (reuse `ESTADO_POSTULACION_PARA_POSTULANTE`).
- Rejected: no tracker, the soft message we already have.
- Footer: full-width secondary button **"Ver mis N postulaciones"**, instead of the small "Ver todas" link.
- Empty state: illustration + "Todavía no te postulaste. Mirá las ofertas de tus rubros." + button.
- "Novedad" badge on a card whose status changed since the last visit (see §5).

### 3.4 Gamification: what we do and what we don't

| We do | We don't |
|-------|----------|
| Honest progress that starts with a step done, and shrinks once complete | Streaks or "días seguidos" |
| The application tracker as the main sense of progress | An achievements shelf: it repeats the task list and the tracker, and a locked "Primera entrevista" reminds people of what did not happen |
| One short celebration in the moment, once (§3.5) | Points, levels to compare, rankings between people |
| A next step that is always doable | Guilt or sadness messages ("te extrañamos") |
| Plain, warm language; soft bad news | Blocking features behind an incomplete profile (beyond the Rule to apply) |
| | Promising more chances ("40 veces más") without data |

**Decision (2026-10-13):** no achievements section. The panel is not a daily app and would only have 4–5 achievements; the space on the phone goes to applications and offers.

### 3.5 Celebrations in the moment

Only when something good really happens, **once**, inside the "Próximo paso" card (no modal, no sound, no vibration, never blocks the page):

| Moment | Message | Action |
|--------|---------|--------|
| Profile becomes ready to apply | "¡Tu perfil está listo! Ya podés postularte a las ofertas." | Ver ofertas para vos |
| First application sent | "¡Te postulaste por primera vez! La Oficina de Empleo va a revisar tu perfil." | Ver mi postulación |
| An application moves to `preseleccionado` | "¡Buenas noticias! La Oficina recomendó tu perfil para «Mozo/a»." | Ver postulación |
| An application moves to `entrevista` | "¡La empresa quiere conocerte! Te van a contactar para «Mozo/a»." | Ver postulación |
| An application moves to `contratado` | "¡Felicitaciones! Te contrataron para «Mozo/a»." | Ver postulación |

How it looks and behaves:
- The card switches to the soft green surface, the icon does a short "pop" (scale 0.8 → 1, ~300 ms) and, **only for `contratado`**, a short CSS burst of a few brand-colored dots (< 1.2 s). Pure CSS, no library.
- All motion uses `motion-safe:`; with reduced motion the card just appears with the message.
- Text is announced with `role="status"` for screen readers.
- A "Listo" link closes it; it also counts as seen once shown, so it never repeats on the next visit.
- Never for bad news: rejections keep their soft message in the tracker, with no special effect.
- "Already celebrated" is stored in `localStorage` (one key per moment and application). If storage is unavailable, the message is shown without the animation and nothing breaks.

### 3.6 Navigation inside the area

- Four entries: **Inicio** (`/postulante`), **Mi perfil** (a hub page grouping datos, rubros, CV, domicilio), **Postulaciones**, **Ofertas** (public listing filtered by their categories).
- Phone: bottom bar with icons + labels (thumb reach, always visible). Desktop: tabs under the header.
- Page title stays "Mi panel"; the nav entry says "Inicio" (shorter, standard).

---

## 4. Profile photo

**Proposal:** optional, never required, never shown to companies.

- Visible to: the person (panel, header) and the Admin (candidate lists in Phase 6, to recognize people at the Office).
- Not visible to: companies (`candidatos_empresa` keeps excluding it), the public portal.
- Default avatar: initials on a brand-colored circle.
- Upload: reuse `SubidaArchivo` and `achicarImagen` (square crop, ~512 px, JPEG). Delete at any time.
- Needs a **migration** (ask before writing it): private bucket `fotos-perfil` (JPEG/PNG, small limit), Storage policies (owner + Admin read), column `postulantes.foto_url`, and adding it to the "files must be in the owner folder" trigger.

---

## 5. Data and feasibility

| Feature | Data | Migration? |
|---------|------|------------|
| Next-step card | Profile summary + applications + offers | No |
| Count per status, compact tracker | `postulaciones` (readable columns) | No |
| Company name on the card | Through `ofertas_publicas`, only for published offers | No |
| Ofertas para vos | `ofertas_publicas` + `postulante_categorias` − already applied | No |
| `/ofertas` filtered by several categories | Today the filter takes one category | No (code change) |
| Celebrations | Derived from existing data | No |
| "Novedad" badges, "already celebrated" | Remember what the person already saw | `localStorage` (decided; per device, no migration). A column like `postulaciones.visto_por_postulante_at` stays as a later option |
| Profile photo | Bucket + column + policies | **Yes** |
| Recommended courses | `derivaciones` | Phase 6 |

---

## 6. Decisions (2026-10-13)

1. **Gamification:** light. Next step, progress meter, tracker and celebrations in the moment; **no achievements section**.
2. **"Novedad" badges and celebrations:** remembered in `localStorage`.
3. **Profile photo:** yes, as in §4: shown in the panel header, the Admin sees it, companies never.
4. **Navigation:** bottom bar on phones, tabs on desktop, and a "Mi perfil" hub page.
5. **Order:** before Phase 5.

---

## Sources

- LinkedIn Help — [Use the profile level meter](https://www.linkedin.com/help/learning/answer/391)
- Microsoft Learn — [LinkedIn Apply Connect: sync job application feedback](https://learn.microsoft.com/en-gb/linkedin/talent/apply-connect/sync-job-application-feedback)
- Indeed Help — [What is My Jobs?](https://www.indeed.com/help/job-seekers/articles/205332490-what-is-my-jobs), [Managing applied jobs](https://support.indeed.com/hc/en-us/articles/4412589551757-My-Jobs-Managing-Applied-Jobs)
- Computrabajo / Bumeran statuses — [¿Qué significa que la empresa ha leído tu currículum?](https://sensorautomotriz.com/preguntas-frecuentes/que-significa-que-la-empresa-ha-leido-tu-curriculum), [Computrabajo: consejos para tu búsqueda](https://soporte.computrabajo.com/hc/es/articles/17313939012882-Consejos-para-tu-b%C3%BAsqueda-de-empleo)
- Produktly — [Profile completion checklist](https://produktly.com/templates/profile-completion-checklist)
- Landing.jobs — [New candidate profiles](https://landing.jobs/blog/landing-product-2-1-new-candidate-profiles/)
- UX Collective — [Endowed progress effect](https://uxdesign.cc/endowed-progress-effect-give-your-users-a-head-start-97d52d8b0396), [From RPGs to UX: progress indicators](https://uxdesign.cc/from-rpgs-to-ux-how-progress-indicators-affect-user-engagement-8748f02d766a)
- JMIR Human Factors (2024) — [Gaming-based intervention for unemployed young adults](https://pmc.ncbi.nlm.nih.gov/articles/PMC10835587/)
- University of Oulu — [Gamified platform for unemployed youth](https://urn.fi/URN:NBN:fi-fe2019090627199); Publinova — [Kindle: how gamification can motivate jobseekers](https://publinova.nl/en/product/kindle-how-gamification-can-motivate-jobseekers)
- Smashing Magazine — [Designing a streak system](https://smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/); Screenwise — [When Duolingo gamification becomes stressful](https://screenwiseapp.com/guides/managing-duolingo-streaks-when-gamification-becomes-stressful)
- Entrepreneur — [How Domino's pizza tracker shaped delivery apps](https://www.entrepreneur.com/buying-a-franchise/how-dominos-20-year-old-pizza-tracker-shaped-nearly-every-delivery-app-you-use-today)
- UX4G (Government of India) — [Status tracker pattern](https://doc.ux4g.gov.in/web/llms/patterns/status-tracker-introduction.md)
- [Reduced motion spec](https://specification.website/spec/accessibility/reduced-motion/); [WCAG 2.3.3 Animation from interactions](https://www.disabilityworld.org/toolkit/standards/wcag/2-3-3-animation-from-interactions/)
- Bach et al. — [Dashboard Design Patterns](https://arxiv.org/abs/2205.00757v1)
- Mi Argentina — [App Store listing](https://apps.apple.com/ar/app/mi-argentina/id1107620792), [DPL News: renewed design](https://dplnews.com/?p=257869)
- Currículum Equitativo (CABA) — [iProfesional](https://www.iprofesional.com/management/352642-discriminacion-laboral-nuevas-medidas-para-el-cv-en-la-ciudad), [Derecho en Zapatillas](https://www.derechoenzapatillas.com/2021/nueva-ley-prohibe-las-fotos-y-nombres-en-los-cv/); Antal — [CVs without photo and age](https://antalintranet.antal.com/wp-content/uploads/2024/05/antal-international-analiza-el-impacto-de-los-cv-s-sin-foto-y-sin-edad-promueven-de-manera-efectiva-la-inclusion.pdf)
