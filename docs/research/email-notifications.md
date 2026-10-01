# Research — Status-change email notifications in v1

> Requested by the tutor: evaluate whether status notifications can move from v2 to the MVP.
> Criterion: **low effort → include in v1; otherwise → stays in v2.**
> Date: 2026-10-01. Status: **approved for v1 with Gmail SMTP** (team decision, as covered in class). Remaining decision in §7.

---

## 1. TL;DR

- **Effort: low (~1–2 days).** Recommendation: **include in v1** as best-effort notifications (a failed email never blocks a status change).
- We need a custom SMTP **anyway** for Phase 3: Supabase's default email provider only delivers to members of the Supabase project team and is capped at 2 emails/hour, so password recovery cannot work for real users without it.
- Proposed setup: **Gmail SMTP** (as the tutor suggested) for both Supabase Auth emails and our own notifications. The code is SMTP-agnostic, so moving to Brevo/Resend later is only a change of environment variables.
- Cost: one new dependency (`nodemailer`), which needs approval per `AGENTS.md` §9.

---

## 2. Constraints found

| Source | Constraint | Impact |
|--------|-----------|--------|
| Supabase default SMTP | 2 emails/hour, only to project team members, no SLA | Unusable for real users → custom SMTP is required for Phase 3 |
| Supabase with custom SMTP | Default auth email rate limit of 30/hour (configurable in *Rate Limits*) | Enough for the MVP; can be raised |
| Gmail SMTP (personal account) | ~500 recipients/day, requires 2FA + App Password, `smtp.gmail.com` port 465 (SSL) or 587 (TLS) | Enough for a municipal MVP; risk of landing in spam; not recommended for long-term production |
| Google Workspace account | 2,000 messages/day via SMTP | Better if the municipality has Workspace |
| Vercel (serverless) | No long-running background workers | Send inside the request using `after()` from `next/server` (runs after the response is sent) |

Estimated volume: tens of emails per day (a few companies, offers and applications per day). Well under Gmail's limit.

---

## 3. Options compared

| Option | Cost | Limits (free) | Needs own domain | Effort | Notes |
|--------|------|---------------|------------------|--------|-------|
| **Gmail SMTP** (tutor's proposal) | Free | ~500/day | No | Low | Simple, no new external services. Spam risk, App Password tied to one person's account. |
| Brevo SMTP | Free | 300/day | No (single sender verification), recommended for deliverability | Low | Same code as Gmail (SMTP). Listed by Supabase as a recommended provider. |
| Resend | Free | 100/day, 3,000/month | **Yes** — without a verified domain it only sends to the account owner | Low (API or SMTP) | Best DX, but needs a domain we may not control (municipal domain). |
| Supabase Edge Functions + DB webhooks | Free | Depends on SMTP used | — | Medium | More moving parts, logic outside Next.js. Not worth it for the MVP. |

**Decision (2026-10-01):** Gmail SMTP, ideally from an account owned by the Employment Office (not a developer's personal account). **Migration path:** Brevo or the municipality's own SMTP by changing env vars only.

---

## 4. Proposed design

### 4.1 Auth emails (Phase 3)
Configure Gmail SMTP in *Supabase → Authentication → SMTP Settings*. Customize templates (confirmation, password recovery) in Spanish. No code changes.

### 4.2 Status notifications (our code)

```
src/lib/email/
├── transport.ts     # "server-only"; nodemailer transport built from SMTP_* env vars
├── templates.ts     # one function per event → { subject, html, text } in Spanish
└── notificar.ts     # notificar(evento, destinatario) — catches and swallows errors
```

- Called from the Route Handlers that perform status transitions (the ones that use `src/lib/estados.ts`), wrapped in `after()` so the user does not wait for SMTP.
- Failures are logged without personal data and **never** roll back the status change.
- New server-only env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`.

### 4.3 Events (respecting rule 1 — the office is always the sender)

| Recipient | Event |
|-----------|-------|
| Empresa | Account `verificado` / `rechazado` |
| Empresa | Offer `publicada` / `rechazada` (with reason) |
| Empresa | New pre-selected candidates for an offer |
| Postulante | Address `verificado` / `rechazado` |
| Postulante | Application → `preseleccionado`, `entrevista`, `contratado`, `rechazado` |
| Admin | New pending company / new pending offer (optional) |

Emails contain only what the recipient may already see in the app, and link back to the portal instead of including personal data.

---

## 5. Effort estimate

| Task | Estimate |
|------|----------|
| Gmail account + App Password + Supabase SMTP config + Spanish auth templates | 1–2 h |
| `src/lib/email/*` (transport, templates, `notificar`) | 3–4 h |
| Hook into transition handlers (Phases 5–6, as they are built) | ~15 min per event |
| Manual testing | 1–2 h |
| **Total** | **~1–2 days**, spread across phases |

---

## 6. Risks

- **Spam folder:** Gmail-sent mail from an app may be flagged. Mitigation: plain, simple templates; move to Brevo/own domain if it becomes a problem.
- **Account ownership:** the App Password must belong to an Office account, not a developer's.
- **Daily cap:** ~500/day. Not a problem at the expected volume.
- **Secrets:** SMTP credentials are server-only (`AGENTS.md` §3).

---

## 7. Decisions needed

- [x] Provider: **Gmail SMTP** for Supabase Auth and our own notifications.
- [x] Status notifications move from v2 to **v1**.
- [x] Sender account: a **demo Gmail account created for the Employment Office** (not a developer's personal account). For production, the real office account replaces it via env vars.
- [ ] Approve installing `nodemailer` when the email task starts (`AGENTS.md` §9).

## Sources

- [Supabase — Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Google — Send email from a printer, scanner, or app](https://knowledge.workspace.google.com/admin/gmail/send-email-from-a-printer-scanner-or-app)
- [Brevo — Free SMTP server](https://www.brevo.com/free-smtp-server/)
- [Resend — Pricing](https://resend.com/pricing)
- [Resend — 403 error using resend.dev domain](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
- Next.js local docs: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`
