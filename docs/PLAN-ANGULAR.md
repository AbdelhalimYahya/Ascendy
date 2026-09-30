# Ascendy — Angular-Adapted Microtask Roadmap

> Original plan used Next.js. This doc maps every `[BE/FE/SETUP/QA/DEPLOY]` task to Angular equivalents. Feed tasks top-to-bottom, one at a time.

## Stack mapping

| Original (Next.js) | Ascendy (Angular 20) |
|---|---|
| App Router `/[locale]/` | Angular Router + `LanguageService` + `@ngx-translate/core`, `dir=rtl/ltr` on `<html>` |
| React Query + Zustand | Angular `HttpClient` + `authInterceptor` + Signals stores (`AuthStore`, etc.) |
| React Hook Form + Zod | Reactive Forms + Validators |
| shadcn/ui | Tailwind v3 + Ascendy design system (`glass`, `btn-primary`, `pill`, `mesh-hero`) |
| `next-intl` | `@ngx-translate/core` + `./assets/i18n/en|ar.json` |
| Monaco `@monaco-editor/react` | `monaco-editor` npm + Angular wrapper component (Phase 5) |
| Vercel Next.js hosting | Vercel static (Angular `dist/frontend`) + `API_URL` env |

## Routes (Angular)

- `/` landing (App shell hero) + `<router-outlet>`
- `/auth/login`, `/auth/register` (Reactive Forms, JWT storage)
- `/problems`, `/problems/:slug` (statement + Monaco + run/submit + feed + AI panel)
- `/paths`, `/paths/create`, `/paths/:id`
- `/profile/:username`, `/dashboard`, `/ai`

## Phases (same IDs, Angular notes)

- **PHASE 0** SETUP-001..012 — done: monorepo, NestJS boot, Angular boot + Tailwind + i18n RTL, Prisma schema, CI.
- **PHASE 1** BE-001..007 (NestJS Auth) + FE-001..004 (Angular login/register, AuthStore signal, guard, navbar).
- **PHASE 2** Users + competitiveMode toggle.
- **PHASE 3** Problems/Tags/TestCases/Links/Similar + Angular problems list/detail + add-problem form.
- **PHASE 4** Progress/streaks/mastery/speed-trends + Angular dashboard (Chart.js), mastery meters.
- **PHASE 5** Judge0 + Submissions + Monaco editor split-pane + run/submit/history.
- **PHASE 6** Roadmaps/Paths + Angular paths pages + followers list.
- **PHASE 7** Posts/Comments/Votes + Angular community feed + optimistic voting.
- **PHASE 8** AiModule (hint/explain/full/code_review) + Angular Ask-AI panel + general chat.
- **PHASE 9** Pagination, search, Swagger, AR/RTL QA, toasts/skeletons, responsive, QA e2e, deploy (Railway/Render + Vercel + Judge0 service).

## Conventions

- One microtask = one working testable commit, no task numbers in messages.
- Backend: `POST /auth/*`, `GET /users/:username`, `POST /problems`, etc. under `/api` prefix.
- Frontend: standalone components, lazy `loadComponent`/`loadChildren`, Signals, `provideHttpClient(withInterceptors([authInterceptor]))`.
- Secrets via env only. Free-tier only.
