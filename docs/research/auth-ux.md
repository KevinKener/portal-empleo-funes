# Research: UX/UI for Phase 3 (sign-up, sign-in, recovery)

> Date: 2026-10-13. Status: **proposal**, pending team review.
> Scope: how well-regarded public-service and job platforms design account flows today, and what we should adopt for Phase 3. Technical decisions already agreed (trigger creates the role row, server-side DNI/CUIT → email lookup) are not repeated here.

---

## 1. Summary

The best-rated government design systems (GOV.UK, ONS) and the current web platform guidance (web.dev, Baymard, WCAG 2.2) agree on a few points that matter for our users: many on phones, some not comfortable with digital tools, and our emails landing in spam.

Top recommendations, in priority order:

1. **Confirm the email with a 6-digit code, not a link.** Same mechanism as password recovery, no context loss when the mail app opens another browser, and it works with the `@supabase/ssr` PKCE flow on any device.
2. **Split the job seeker sign-up into 3 short steps inside one form** ("Tus datos" → "Contacto" → "Contraseña"), with an honest "Paso X de 3" indicator.
3. **Validate on blur, clear errors on every keystroke, confirm valid fields** (Baymard). The server stays the authority.
4. **Inputs sized for thumbs:** 44px targets and 16px text in auth forms (our current `Input` is 32px tall).
5. **No CAPTCHA, paste always allowed, show-password toggle**, password rules without forced character mixes (WCAG 3.3.8, NIST SP 800-63B rev. 4).
6. **"Revisá tu mail" screen** that shows the address, tells people to check spam, and offers resend and "cambiar mail".
7. **Motion only where it explains something,** with React's built-in `<ViewTransition>` (no new dependency) and `prefers-reduced-motion` respected.

---

## 2. Findings

### 2.1 Flow structure

- **Accounts only where needed.** GOV.UK: let users do as much as possible before asking for an account. We already do: browsing offers is public; the account is asked when the person presses "Postularme".
- **Make "create account" and "sign in" clearly different.** Showing both side by side is not enough; people confuse them. GOV.UK prefers "Create an account" over "Register"/"Sign up" → in our UI: **"Crear cuenta"** and **"Ingresar"**.
- **Focused sign-up screens:** no extra links or content that distract (GOV.UK).
- **Ask once:** no "repeat your email/password" fields (GOV.UK, web.dev, WCAG 3.3.7 Redundant Entry). Use a show-password toggle instead.
- **Multi-step forms:** useful when one screen would overwhelm; the progress indicator must be honest about the remaining work and allow going back (Visa design system, uxpatterns).
- **Progressive profiling:** ask the minimum at sign-up, the rest later with a visible benefit. Our schema requires DNI, name, city, address and phone at sign-up (NOT NULL), so the profile extras (categories, CV, proof of address) go to an onboarding checklist in Phase 4.

### 2.2 Email confirmation

GOV.UK "Confirm an email address":
- Show a "check your email" page right after sign-up **and** when someone tries to sign in before confirming.
- Show the address the email was sent to; allow resending and changing the address.
- Expire the link/code after one use, when a newer one is sent, and after a set time. Supabase defaults: 1 hour expiry, one email per 60 seconds.
- A **security code** is an accepted alternative to the link.
- Known failure points: slow delivery and **spam filtering** — which we already see with Gmail SMTP.

Why a code fits us better than a link:
- On phones, the email app often opens links in its own in-app browser, which has no session. With PKCE (`@supabase/ssr`), a link opened in another browser fails.
- One mechanism for confirmation and recovery (`verifyOtp`), one screen component, one template style.
- Supabase supports it: the template uses `{{ .Token }}` and the app calls `verifyOtp({ email, token, type })`.

### 2.3 Code input (OTP)

web.dev, Twilio, WCAG 3.3.8:
- **One field**, not 6 separate boxes: paste and autofill work, and splitting the code counts as forced transcription under WCAG 3.3.8.
- `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern="\d{6,10}"` (the length is a Supabase setting; the hosted project sends 8), never `type="number"`.
- Large, spaced digits (`text-2xl tracking-[0.5em]`) to look like a code without splitting the field.
- Validate when the length reaches 6 (Baymard: fixed-length fields).

### 2.4 Form fields

web.dev sign-in form best practices, applied to our fields:

| Field | Markup |
|-------|--------|
| DNI | `inputmode="numeric"`, accept dots (`30.123.456`) and normalize on the server |
| CUIT | `inputmode="numeric"`, accept dashes, check digit validated with a friendly message |
| Login identifier (DNI, CUIT or email) | `autocomplete="username"`, single label "DNI, CUIT o email" |
| Email | `type="email"`, `autocomplete="email"` |
| First/last name | `autocomplete="given-name"` / `"family-name"` |
| Phone | `type="tel"`, `autocomplete="tel"` |
| Address | `autocomplete="street-address"` |
| Legal/trade name | `autocomplete="organization"` |
| Password (sign-up/recovery) | `autocomplete="new-password"`, rules linked with `aria-describedby` |
| Password (sign-in) | `autocomplete="current-password"`, "¿Olvidaste tu contraseña?" right below |

Also:
- Labels above inputs, never placeholders as labels.
- Buttons named after the action ("Crear cuenta", "Ingresar"), not "Enviar".
- Disable the submit button while pending, with a visible spinner.
- Touch targets ≥ 44px and ≥ 16px text on mobile (also prevents iOS zoom on focus). **Our shadcn `Input` is `h-8` (32px)** → auth forms use a larger size.

### 2.5 Validation and errors (Baymard)

- Don't validate an empty field just because it received focus.
- Validate when the user **leaves** the field; for fixed-length fields (DNI, CUIT, code), when the length is reached.
- Re-check an existing error **on every keystroke** so it clears as soon as it is fixed.
- **Positive validation:** a check icon on valid fields.
- Keep submit-time validation: a summary at the top that receives focus, with links to each field.
- Messages say **how to fix** it: "El CUIT tiene 11 números, sin guiones" instead of "CUIT inválido".

React 19 gotcha: after a Server Action used as `<form action>`, React **resets the form**. When the server returns errors, the action must return the submitted values and the inputs must use them as `defaultValue`, or the person loses everything they typed.

### 2.6 Passwords and abuse

- NIST SP 800-63B rev. 4: no composition rules (forced uppercase/symbols), long passphrases allowed (≥ 64 chars), paste allowed. Minimum length: 15 when the password is the only factor; that is unrealistic for our users → **minimum 8**, set in Supabase (default is 6), with a hint: "Usá al menos 8 caracteres. Una frase es más fácil de recordar".
- Supabase "leaked password protection" (HaveIBeenPwned) appears to be Pro-plan only → out of scope.
- **No CAPTCHA** (GOV.UK, WCAG 3.3.8): rely on Supabase Auth rate limits.
- Generic errors on sign-in and recovery ("DNI/CUIT/email o contraseña incorrectos"; "Si la cuenta existe, te mandamos un código").

### 2.7 Accessibility (WCAG 2.2 AA)

- 3.3.8 Accessible Authentication: paste allowed, password managers work (correct `autocomplete`), single-field code.
- 3.3.7 Redundant Entry: no repeated fields.
- `aria-invalid` + `aria-describedby` on fields with errors; `aria-live="polite"` for status ("Te reenviamos el código").
- Focus moves to the error summary on failed submit and to the heading of each new step.

### 2.8 Motion and modern UI

Platform features we already have, with no new dependencies:

- **React `<ViewTransition>`**, supported by Next 16's App Router with no configuration (`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). Browsers without support work normally without the animation. Uses here:
  - Directional slide between sign-up steps (forward/back).
  - Crossfade from "Revisá tu mail" to "¡Cuenta confirmada!".
  - (Phase 2 polish, optional) morph of the offer card title into the detail heading.
- **`tw-animate-css`** (already installed): `animate-in fade-in slide-in-from-top-1` for error messages and the success state.
- **`prefers-reduced-motion`:** reduce to an instant change or a short fade (100–150 ms) via Tailwind's `motion-safe:` / `motion-reduce:`.
- Microinteractions that inform: button spinner while pending, check icon on valid fields, "Reenviar código en 0:45" countdown, an animated check after confirming.

Not recommended for the MVP: Motion/Framer Motion (extra dependency, not needed), Lottie, parallax, confetti.

### 2.9 Patterns seen in job platforms

Mostly vendor and case-study sources, so they are taken as trends, not evidence:
- Mobile-first, fast sign-up; social login (Google) is common (Computrabajo offers it).
- Visible application status: our state machine already covers it; Phase 4 shows it as a timeline.
- **Profile completeness checklist** (LinkedIn "profile strength"): 3–7 steps; starting with "Cuenta creada ✓" so it never shows 0% (endowed progress); each item explains its benefit; the bar must be honest.

---

## 3. Recommendations for Phase 3

### Adopt now (changes to the agreed plan)

| # | Change | Where |
|---|--------|-------|
| 1 | Email confirmation with a **6-digit code** instead of a link; drop `/auth/confirmar`, add a "verify" step | PR A |
| 2 | Job seeker sign-up in **3 client-side steps, one Server Action** at the end; company in 2 steps | PR A |
| 3 | Role choice screen with two large cards: "Busco trabajo" / "Soy una empresa" | PR A |
| 4 | `CampoFormulario` component: label, hint, error and valid state with the right ARIA; 44px inputs | PR A |
| 5 | Shared validation in `src/lib/validaciones/auth.ts`, used on blur in the client and again in the Server Action | PR A |
| 6 | "Revisá tu mail" screen: address shown, spam notice, resend with countdown, change email | PR A |
| 7 | Password: minimum 8 in Supabase, no composition rules, show toggle, no confirmation field | PR A (dashboard + UI) |
| 8 | `<ViewTransition>` between steps + `motion-safe` animations | PR A |
| 9 | Single field "DNI, CUIT o email" in sign-in; generic errors | PR B |
| 10 | Recovery reuses the code component from #1 | PR C |
| 11 | Spanish templates using `{{ .Token }}` with large, copyable code and the office as sender | PR A / C |

### Later (Phase 4–5)

- Onboarding checklist with honest progress for job seekers (categories, CV, proof of address).
- Status timeline for the company ("Cuenta en revisión") and for applications.

### v2 candidates

- Sign in with Google (less friction, but needs a Google Cloud OAuth setup, and the DNI is still required).
- Passkeys.
- WhatsApp notifications (very common in Argentina; needs a provider and costs).
- Leaked-password protection, if the project moves to Supabase Pro.

### Supabase dashboard settings (manual)

- Authentication → Sign In / Providers → Email: "Confirm email" on; minimum password length 8.
- Email templates: confirmation ("Confirm signup") and recovery ("Reset password") with `{{ .Token }}`.
- Keep the default OTP expiry (1 h) and resend interval (60 s).

---

## 4. Sources

- [GOV.UK Design System — Create accounts](https://design-system.service.gov.uk/patterns/create-accounts)
- [GOV.UK Design System — Confirm an email address](https://design-system.service.gov.uk/patterns/confirm-an-email-address)
- [ONS Design System — Create an account](https://service-manual.ons.gov.uk/design-system/patterns/create-an-account)
- [web.dev — Sign-in form best practices](https://web.dev/articles/sign-in-form-best-practices)
- [web.dev — SMS OTP form best practices](https://web.dev/articles/sms-otp-form)
- [Twilio — Best practices for OTP input forms](https://www.twilio.com/en-us/blog/developers/best-practices/otp-input-forms-html)
- [Baymard — Inline form validation](https://baymard.com/research-articles/inline-form-validation)
- [W3C — Understanding SC 3.3.8 Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [NIST SP 800-63B rev. 4 summary (Enzoic)](https://www.enzoic.com/blog/nist-sp-800-63b-rev4/) and [Schneier on the NIST rules](https://www.schneier.com/blog/archives/2024/09/nist-recommends-some-common-sense-password-rules.html)
- [Supabase — Passwordless email logins (OTP)](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase leaked password protection (third-party summary)](https://www.guardlayer.io/blog/supabase-leaked-password-protection)
- [Visa Design System — Wizard](https://design.visa.com/patterns/wizard)
- [Onboarding progress bars and endowed progress (Kompassify)](https://kompassify.com/blog/onboarding-progress-bar-guide)
- [Microinteractions guide (htmlburger)](https://htmlburger.com/blog/microinteractions-guide/)
- Next.js local docs: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`, `.../02-guides/authentication.md`
- Job portal trends (vendor sources, low confidence): [voizac](https://www.voizac.com/blog/top-features-every-modern-job-portal-should-have-in-2026), [developers.dev](https://www.developers.dev/tech-talk/features-of-job-portal-app.html)
