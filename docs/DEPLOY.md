# Ascendy Deploy (100% free tier)

## Backend — Railway / Render
1. Create Postgres (Supabase/Neon free) → copy `DATABASE_URL`.
2. Railway: New Service → from repo → root `apps/backend/Dockerfile` (or `npm run build --workspace=apps/backend` + `node apps/backend/dist/main.js`).
   Env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `JUDGE0_URL`, `JUDGE0_ENABLED`, `AI_PROVIDER`, `GROQ_API_KEY`.
3. Run once: `npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma`.
4. Check `https://<api>/api/health` and docs at `https://<api>/api/docs`.

## Judge0 — separate free service
- Option A (self-host): Railway/Render Docker → `judge0/judge0:1.13.0`, expose 2358, set backend `JUDGE0_URL` + `JUDGE0_ENABLED=true`.
- Option B (quick): RapidAPI Judge0 free quota → set `JUDGE0_URL`, `JUDGE0_HOST`, `JUDGE0_KEY`, `JUDGE0_ENABLED=true`.
- Dev default `JUDGE0_ENABLED=false` returns mocked verdicts so UI works without Judge0.

## Frontend — Vercel
1. Import repo → framework: Other → build: `npm run build --workspace=apps/frontend` → output: `apps/frontend/dist/frontend/browser` (or `dist/frontend`).
   Env: `API_URL=https://<api>/api` (bake into `src/environments/environment.prod.ts` or runtime config).
2. Arabic/RTL QA: toggle ع/EN, check `dir=rtl`, editor split-pane stacks on mobile.

## Smoke in production
Register → login → create problem + sample → Run → Submit (Accepted → progress) → post + vote → follow path → AI hint. See `apps/backend/test/app.e2e-spec.ts`.
