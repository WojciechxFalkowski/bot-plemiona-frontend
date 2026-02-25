# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Plemiona Bot Frontend — a Vue 3 SPA dashboard for a Tribal Wars (Plemiona) game automation bot. This is a **frontend-only** repository; all API calls go to an external backend (`VITE_BACKEND_PLEMIONA`). Authentication uses Clerk SSO.

### Tech stack

Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Nuxt UI v3 + Pinia + Clerk + Firebase (push notifications). Package manager: **npm** (lockfile: `package-lock.json`).

### Required environment variables

A `.env` file at the project root must contain at minimum:

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | App throws at startup without it |
| `VITE_BACKEND_PLEMIONA` | Yes | Backend API URL |
| `VITE_VAPID_KEY` | No | Firebase push notifications |

### Common commands

See `package.json` scripts. Key commands:

- **Dev server:** `npm run dev` (Vite, port 5173)
- **Build:** `npm run build` (runs type-check + vite build)
- **Type-check:** `npm run type-check` (`vue-tsc --build`)
- **Lint:** `npm run lint` (`eslint . --fix`)
- **Format:** `npm run format` (`prettier --write src/`)
- **Unit tests:** `npm run test:unit` (Vitest with jsdom)
- **E2E tests:** `npm run test:e2e` (Playwright — run `npx playwright install` first)

### Non-obvious caveats

- The app will crash on startup if `VITE_CLERK_PUBLISHABLE_KEY` is missing. A placeholder value (`pk_test_placeholder`) is sufficient to start the dev server and render the Clerk login UI in development mode.
- ESLint has pre-existing warnings (unused vars, `no-explicit-any`, etc.) in the codebase. These are not regressions.
- The Firebase messaging import in `src/firebaseConfig.ts` runs at module load time; in environments without browser APIs (e.g., SSR or certain test runners), this may need mocking.
- Authenticated routes require a valid Clerk session. Without real `VITE_CLERK_PUBLISHABLE_KEY`, you can only access unauthenticated routes (`/`, `/about`, `/sign-in`).
