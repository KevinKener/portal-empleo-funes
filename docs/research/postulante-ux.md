# Research: UX/UI for Phase 4 (job seeker profile and applications)

> Date: 2026-10-13. Status: **proposal**, pending team decisions (§4).
> Scope: profile, CV (built or PDF), categories, proof of address and residence priority, applying, and "Mis postulaciones". Builds on [`auth-ux.md`](auth-ux.md) (field sizes, validation timing, motion).

---

## 1. Summary

1. **Profile as a task list** ("Completá tu perfil"): 3–4 tasks with honest statuses, done in any order, over several sessions (GOV.UK "Complete multiple tasks").
2. **Structured CV with "add another"** (experience, education) **or a PDF**, both valid (Rule 6). Free-text "Sobre mí" stays.
3. **Residence as a priority, not a filter:** only people who say they live in Funes are asked for a proof of address. Funes residents always come first; inside each group, order of application; the address status is a badge and the Admin can turn on "Verificados primero" (Rule 4). Nobody is blocked.
4. **Categories as large toggle chips** backed by real checkboxes.
5. **Apply in one tap** once the minimum profile is ready, with an inline checklist when it is not.
6. **"Mis postulaciones" as a status timeline** written in plain words, with a soft message for `cupo_completo`.
7. **Files go from the browser straight to Supabase Storage** (Vercel functions cap request bodies at 4.5 MB; our limit is 5 MB). Phone photos are shrunk in the browser before uploading.

---

## 2. Findings

### 2.1 Public and municipal employment portals

- Argentina's national **Portal Empleo** (free, public) gathered about 2 million job seeker profiles; municipalities can adopt it to centralize local searches (World Bank, argentina.gob.ar).
- Municipal portals (e.g. Pergamino) generate the CV automatically from the profile data the person loads; Bariloche lets people register on their own without waiting for an interview, while the office keeps doing guidance interviews.
- Takeaway: a **profile-generated CV** is the norm for public services, and a PDF is the fallback for people who already have one, which matches Rule 6.

### 2.2 Profile completion (task list)

GOV.UK "Complete multiple tasks":
- For longer transactions completed over several sessions; shown at the start of each session.
- Tasks named with verbs; statuses kept minimal: **Completo**, **Pendiente**, and **No disponible todavía** only when a task depends on another (not linked).
- Let people complete tasks **in any order**.
- Red only for real errors.

Profile progress meters (LinkedIn-style "profile strength"): 3–7 steps, never start at 0% (account creation counts as done), each item explains its benefit, and the bar must be honest.

### 2.3 CV builder: "add another"

GOV.UK / DWP "Add another thing":
- One question page (or card) per item, then a **summary list** with "Agregar otra", "Cambiar", "Eliminar" and "Continuar".
- Say if there is a maximum.
- Removing an item must not silently change other data.

Job platforms (Indeed Profile, municipal portals) use the same sections: contact, experience, education, skills, summary. Uploaded PDFs are often converted into a uniform template; we keep the PDF as-is and show it through a signed URL.

### 2.4 File upload

GOV.UK File upload:
- Ask for uploads only when they are critical to the service.
- Clear label; visible drop zone on desktop; **do not use `required`**.
- One specific error per case: "El archivo tiene que ser PDF, JPG o PNG", "El archivo tiene que pesar menos de 5 MB", "El archivo está vacío", "No pudimos subir el archivo, probá de nuevo".
- Allow reusing a file already uploaded instead of asking again.

Mobile:
- `accept="application/pdf,image/jpeg,image/png"` **without `capture`**: phones then offer both "take photo" and "choose file". `capture` forces the camera and blocks choosing an existing PDF.
- Phone photos are often 3–8 MB. Shrinking them in the browser (canvas → JPEG, longest side ~2000 px) keeps them readable and under the limit, with no new dependency.

Platform:
- **Vercel functions reject request bodies over 4.5 MB** (hard limit on every plan), and that includes Server Actions. Our buckets allow 5 MB, so files must go **directly from the browser to Supabase Storage**. The existing Storage policies already let the owner write in `<auth uid>/…`; the Server Action then only records the path after checking the prefix.
- Viewing a file uses a short-lived signed URL (AGENTS.md §3).

### 2.5 Categories (multi-select)

- Chips have larger tap targets than checkboxes on phones and suit short, multi-select labels; checkboxes are better for long labels and precise forms (UX Movement, Cieden, Material/SAP guidance).
- Our categories are short ("Gastronomía", "Comercio"), so: **chips that are real `<input type="checkbox">` inside a `<label>`**, styled as pills, with a check icon when selected. Keyboard and screen readers keep native behavior.
- Don't mix single and multi-select chips on the same page.

### 2.6 Applying

- Fewer steps raise completion; Phenom's benchmark reports most leading employers offer mobile applications in **3 steps or less** and use progressive disclosure. The trade-off of "one-click" apply is volume over quality, but here the **Office pre-selects** (Rule 1), so the profile itself is the filter.
- Pattern: if the minimum profile is ready, "Postularme" asks for one confirmation ("La Oficina de Empleo va a ver tu perfil y tu CV") and shows success immediately (optimistic UI). If not, it shows the missing items inline with links, instead of a dead end.
- After applying, the button becomes "Ya te postulaste" (Rule 8, also enforced by the unique constraint).

### 2.7 Application status ("Mis postulaciones")

- Candidates' main questions: where do I stand, did anyone look at it, is the offer still open. Lack of feedback is the most common complaint in candidate experience research.
- Stage models use a few universal stages plus the system's exact wording. Our state machine maps to:

| Database | Job seeker sees |
|----------|-----------------|
| `pendiente` | **Enviada** · "La Oficina de Empleo está revisando tu perfil" |
| `preseleccionado` | **Preseleccionada** · "La Oficina envió tu perfil a la empresa" |
| `entrevista` | **Entrevista** · "La empresa quiere conocerte" |
| `contratado` | **¡Contratado/a!** |
| `rechazado` + `cupo_completo` | **Cupo completo** · "Se completaron los puestos de esta oferta. Tu perfil sigue activo para otras." |
| `rechazado` + `no_seleccionado` | **No seleccionada** · "Esta vez no avanzaste. Seguí postulándote." |

- The job seeker already can read `motivo_rechazo` (column grant in `20261008120100_correcciones_flujo.sql`) but **never** `decision_empresa` (Rule 11).
- Timeline as a horizontal stepper on desktop, vertical on phones; the current step highlighted; closed offers still listed.

### 2.8 Residence priority (Funes)

Context: Rule 4 says the job seeker uploads a proof of address, the Admin verifies it, and an unverified address does not block applying.

How public employers handle local priority:
- Residence gives **preference points or priority**, not exclusion (Washington D.C.: 10 bonus points; Albany, NY; Englewood).
- Proof is a document with the address: utility bills, bank statements, rental agreements, public assistance records (Oakland); the authority reviews the documents and misrepresentation cancels the preference (Massachusetts).

Applied to the portal:
- Asking a Rosario resident for a proof of address adds friction and gives the Office nothing to verify: they are not prioritized anyway. GOV.UK: only ask for uploads that are critical.
- The worry "then Rosario would rank above an unverified Funes resident" disappears if the priority is **by tier**, not by "has nothing pending":

| Priority | Who | Proof of address |
|----------|-----|------------------|
| 1 | Lives in Funes (any address status) | Asked for (optional, never blocks); status shown as a badge |
| 2 | Roldán, Rosario or another town | Not asked for |

- **Ordering inside the Funes tier (follow-up research):** list position strongly drives who gets shortlisted (fair-ranking user study, ScienceDirect 2025; top-ranked candidates get disproportionate recruiter attention; Applied randomizes review order for this reason). Document-upload requirements weigh most on older and phone-only users (NYC council review, NYDocSubmit, Vermont uploader pilot), the same people Rule 6 protects. A "verified" badge alone already raises trust (Nguyen et al., AIS THCI 2024; Taobao trust badge +4.43% sales). So sorting verified first by default would make the proof decisive in practice, against "does not block".
- **Decision:** inside each tier, sort by **application date** (neutral, explainable); show the address status as a **badge**; give the Admin a **"Verificados primero" toggle** and a **"Solo verificados" filter** (Rule 4: the Admin *can* prioritize verified ones). Built in Phase 6.
- The job seeker sees a clear benefit: "Si vivís en Funes, subí un comprobante: la Oficina lo tiene en cuenta al revisar tu perfil".
- Integrity: if the person changes address or town after being verified, the verification no longer applies → back to `pendiente` (or "not applicable" for other towns).

---

## 3. Recommendations for Phase 4

### Screens

| Route | Content |
|-------|---------|
| `/postulante` | Task list "Completá tu perfil" with progress + latest applications |
| `/postulante/datos` | Edit personal data (DNI read-only: only the Admin changes it) |
| `/postulante/rubros` | Category chips |
| `/postulante/cv` | "Sobre mí" + experience and education (add another) **or** PDF |
| `/postulante/domicilio` | Proof of address (only shown as a task when town = Funes) |
| `/postulante/postulaciones` | "Mis postulaciones" with status timeline |
| `/ofertas/[id]` | "Postularme" with confirmation, or inline checklist of what is missing |

### Minimum profile to apply (proposal)

Personal data (already complete from sign-up) + **at least one category** + **a CV in either format** (PDF, or "Sobre mí" plus at least one experience or education item). The proof of address is never required.

> **Changed 2026-10-20 (tutor review):** categories no longer block applying; the minimum is **a CV in either format**. Categories stay recommended because they feed "Ofertas para vos". When the CV is missing, the offer itself lets the person upload a PDF or build the CV and come back (`/postulante/cv?volver=<offer id>`).

### Technical notes

- Uploads: browser client → Storage (`<uid>/cv.pdf`, `<uid>/comprobante.<ext>`), `upsert` to replace, then a Server Action stores the path after checking it starts with the user's uid.
- Image shrinking with canvas in a small `src/lib/archivos.ts` helper; PDFs are uploaded as-is.
- `useOptimistic` for applying and toggling categories; `motion-safe` animations as in Phase 3.
- Loading skeletons, empty states ("Todavía no te postulaste a ninguna oferta") and error states on every screen (AGENTS.md §4).

### Proposed PRs

1. **PR D — Profile and categories:** migration (§4 decisions), task list, personal data, categories.
2. **PR E — CV and proof of address:** CV builder + PDF upload, proof of address upload.
3. **PR F — Applying and "Mis postulaciones".**

---

## 4. Decisions needed

| # | Decision | Recommendation | Needs |
|---|----------|----------------|-------|
| 1 | CV on the platform | Structured: tables `experiencias` and `formaciones` (owner-only RLS, Admin reads; companies in Phase 5 through `candidatos_empresa`) | Migration |
| 2 | Proof of address only for Funes residents; Funes first, verification as badge + optional Admin toggle (§2.8) | Yes | Update Rule 4 wording in `AGENTS.md` |
| 3 | Re-uploading a rejected proof returns it to `pendiente`; changing address/town after verification resets it | Yes | Migration (trigger on `postulantes`) |
| 4 | Minimum profile to apply (§3) | Category + CV in either format | — |

---

## 5. Sources

- [World Bank — First steps into employment in Argentina (2026)](https://www.worldbank.org/en/news/feature/2026/01/05/first-steps-into-employment-in-argentina-helping-build-a-better-future-of-work)
- [argentina.gob.ar — Portal de Empleo](https://www.argentina.gob.ar/sites/default/files/portal_de_empleo.pdf)
- [Pergamino — Portal Empleo ordinance](https://aplicativos.pergamino.gob.ar/hcd_admin/upload/3350-25.pdf) · [Bariloche municipal portal](https://www.anbariloche.com.ar/noticias/2021/10/28/82471-desde-el-municipio-habilitaron-un-nuevo-portal-de-empleo) · [Villa Carlos Paz employment office](https://villacarlospaz.gov.ar/images/secretarias/5/24/OFICINA%20DE%20EMPLEO%20MUNICIPAL.pdf)
- [GOV.UK — Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)
- [GOV.UK — File upload](https://design-system.service.gov.uk/components/file-upload) · [MOJ — Upload files](https://design-patterns.service.justice.gov.uk/patterns/upload-files)
- [DWP — Add another thing](https://design-system.dwp.gov.uk/patterns/add-another-thing/how-it-works)
- [Indeed resume builder review (Teal)](https://www.tealhq.com/post/indeed-resume-builder)
- [Phenom — State of candidate experience, conversion](https://stateofcx.anz.phenom.com/key-findings/conversion) · [Easy Apply trade-offs (Huntr)](https://huntr.co/blog/why-linkedin-applications-go-nowhere)
- [Application status stages (Job Shinobi)](https://jobshinobi.com/blog/job-tracking-status-stages-explained) · [MyGreenhouse application tracking](https://support.greenhouse.io/hc/en-us/articles/35745912017435-MyGreenhouse-Application-Tracking)
- [Chips vs checkboxes (UX Movement)](https://uxmovement.substack.com/p/start-using-chips-over-checkboxes) · [Cieden](https://cieden.com/book/atoms/checkbox/chip-components-or-checkboxes)
- [HTML `capture` attribute (freeCodeCamp)](https://www.freecodecamp.org/news/how-to-use-input-element-to-access-camera-on-mobile/)
- [Vercel — Bypass the 4.5 MB body size limit](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
- [Does fair ranking lead to fair recruitment outcomes? (ScienceDirect, 2025)](https://www.sciencedirect.com/science/article/pii/S0306457325004479) · [Applied — recruitment bias report](https://www.beapplied.com/blog/recruitment-bias-report-how-bias-affects-hiring-and-how-to-remove-it)
- [Verified badges and trust (AIS THCI, 2024)](https://aisel.aisnet.org/thci/vol16/iss2/4) · [Taobao trust badge study (University of Iowa)](https://now.uiowa.edu/node/4576)
- Document uploads and access: [NYC council review](https://council.nyc.gov/yusef-salaam/improving-web-based-application-forms-for-benefits-and-services-through-dss/), [NYDocSubmit](https://www.otda.ny.gov/policy/gis/2025/25DC004-Attachment-1.pdf), [Vermont uploader pilot](https://uidl.naswa.org/handle/20.500.11941/4539)
- Residency preference examples: [Washington D.C. EDPM](https://edpm.dc.gov/issuances/residency), [Massachusetts residency verification](https://www.mass.gov/doc/residency-verification/download), [Oakland workforce verification](https://www.oaklandca.gov/files/assets/city/v/1/workplace-employment-standards/documents/schedule-e-2-workforce-verification.pdf)
