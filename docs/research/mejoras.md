# Improvement ideas — after the company offer flow (2026-10-20)

> Scope: what else would make the portal more useful and more likely to be adopted, given who decides (the Employment Office, the tutor) and who uses it (companies in Funes, job seekers with mixed digital skills, mostly on phones).
> Status: proposals. Each one is approved separately before it is built.

## Summary

| # | Idea | Impact | Effort | Migration |
|---|------|--------|--------|-----------|
| 1 | Admin area (Phase 6) | Very high: the full flow can be demoed without the SQL Editor | High | Maybe (views) |
| 2 | Email notifications (Gmail SMTP, already approved) | Very high: nobody learns about changes today unless they log in | Medium | No |
| 3 | Company home with a "Próximo paso" card and a summary | High | Low | No |
| 4 | Offer fields: optional pay, number of vacancies, workplace | High | Medium | Yes |
| 5 | "Compartir por WhatsApp" on public offers | Medium | Very low | No |
| 6 | "Así la van a ver los postulantes" preview before sending to review | Medium | Low | No |
| 7 | Installable on phones (PWA manifest with the municipal shield) | Medium (demo) | Low | No (config: ask first) |
| 8 | "¿Necesitás ayuda?" button to the Office's WhatsApp | Medium | Very low | No (needs the number) |
| 9 | Text search and "Solo en Funes" filter on `/ofertas` | Medium, grows with volume | Medium | Maybe (location column, see #4) |

Suggested order: merge the current branches → #3 (closes Phase 5 together with company data + ARCA) → #5 and #6 → #4 before real offers are loaded → Phase 6 (#1, #2).

## Evidence and reasoning

### Notifications (#2)
- NTUC e2i (Singapore) piloted a "broadcast" of new jobs to workers without strong digital skills; job applications doubled and more than half of participants were shortlisted. Telling job seekers "there are new offers in your categories" is the same mechanism.
- Without emails, the job seeker never learns that a company wants to interview them, and the company never learns it has new candidates.

### Company home (#3)
- Recruitment dashboard guides agree on one principle: show the few things that need action, readable at a glance, instead of every metric.
- Reuses the job seeker's "Mi panel" pattern (`docs/research/panel-postulante.md`): one suggested next step, then a summary.

### Offer fields (#4)
- A field experiment over ~20,000 job posts reported about 49% more applications when pay was disclosed (vendor summary of Jalal, 2024; original not verified). A survey of 1,000 US adults found 44% are unlikely to apply without a pay range. Pay stays optional: the Office decides whether to ask for it.
- Very wide ranges discourage some applicants (Cornell, Journal of Applied Psychology, via SHRM): the form should ask for a reasonable range or an amount.
- Number of vacancies ties into Rule 10: once the company has hired that many, the system can suggest closing the offer and rejecting the rest as `cupo_completo` (the soft reason the tutor asked for).

### WhatsApp (#5, #8)
- Job offers in Funes already travel through WhatsApp; a `wa.me` share link brings people to the portal at no cost.
- Low-literacy job apps (EasyJob, Pakistan) borrow WhatsApp patterns because users already know them. A human one tap away helps people who get stuck more than any help text.

### Preview (#6)
- Fewer rejections for wording mistakes means less work for the Office, which is the stakeholder that adopts the system.

## Not recommended now
- Chat between company and job seeker: breaks Rule 1.
- Automatic candidate scores or rankings: takes the choice away from the Office and is delicate with personal data.
- Map: already in v2.

## Sources
- NTUC e2i, FindJobs app: https://www.e2i.com.sg/app
- Stanford GSB, jobs app for people with low literacy: https://www.gsb.stanford.edu/experience/news-history/social-innovation-fellow-creates-jobs-app-people-low-literacy
- Pin, salary range disclosure study: https://pin.com/blog/pay-range-application-volume-study
- Patriot Software, pay transparency survey: https://www.patriotsoftware.com/blog/payroll/pay-transparency-hiring-survey/
- SHRM, wide salary ranges: https://www.shrm.org/in/topics-tools/news/talent-acquisition/wide-salary-ranges-may-undermine-pay-transparency-goals
- Landing.jobs, employer dashboard: https://wp.landing.jobs/?p=14390
- Intervue, recruitment dashboards: https://ad.intervue.io/blog/recruitment-dashboards
