# Ascendy — Problem Solving Tracker Platform

> Formerly "Sullam". Unified progress tracking, real roadmaps (Paths), in-browser code editor + judging, structured social layer, AI assistant, mastery & accountability — Arabic-first bilingual (AR/EN).

## Vision

Make competitive-programming / problem-solving progress easy to **track, practice, and share** — solving the 20 pain points of Codeforces, LeetCode, AtCoder, HackerRank, and Codewars.

Core pillars:
1. **Unified Progress Tracking** — one dashboard across all platforms
2. **Real, Personalized Roadmaps (Paths)** — structured, followable learning paths
3. **In-Browser Code Editor + Runner** — Monaco + Judge0 (JS/Python/C++/Java)
4. **Structured Social Layer per Question** — showcase posts + voting
5. **AI Assistant** — incremental hints, explanations, code review (not spoilers)
6. **Mastery & Accountability** — streaks, mastery meters, non-competitive mode, path followers
7. **Arabic-first bilingual** — full AR/EN + RTL

## Tech Stack (100% Free Tier, Angular edition)

| Layer | Choice |
|---|---|
| Backend | **NestJS** (Node.js, TypeScript), Prisma, PostgreSQL (Supabase/Neon), JWT (Passport) |
| Frontend | **Angular 20** (standalone, Signals, Router, HttpClient), Tailwind CSS v4, `@ngx-translate/core` (AR/EN + RTL), `monaco-editor`, Chart.js |
| Code Execution | **Judge0 CE** (self-hosted Docker on Railway/Render, or RapidAPI free quota for dev) |
| Storage | Cloudinary / Supabase Storage |
| AI | Abstracted provider (Anthropic / OpenAI / Groq / Gemini via env) |
| Hosting | Backend Railway/Render, Frontend Vercel, DB Supabase/Neon, Judge0 separate service |
| CI | GitHub Actions (lint + build) |

> **Angular adaptation note:** Original plan used Next.js App Router + React Query + Zustand + next-intl + shadcn/ui. Ascendy uses Angular equivalents: Angular Router with `/[lang]` prefix strategy via ngx-translate, Signals stores + HttpClient, Reactive Forms + Validators, Tailwind + custom Ascendy design system (no shadcn), `monaco-editor` wrapper component.

### Frontend routes (Angular Router)

- `/` — landing / dashboard redirect
- `/auth/login`, `/auth/register`
- `/problems` — browse/filter + search + hide-solved
- `/problems/:slug` — statement + Monaco editor + run/submit + social feed + Ask AI panel
- `/paths` — browse Paths, filter by goalType
- `/paths/create`, `/paths/:id`
- `/profile/:username`, `/dashboard`, `/ai`

### Backend modules (NestJS)

`Auth, Users, Problems, TestCases, Progress, Submissions/CodeEditor (Judge0), Roadmaps, Posts, Comments, Votes, Tags, Ai, Common (Prisma, guards, filters)`

## Monorepo layout

```
apps/
  backend/   (NestJS API)
  frontend/  (Angular app)
packages/
  shared-types/ (DTOs/interfaces, future)
prisma/ or apps/backend/prisma/
docker-compose.yml (local Postgres + Judge0 for dev)
```

## Local run (after Phase 0 completes)

```bash
# 1. Clone + env
git clone https://github.com/AbdelhalimYahya/Ascendy.git
cd Ascendy
cp .env.example .env
# fill DATABASE_URL, JWT secrets, JUDGE0_URL, AI API key

# 2. Install (npm workspaces)
npm install

# 3. DB (option A: Docker local)
docker compose up -d db
cd apps/backend
npx prisma migrate dev --name init

# 4. Run
npm run dev:backend  # nest start --watch (http://localhost:3000/api)
npm run dev:frontend # ng serve (http://localhost:4200)
```

Free-tier links: Supabase / Neon (Postgres), Railway / Render (backend + Judge0 Docker), Vercel (Angular frontend), Upstash (Redis later), Cloudinary.

## Design system — Ascendy stunning UI

- Theme: deep space navy `#0B1026` → indigo/violet gradients + emerald/mint accent `#10D9A3`, amber for streaks. Light + dark mode, glassmorphism cards, mesh gradient hero.
- Typography: `Space Grotesk` (EN display) + `Inter` (EN body) + `IBM Plex Sans Arabic` (AR), full RTL mirroring via logical properties + `dir` switch.
- Signature components: mastery rings, streak heatmap, difficulty pills, split-pane editor (statement | code+results), path timeline, showcase feed with voting.
- UX principles: responsive-first, empty states with CTAs, toasts (custom), skeletons, optimistic voting.

## Roadmap

See `docs/PLAN-ANGULAR.md` for the full Angular-adapted microtask roadmap (Phases 0–9). Tasks execute top-to-bottom, one at a time, each ending in a working testable state with a clean commit.
