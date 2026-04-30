# Changes Log

A chronological summary of all changes pushed to GitHub for the Shweta-Homeopathy project, grouped by date. Author: Pratik Khanapurkar.

---

## 2026-03-29 — Project Bootstrap
Initial scaffolding and first wave of iterations to get the site up.

- `faf28fc` first commit
- `7862b58` final
- `38f2109` final
- `e37b8bc` final
- `7eab537` final
- `6112fcd` final
- `b93e550` final
- `29315ce` final
- `abcea3c` f

## 2026-03-30 — Stabilization Pass
Continued iteration on the initial release.

- `4b46c3a` final
- `b70ceec` final
- `0bc3a59` final
- `f487d58` final

## 2026-04-02 — Modernization
- `c1fa68a` modern — modernization pass on the codebase / UI.

## 2026-04-06 — Google Sheets Migration
- `e49ae0b` feat: migrate data to Google Sheets, remove scramble animation, clean `.gitignore`.

## 2026-04-10
- `bdcc85c` fix — general fixes.

## 2026-04-11 — Sheets Reliability & Email Switch
Hardened the Google Sheets integration and moved email delivery off the Google API.

- `aa79352` fix: add retry logic and auth caching to Google Sheets, improve appointment error UX.
- `a8eff93` fix: replace ES2018 regex flag with a compatible pattern.
- `82299fe` fix: loosen `readCSV` generic constraint for the TS build.
- `df25d34` fix: add concurrency limiter and quota-aware backoff for Sheets API.
- `380bc76` fix: make email sending non-fatal in appointment and contact APIs.
- `63039f3` feat: switch email from Google API to SMTP using a Gmail App Password.

## 2026-04-12 — Appointment UX & Content Polish
- `275552b` fix: remove emojis from appointment form, upgrade email templates.
- `0177c97` feat: add AI-generated illustrations to appointment type buttons.
- `e995baf` fix: Read Full Profile link, hover text visibility, condition card icons.
- `06c21ee` fix: sanitize tab characters and whitespace in condition data from Sheets.
- `6f62aa7` fix: allow external image hostnames, cache landing/tracking config.
- `61c3187` v3-fix — v3 polish round.

## 2026-04-13 — Performance, Leads Sheet, Branding
- `0b2e1be` fix: font preloads, condition 404s, appointment 500.
- `691d286` fix: auto-create Leads sheet tab, skip retries on bad range, SMTP guidance.
- `5baccef` chore: trigger redeploy with new SMTP env vars.
- `1cf575d` fix: redesign header logo SVG to match actual brand identity.
- `4591e8c` fix: use actual brand logo in header instead of custom SVG.

## 2026-04-15
- `b948b3e` f
- `b9537c1` f
- `2d0e5dc` f

## 2026-04-16 — Chat Audio Input & Sheet/Drive Hardening
- `006b251` chat as audio i/p — add audio input to chat.
- `4491454` fix
- `39e7803` fix
- `c329e38` fix
- `b1ed444` fix
- `c120c6b` fix
- `4c60c19` fix: graceful Drive folder creation, expose real API errors.
- `05b624a` fix: handle missing sheet tabs in `ensureHeaders`.
- `d3811d1` fix: catch `readSheet` error in `getConditionRows`, stop build-time spam.
- `7435583` fix: use `ensureSheetTab` to actually create missing sheet tabs.

## 2026-04-25
- `b8aecb8` fix — general fix.

## 2026-04-28
- `97deafa` fixes — general fixes.

---

_Total commits: 47 (from 2026-03-29 to 2026-04-28)._
_Generated from `git log` history._
