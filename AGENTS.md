# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Two-service architecture for the Tribal Wars (Plemiona) game automation bot:

- **Frontend** (this repo): Vue 3 SPA dashboard. Auth via Clerk SSO.
- **Backend** (separate repo: `WojciechxFalkowski/bot-plemiona`): NestJS API with MySQL (TypeORM). Clone into `/workspace/backend`.

### Tech stack

**Frontend:** Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Nuxt UI v3 + Pinia + Clerk + Firebase. Package manager: **npm**.

**Backend:** NestJS + TypeScript + TypeORM + MySQL + Clerk + Playwright + Firebase Admin. Package manager: **npm**.

### Full-stack setup

**Prerequisites:** Docker must be installed for local MySQL (see Docker setup below).

1. Clone backend: `git clone https://github.com/WojciechxFalkowski/bot-plemiona.git /workspace/backend`
2. Install backend deps: `cd /workspace/backend && npm install`
3. Start local MySQL: `sudo docker run -d --name mysql-plemiona -p 3307:3306 -e MYSQL_ROOT_PASSWORD=LinkinPark1 -e MYSQL_DATABASE=bot_plemiona_DEV -v mysql_data:/var/lib/mysql mysql:8.0`
4. Wait ~10s for MySQL to initialize, then run migrations: `cd /workspace/backend && npm run migration:run`
5. Create `/workspace/backend/.env` (see required variables below, use `DATABASE_HOST=localhost`)
6. The backend requires a Firebase Admin SDK JSON file at `/workspace/backend/plemiona-bot-notifica-220925-firebase-adminsdk-fbsvc-53d07b8d62.json`. Generate a placeholder with a valid RSA key if you don't have the real one (push notifications won't work, but the rest of the API will).
7. Build and start backend: `cd /workspace/backend && npx nest build && node dist/src/main.js` (port 7061)
8. Create `/workspace/.env` for frontend (see required variables below)
9. Start frontend: `npx vite --port 7060` (port 7060)

### Docker setup (for MySQL)

If Docker is not installed in the Cloud VM:
```
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin fuse-overlayfs
sudo mkdir -p /etc/docker && echo '{"storage-driver":"fuse-overlayfs"}' | sudo tee /etc/docker/daemon.json
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo dockerd &>/tmp/dockerd.log &
```

### Required environment variables

**Frontend** (`.env` at repo root):

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | App throws at startup without it |
| `VITE_BACKEND_PLEMIONA` | Yes | Set to `http://localhost:7061` for local backend |
| `VITE_VAPID_KEY` | No | Firebase push notifications |

**Backend** (`backend/.env`):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_HOST` | Yes | MySQL host |
| `DATABASE_PORT` | Yes | MySQL port (default 3307) |
| `DATABASE_ROOT_USER` | Yes | MySQL user |
| `DATABASE_ROOT_PASSWORD` | Yes | MySQL password |
| `DATABASE_NAME` | Yes | MySQL database name |
| `FRONTEND_URL` | Yes | CORS origin, set to `http://localhost:7060` |
| `BACKEND_PORT` | Yes | Backend port (7061) |
| `CLERK_SECRET_KEY` | Yes | Clerk server-side secret key |
| `PLEMIONA_USERNAME` | No | Game username for bot automation |

### Common commands

**Frontend** — see `package.json` scripts:

- **Dev server:** `npx vite --port 7060`
- **Build:** `npm run build` (type-check + vite build)
- **Type-check:** `npm run type-check`
- **Lint:** `npm run lint`
- **Unit tests:** `npm run test:unit` (Vitest)
- **E2E tests:** `npm run test:e2e` (Playwright)

**Backend** — see `backend/package.json` scripts:

- **Dev server:** `npm run start:dev` (NestJS watch mode, port 7061)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Unit tests:** `npm run test` (Jest)
- **Swagger API docs:** `http://localhost:7061/api` (when running)

### Non-obvious caveats

- The frontend app crashes on startup if `VITE_CLERK_PUBLISHABLE_KEY` is missing. A placeholder (`pk_test_placeholder`) lets the dev server start in development mode but authenticated routes won't work.
- ESLint has pre-existing warnings (unused vars, `no-explicit-any`) in both repos. These are not regressions.
- The Firebase messaging import in `src/firebaseConfig.ts` runs at module load time; may need mocking in non-browser environments.
- After login, a server must be selected from the sidebar dropdown (e.g., "Świat 226") before the full navigation menu appears.
- For local development, run MySQL in Docker on port 3307 (see setup steps above). The backend's database on a private network (e.g., `192.168.x.x`) is unreachable from the Cloud VM.
- The backend's `npm run start:dev` (NestJS watch mode) may exit silently in the Cloud VM. Use `npx nest build && node dist/src/main.js` instead for reliable startup.
- The backend uses `@nestjs/config` with `dotenv` — `.env` file must be at the backend root.
- Start order matters: backend first (port 7061), then frontend (port 7060).
- The `.env` files are gitignored. Configure secrets via Cursor Cloud Secrets.
